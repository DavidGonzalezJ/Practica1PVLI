'use strict';
/*Continúa con el módulo src/items.js activando 
paulatinamente las suites para los tipos Item, 
Weapon y Scroll que encontrarás en spec/entities.js.*/

function Item(name, effect) {
  this.name = name;
  this.effect = effect;
}

function Weapon(name, damage, extraEffect) {
  Item.call(this, name, damage);
  this.extraEffect = extraEffect || new Effect({});
  // Haz que Weapon sea subtipo de Item haciendo que llame al constructor
  // de Item.
}
// Termina de implementar la herencia haciendo que la propiedad prototype de
// Item sea el prototipo de Weapon.prototype y recuerda ajustar el constructor.
Weapon.prototype = Object.create(Item.prototype);
Weapon.prototype.constructor = Weapon;

function Scroll(name, cost, effect) {
  Item.call(this, name, effect);
  this.cost = cost;
}
Scroll.prototype = Object.create(Item.prototype);
Scroll.prototype.constructor = Scroll;

Scroll.prototype.canBeUsed = function (mp) {
  // El pergamino puede usarse si los puntos de maná son superiores o iguales
  // al coste del hechizo.
  return mp >= this.cost;
};

function Effect(variations) {
  // Copia las propiedades que se encuentran en variations como propiedades de
  // este objeto.
  this.initiative = variations.initiative;
  this.defense = variations.defense;
  this.hp = variations.hp;
  this.maxHp = variations.maxHp;
  this.mp = variations.mp;
  this.maxMp = variations.maxMp;
}

module.exports = {
  Item: Item,
  Weapon: Weapon,
  Scroll: Scroll,
  Effect: Effect
};
