'use strict';

function CharactersView() {
  this._views = {};
}

CharactersView.prototype._visibleFeatures = [
  'name',
  'party',
  'initiative',
  'defense',
  'hp',
  'mp',
  'maxHp',
  'maxMp'
];

CharactersView.prototype.all = function () {
  return Object.keys(this._views).reduce(function (copy, id) {
    copy[id] = this._views[id];
    return copy;
  }.bind(this), {});
};

CharactersView.prototype.allFrom = function (party) {
  return Object.keys(this._views).reduce(function (copy, id) {
    if (this._views[id].party === party) {
      copy[id] = this._views[id];
    }
    return copy;
  }.bind(this), {});
};

CharactersView.prototype.get = function (id) {
  return this._views[id] || null;
};

CharactersView.prototype.set = function (characters) {
  this._views = Object.keys(characters).reduce(function (views, id) {
    views[id] = this._getViewFor(characters[id]);
    return views;
  }.bind(this), {});
};

CharactersView.prototype._getViewFor = function (character) {
  var view = {};
  // Usa la lista de características visibles y Object.defineProperty() para
  // devolver un objeto de JavaScript con las características visibles pero
  // no modificables.
  for (var i = 0 ; i < this._visibleFeatures.length; i++ ){

    console.log(i, this._visibleFeatures.length, 'xxxxx',character[this._visibleFeatures[i]]);
    Object.defineProperty(view, this._visibleFeatures[i], {
      get: function () {
        return character[this._visibleFeatures[i]];
        // ¿Cómo sería este getter para reflejar la propiedad del personaje?
      },
      set: function (value) {
        return character[this._visibleFeatures[i]];
        // ¿Y este setter para ignorar cualquier acción?
      },
      enumerable: true
    }); 

  }

  return view;
// Acuérdate de devolver el objeto.
};

module.exports = CharactersView;
