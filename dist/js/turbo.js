(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Turbo = factory());
}(this, (function () { 'use strict';

/**
 * Utilities
 */
function select(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }
  return element;
}

var Turbo = function Turbo(selector, ref) {
  if ( ref === void 0 ) ref = {};
  var itemsToShow = ref.itemsToShow; if ( itemsToShow === void 0 ) itemsToShow = 1;
  var itemsToScroll = ref.itemsToScroll; if ( itemsToScroll === void 0 ) itemsToScroll = 1;
  var infiniteScroll = ref.infiniteScroll; if ( infiniteScroll === void 0 ) infiniteScroll = true;
  var centerMode = ref.centerMode; if ( centerMode === void 0 ) centerMode = false;

  this.el = select(selector);
  this.settings = {
    itemsToShow: itemsToShow,
    itemsToScroll: itemsToScroll,
    infiniteScroll: infiniteScroll,
    centerMode: centerMode
  };
  this.init();
};

Turbo.prototype.init = function init () {
  this.items = Array.from(this.el.querySelectorAll(':scope > *:not([class^="turbo"])'));
  this.itemsCount = this.items.length - 1;
  this.currentItem = 0;
  this.itemWidth= 0;
  this.clones = [];
  this.containerWidth = 0;
  this.track = null;
  this.nextButton = this.el.querySelector('.turbo-next');
  this.backButton = this.el.querySelector('.turbo-back');
  this.isSliding = false;

  this.initEvents();
  this.initWrapper();
  if (this.settings.infiniteScroll) this.initClones();
  this.updateWidth();
};

Turbo.prototype.initWrapper = function initWrapper () {
    var this$1 = this;

  var fragment = document.createDocumentFragment();
  this.track = document.createElement('div');
  this.track.classList.add('turbo-track');
  this.items.forEach(function (item, index) {
    var turboItem = document.createElement('div');
    turboItem.classList.add('turbo-item');
    turboItem.appendChild(item);
    this$1.items[index] = turboItem;
    this$1.track.appendChild(turboItem);
  });
  fragment.appendChild(this.track);
  this.el.appendChild(fragment);
};

Turbo.prototype.initClones = function initClones () {
    var this$1 = this;

  var afterClones = document.createDocumentFragment();
  this.items.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.classList.add('turbo-clone');
    this$1.clones.push(clone);
    afterClones.appendChild(clone);
  });
  this.track.appendChild(afterClones);

  var beforeClones = document.createDocumentFragment();
  this.items.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.classList.add('turbo-clone');
    this$1.clones.push(clone);
    beforeClones.appendChild(clone);
  });
  this.track.insertBefore(beforeClones, this.track.firstChild);
};

Turbo.prototype.initEvents = function initEvents () {
  if (this.nextButton) {
    this.nextButton.addEventListener('click', this.next.bind(this), false);
  }
  if (this.backButton) {
    this.backButton.addEventListener('click', this.back.bind(this), false);
  }
  window.addEventListener('resize', this.updateWidth.bind(this), false);
};

Turbo.prototype.updateWidth = function updateWidth () {
    var this$1 = this;

  this.containerWidth = this.el.offsetWidth;
  this.itemWidth = (this.containerWidth / this.settings.itemsToShow) - 10;
  if (this.settings.centerMode) {
    this.itemWidth = (this.containerWidth / (this.settings.itemsToShow + 0.5)) - 10;
    this.track.firstChild.style.marginLeft = (this.itemWidth / 4) + "px";
  }
  this.items.forEach(function (item) {
    item.style.width = (this$1.itemWidth) + "px";
  });
  this.clones.forEach(function (clone) {
    clone.style.width = (this$1.itemWidth) + "px";
  });
  this.goTo(this.currentItem);
};

Turbo.prototype.goTo = function goTo (index) {
    var this$1 = this;

  if (this.isSliding) return;
  this.isSliding = true;
  var slideWidth = this.itemWidth + 10;
  var fixedRatio = this.settings.infiniteScroll ? (this.itemsCount + 1) * slideWidth : 0;
  this.track.style.transition = '0.5s';
  this.track.style.transform = "translate(" + ((index * - slideWidth) - fixedRatio) + "px, 0)";
  this.currentItem = index;

  setTimeout(function () {
    this$1.track.style.transition = '0s';
    if (this$1.currentItem > this$1.itemsCount) {
      this$1.currentItem = 0;
      this$1.track.style.transform = "translate(" + (-fixedRatio) + "px, 0)";
    }
    if (this$1.currentItem < 0) {
      this$1.currentItem = this$1.itemsCount;
      this$1.track.style.transform = "translate(" + ((this$1.itemsCount * - slideWidth) - fixedRatio) + "px, 0)";
    }
    this$1.isSliding = false;
  }, 500);
};

Turbo.prototype.next = function next () {
  if(
    this.currentItem !== this.itemsCount - (this.settings.itemsToShow - 1) ||
    this.settings.infiniteScroll
  ) {
    this.goTo(this.currentItem + this.settings.itemsToScroll);
  }
};

Turbo.prototype.back = function back () {
  if(this.currentItem !== 0 || this.settings.infiniteScroll) {
    this.goTo(this.currentItem - this.settings.itemsToScroll);
  }
};

return Turbo;

})));
