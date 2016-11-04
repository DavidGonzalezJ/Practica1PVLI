'use strict';
var items = require('./items');
var Character = require('./Character');

var Effect = items.Effect;


var lib = module.exports = {
  Item: items.Item,
  Weapon: items.Weapon,
  Scroll: items.Scroll,
  Effect: Effect,
  Character: Character,

  weapons: {
    get sword() {
      return new items.Weapon('sword', 25);
    },
    get wand() {
      return new items.Weapon('wand', 5);
    },
    // Implementa los colmillos y el pseudópodo
    get fangs() {
      return new items.Weapon('fangs', 10);
    },
    get pseudopode() {
      return new items.Weapon('pseudopode', 5, new Effect({ mp: -5 }));
    }
  },

  characters: {

    get heroTank() {
      return new Character('Tank', {
        initiative: 10,
        weapon: lib.weapons.sword,
        defense: 70,
        hp: 80,
        mp: 30
      });
    },

    // Implementa el mago
    get heroWizard() {
      return new Character('Wizard', {
        initiative: 4,
        weapon: lib.weapons.wand,
        defense: 50,
        hp: 40,
        mp: 100
      });
    },

    get monsterSkeleton() {
      return new Character('skeleton', {
        initiative: 9,
        defense: 50,
        weapon: lib.weapons.sword,
        hp: 100,
        mp: 0
      });
    },

    // Implementa el limo
      get monsterSlime() {
        return new Character('slime', {
          initiative: 2,
          defense: 40,
          weapon: lib.weapons.pseudopode,
          hp: 40,
          mp: 50
        });
      },

      // Implementa el murcielago

      get monsterBat() {
        return new Character('bat', {
          initiative: 30,
          defense: 80,
          weapon: lib.weapons.fangs,
          hp: 5
        });
      }

  },

  scrolls: {

    get health() {
      return new items.Scroll('health', 10, new Effect({ hp: 25 }));
    },

    // Implementa la bola de fuego
    get fireball(){
      return new items.Scroll('fireball', 30, new Effect({ hp: -25 }));
    }

  }
};
