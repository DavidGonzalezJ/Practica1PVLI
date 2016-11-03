'use strict';
var dice = require('./dice');

function Character(name, features) {
  features = features || {};
  this.name = name;
  this.party = null;
  // Extrae del parámetro features cada característica y alamacénala en
  // una propiedad.
  this.initiative = features.initiative || 0;
  this._defense = features.defense || 0;
  this.weapon = features.weapon || null;
  this._mp = features.mp || 0;
  this._hp = features.hp || 0;
  this.maxMp = features.maxMp || features.mp || 0;
  this.maxHp = features.maxHp || features.hp || 15;
}

Character.prototype._immuneToEffect = ['name', 'weapon'];

Character.prototype.isDead = function () {
  // Rellena el cuerpo de esta función
  return this.hp <= 0;
}; 

Character.prototype.applyEffect = function (effect, isAlly) {
  // Implementa las reglas de aplicación de efecto para modificar las
  // características del personaje. Recuerda devolver true o false según
  // si el efecto se ha aplicado o no.
  var applied = true;
  if(!isAlly){
    applied = (dice <= this.defense);
  }
  if(applied || isAlly){
    this.initiative += effect.initiative;
    this.defense = this.defense + effect.defense; 

    this.hp = this.hp + effect.hp;
    this.maxHp = this.maxHp + effect.maxHp;

    this.mp = this.mp + effect.mp;
    this.maxMp = this.maxMp + effect.maxMp;
  }
  return applied;

};

Object.defineProperty(Character.prototype, 'mp', {
  get: function () {
    return this._mp;
  },
  set: function (newValue) {
    this._mp = Math.max(0, Math.min(newValue, this.maxMp));
  }
});

Object.defineProperty(Character.prototype, 'hp', {
   get: function () {
    return this._hp;
  },
  set: function (newValue) {
    this._hp = Math.max(0, Math.min(newValue, this.maxHp));
  }
  // Puedes usar la mísma ténica que antes para mantener el valor de hp en el
  // rango correcto.
});
Object.defineProperty(Character.prototype, 'defense', {
   get: function () {
    return this._defense;
  },
  set: function (newValue) {
    this._defense = Math.max(0, Math.min(newValue, 100));
  }
});



module.exports = Character;
