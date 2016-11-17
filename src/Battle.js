'use strict';

var EventEmitter = require('events').EventEmitter;
var CharactersView = require('./CharactersView');
var OptionsStack = require('./OptionsStack');
var TurnList = require('./TurnList');
var Effect = require('./items').Effect;

var utils = require('./utils');
var listToMap = utils.listToMap;
var mapValues = utils.mapValues;

function Battle() {
  EventEmitter.call(this);
  this._grimoires = {};
  this._charactersById = {};
  this._turns = new TurnList();

  this.options = new OptionsStack();
  this.characters = new CharactersView();
}
Battle.prototype = Object.create(EventEmitter.prototype);
Battle.prototype.constructor = Battle;

Object.defineProperty(Battle.prototype, 'turnList', {
  get: function () {
    return this._turns ? this._turns.list : null;
  }
});

Battle.prototype.setup = function (parties) {
  this._grimoires = this._extractGrimoiresByParty(parties);
  this._charactersById = this._extractCharactersById(parties);
  this._states = this._resetStates(this._charactersById);
  this._fillStates();
  this._turns.reset(this._charactersById);

  this.characters.set(this._charactersById);
  this.options.clear();
};

Battle.prototype.start = function () {
  this._inProgressAction = null;
  this._stopped = false;
  this.emit('start', this._getCharIdsByParty());
  this._nextTurn();
};

Battle.prototype.stop = function () {
  this._stopped = true;
};

Object.defineProperty(Battle.prototype, '_activeCharacter', {
  get: function () {
    return this._charactersById[this._turns.activeCharacterId];
  }
});

Battle.prototype._extractGrimoiresByParty = function (parties) {
  var grimoires = {};
  var partyIds = Object.keys(parties);
  partyIds.forEach(function (partyId) {
    var partyGrimoire = parties[partyId].grimoire || [];
    grimoires[partyId] = listToMap(partyGrimoire, useName);
  });
  return grimoires;

  function useName(scroll) {
    return scroll.name;
  }
};

Battle.prototype._extractCharactersById = function (parties) {
  var idCounters = {};
  var characters = [];
  var partyIds = Object.keys(parties);

  partyIds.forEach(function (partyId) {
    var members = parties[partyId].members;
    assignParty(members, partyId);
    characters = characters.concat(members);
  });
  return listToMap(characters, useUniqueName);

  function assignParty(characters, party) {
    characters.forEach(function(character){
      character.party = party;
    });
  }

  function useUniqueName(character) {
   var nombre = character.name;
    if(!idCounters.hasOwnProperty(nombre)){
      idCounters[nombre] = 0;
      idCounters[nombre] ++;
      return nombre;
    }else{
      idCounters[nombre] ++;
      return nombre + ' ' + (idCounters[nombre]);
    }
  }
};

Battle.prototype._resetStates = function (charactersById) {
  return Object.keys(charactersById).reduce(function (map, charId) {
    map[charId] = {};
    return map;
  }, {});
};

Battle.prototype._getCharIdsByParty = function () {
  var charIdsByParty = {};
  var charactersById = this._charactersById;
  Object.keys(charactersById).forEach(function (charId) {
    var party = charactersById[charId].party;
    if (!charIdsByParty[party]) {
      charIdsByParty[party] = [];
    }
    charIdsByParty[party].push(charId);
  });
  return charIdsByParty;
};

Battle.prototype._nextTurn = function () {
  if (this._stopped) { return; }
  setTimeout(function () {
    var endOfBattle = this._checkEndOfBattle();
    if (endOfBattle) {
      this.emit('end', endOfBattle);
    } else {
      var turn = this._turns.next();
      this._showActions();
      this.emit('turn', turn);
    }
  }.bind(this), 0);
};

Battle.prototype._checkEndOfBattle = function () {
  var allCharacters = mapValues(this._charactersById);
  var aliveCharacters = allCharacters.filter(isAlive);
  var commonParty = getCommonParty(aliveCharacters);
  
  return commonParty ? { winner: commonParty } : null;

  function isAlive(character) {
    return !character.isDead();
  }

  function getCommonParty(characters) {
    var i = 1;
    var common = true;
    var partyIni = characters[0].party;
    
    while(common && i < characters.length){
     
      if(characters[i].party !== partyIni)
        common = false;
        i++;
    }
    if(common)
      return partyIni;
    else return null;   
  }
};

