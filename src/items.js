'use strict';


function Item(name, effect) {
  this.name = name;
  this.effect = effect;
}

function Weapon(name, damage, extraEffect) {

  this.extraEffect = extraEffect || new Effect({});
  this.extraEffect.hp = -damage;

  Item.call(this, name, this.extraEffect);
}

Weapon.prototype = Object.create(Item.prototype);
Weapon.prototype.constructor = Weapon;

function Scroll(name, cost, effect) {
  Item.call(this, name, effect);
  this.cost = cost;
}
Scroll.prototype = Object.create(Item.prototype);
Scroll.prototype.constructor = Scroll;

Scroll.prototype.canBeUsed = function (mp) {
  return mp >= this.cost;
};


function Effect(variations) {
  for(var name in variations){
    this[name] = variations[name];
  }
}

module.exports = {
  Item: Item,
  Weapon: Weapon,
  Scroll: Scroll,
  Effect: Effect
};
