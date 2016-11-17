'use strict';

function TurnList() {}

TurnList.prototype.reset = function (charactersById) {
  this._charactersById = charactersById;
  this._turnIndex = -1;
  this.turnNumber = 0;
  this.activeCharacterId = null;
  this.list = this._sortByInitiative();

};

TurnList.prototype.next = function () {

  var i = this.turnNumber;
  var alive = false;

  while (!alive){
    i = i % this.list.length;
    if(!this._charactersById[this.list[i]].isDead()){
      alive = true;
      this.activeCharacterId = this.list[i];
    }
    i++;
  }
  this.turnNumber++;

  var turn = {
    number: this.turnNumber,
    party: this._charactersById[this.activeCharacterId].party,
    activeCharacterId: this.activeCharacterId
  };
  return turn;
};

TurnList.prototype._sortByInitiative = function () {
  var initiativeArray = [];
  var nameArray = [];

  for(var name in this._charactersById) {
    var aux = {};
    aux.name = name;
    aux.initiative = this._charactersById[name].initiative;
    initiativeArray.push(aux);
  }

  initiativeArray.sort(function (a , b){
    if (a.initiative < b.initiative) {
      return 1;
    }
    if (a.initiative > b.initiative) {
      return -1;
    }
    return 0;
  });

  //Guarda los personajes en la lista
  for (var character in initiativeArray){
    nameArray.push(initiativeArray[character].name);
  }
  return nameArray; 
};

module.exports = TurnList;