Battle.prototype._showActions = function () {
  this.options.current = {
    'attack': true,
    'defend': true,
    'cast': true
  };
  this.options.current.on('chose', this._onAction.bind(this));
};

Battle.prototype._onAction = function (action) {
  this._action = {
    action: action,
    activeCharacterId: this._turns.activeCharacterId
  };

  var self = this;
  var acciones = {
    attack: self._attack,
    defend: self._defend,
    cast: self._cast
  }
  this.emit(this._action, acciones[action].apply(this));

/*De esta manera se implementa con if
  if(action === 'defend')
    this.emit(this._action, this._defend());
  else if(action === 'attack')
    this.emit(this._action, this._attack());
  else if(action === 'cast')
    this.emit(this._action, this._cast());*/
};

Battle.prototype._defend = function () {
  var activeCharacterId = this._action.activeCharacterId;
  var newDefense = this._improveDefense(activeCharacterId);
  this._action.targetId = this._action.activeCharacterId;
  this._action.newDefense = newDefense;
  this._executeAction();
};


Battle.prototype._improveDefense = function (targetId) {
  var newDef = Math.ceil(this._charactersById[targetId].defense * 1.1);
  this._charactersById[targetId].defense = newDef;
  return newDef;
};

//Este metodo (nuestro <3) rellena states con las defensas al principio,
//para recurrir a ellas en el restore defense.
Battle.prototype._fillStates = function () {
  for (var state in this._states){
    this._states[state] = this._charactersById[state].defense;
  }
}

Battle.prototype._restoreDefense = function (targetId) {
  this._charactersById[targetId]._defense = this._states[targetId];
};

Battle.prototype._attack = function () {
  var self = this;
  self._showTargets(function onTarget(targetId) {
    self._action.targetId = targetId;
    self._action.effect = self._charactersById[self._action.activeCharacterId].weapon.extraEffect;
    self._executeAction();
    self._restoreDefense(targetId);
  });
};

Battle.prototype._cast = function () {
  var self = this;
  self._showScrolls(function onScroll(scrollId, scroll) {
    var team = self._charactersById[self._turns.activeCharacterId].party;
    scroll = self._grimoires[team][scrollId];

    self._charactersById[self._turns.activeCharacterId].mp -= scroll.cost;
    self._showTargets(function onTarget(targetId) {
      self._action.targetId = targetId;
      self._action.scrollName = scrollId;
      self._action.effect = scroll.effect;
      self._executeAction();
      self._restoreDefense(targetId);
    });

  });
};

Battle.prototype._executeAction = function () {
  var action = this._action;
  var effect = this._action.effect || new Effect({});
  var activeCharacter = this._charactersById[action.activeCharacterId];
  var targetCharacter = this._charactersById[action.targetId];
  var areAllies = activeCharacter.party === targetCharacter.party;
  var wasSuccessful = targetCharacter.applyEffect(effect, areAllies);
  this._action.success = wasSuccessful;

  this._informAction();
  this._nextTurn();
};

Battle.prototype._informAction = function () {
  this.emit('info', this._action);
};

Battle.prototype._showTargets = function (onSelection) {
  var targets = {};
  for(var nameChar in this._charactersById){
    if(!this._charactersById[nameChar].isDead()){
      targets[nameChar] = nameChar;
    }
  }
  this.options.current = targets;
  this.options.current.on('chose', onSelection);
};

Battle.prototype._showScrolls = function (onSelection) {
  var scrolls = {};
  var team = this._charactersById[this._turns.activeCharacterId].party;
  var spellAc = this._grimoires[team];
  for (var spell in spellAc){
    if(spellAc[spell].canBeUsed(this._charactersById[this._turns.activeCharacterId].mp))
      scrolls[spell] = spellAc[spell];
  }
  this.options.current = scrolls;
  this.options.current.on('chose', onSelection);
};

module.exports = Battle;
