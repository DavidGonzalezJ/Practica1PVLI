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
  // Cambia la party de todos los personajes a la pasada como parámetro.
    characters.forEach(function(character){
      character.party = party;
    });
    ///CAMBIO////
  }

  function useUniqueName(character) {
    // Genera nombres únicos de acuerdo a las reglas
    // de generación de identificadores que encontrarás en
    // la descripción de la práctica o en la especificación.
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
    // Devuelve la party que todos los personajes tienen en común o null en caso
    // de que no haya común.
     /////////////////CAMBIO///////
    var i = 1;
    var common = true;
    var partyIni = characters[0].party;
    while(common && i < characters.length){
      if(characters[i].party !== partyIni){
        common = false;
      }
      i++;
    }
    if(common)
      return partyIni;
    else return null;
     /////////////////CAMBIO///////
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
  // Debe llamar al método para la acción correspondiente:
  // defend -> _defend; attack -> _attack; cast -> _cast
  /////////////////CAMBIO///////
 /* var self = this;
  var battleOptions = {
    cast : self._cast,
    defend : self._defend,
    attack : self._attack
  };
  battleOptions[action]();
*/
  if(action === 'defend')
    this._defend();
  else if(action === 'attack')
    this._attack();
  else if(action === 'cast')
    this._cast();
   /////////////////CAMBIO///////
};

Battle.prototype._defend = function () {
  var activeCharacterId = this._action.activeCharacterId;
  var newDefense = this._improveDefense(activeCharacterId);
  this._action.targetId = this._action.activeCharacterId;
  this._action.newDefense = newDefense;
  this._executeAction();
};

/*La acción defend rellena la estructura this._action 
con el nombre de la acción, los identificadores del
 personaje activo y del objetivo, el efecto y la nueva defensa. 
 Todos menos la defensa son necesarios para poder llamar a la 
 función _executeAction() que ejecutará la acción e informará 
 del resultado.*/

Battle.prototype._improveDefense = function (targetId) {
  var states = this._states[targetId];
  //this._states[targetId] = states;
  //charIdsByParty[party].push(charId);
  states[targetId] = (this._charactersById[targetId].defense);

  this._charactersById[targetId].defense = Math.ceil(this._charactersById[targetId].defense * 1.1);
  //Implementa la mejora de la defensa del personaje.
  //return this.characters[targetId].defense;
  console.log(states, 'mejoro defensa', this._charactersById[targetId].defense);
  return this._charactersById[targetId].defense;
};

Battle.prototype._restoreDefense = function (targetId) {
  // Restaura la defensa del personaje a cómo estaba antes de mejorarla.
  // Puedes utilizar el atributo this._states[targetId] para llevar tracking
  // de las defensas originales.
  var aux = targetId.defense;
  this._charactersById[targetId].defense = states[targetId];
  console.log(aux, 'restauro defensa', targetId.defense);

  return states[targetId];
};

Battle.prototype._attack = function () {
  var self = this;
  self._showTargets(function onTarget(targetId) {
    // Implementa lo que pasa cuando se ha seleccionado el objetivo.
    self._executeAction();
    self._restoreDefense(targetId);
  });
};

Battle.prototype._cast = function () {
  var self = this;
  self._showScrolls(function onScroll(scrollId, scroll) {
    // Implementa lo que pasa cuando se ha seleccionado el hechizo.
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
  // Toma ejemplo de la función ._showActions() para mostrar los identificadores
  // de los objetivos.

  this.options.current.on('chose', onSelection);
};

Battle.prototype._showScrolls = function (onSelection) {
  // Toma ejemplo de la función anterior para mostrar los hechizos. Estudia
  // bien qué parámetros se envían a los listener del evento chose.
  this.options.current.on('chose', onSelection);
};

module.exports = Battle;
