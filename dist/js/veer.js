(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Veer = factory());
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

var Veer = function Veer(selector, ref) {
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

Veer.prototype.init = function init () {
  this.items = Array.from(this.el.querySelectorAll(':scope > *:not([class^="veer"])'));
  this.itemsCount = this.items.length;
  this.currentItem = 0;
  this.itemWidth= 0;
  this.clones = [];
  this.containerWidth = 0;
  this.track = null;
  this.nextButton = this.el.querySelector('.veer-next');
  this.prevButton = this.el.querySelector('.veer-prev');
  this.isSliding = false;

  this.initWrapper();
  this.initEvents();
  if (this.settings.infiniteScroll) { this.initClones(); }
  this.updateWidth();
};

Veer.prototype.initWrapper = function initWrapper () {
    var this$1 = this;

  var fragment = document.createDocumentFragment();
  this.track = document.createElement('div');
  this.track.classList.add('veer-track');
  this.items.forEach(function (item, index) {
    var veerItem = document.createElement('div');
    veerItem.classList.add('veer-item');
    veerItem.appendChild(item);
    this$1.items[index] = veerItem;
    this$1.track.appendChild(veerItem);
  });
  fragment.appendChild(this.track);
  this.el.appendChild(fragment);
};

Veer.prototype.initClones = function initClones () {
    var this$1 = this;

  var afterClones = document.createDocumentFragment();
  this.items.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.classList.add('veer-clone');
    this$1.clones.push(clone);
    afterClones.appendChild(clone);
  });
  this.track.appendChild(afterClones);

  var beforeClones = document.createDocumentFragment();
  this.items.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.classList.add('veer-clone');
    this$1.clones.push(clone);
    beforeClones.appendChild(clone);
  });
  this.track.insertBefore(beforeClones, this.track.firstChild);
};

Veer.prototype.initEvents = function initEvents () {
    var this$1 = this;

  if (this.nextButton) {
    this.nextButton.addEventListener('click', this.next.bind(this), false);
  }
  if (this.prevButton) {
    this.prevButton.addEventListener('click', this.prev.bind(this), false);
  }

  this.track.addEventListener('mousedown', function (event) {
    if (event.button !== 0) { return; }
    var startPosition = {};
    var endPosition = {};
    this$1.delta = {};
    this$1.track.classList.add('is-grabbing');

    event.preventDefault();
    startPosition.x = event.clientX;
    startPosition.y = event.clientY;

    var mousemoveHandler = function (evnt) {
      endPosition.x = evnt.clientX;
      endPosition.y = evnt.clientY;
      this$1.delta.x = endPosition.x - startPosition.x;
      this$1.delta.y = endPosition.y - startPosition.y;
      this$1.updateItemsTranslate(this$1.delta.x);
    };
    var mouseupHandler = function () {
      var draggedItems = Math.floor((-this$1.delta.x + (this$1.itemWidth / 2))/ this$1.itemWidth);
      this$1.track.classList.remove('is-grabbing');
      this$1.goTo(this$1.currentItem + draggedItems);

      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
    };
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
  });

  this.track.addEventListener('touchstart', function (event) {
    console.log(event);
    var startPosition = {};
    var endPosition = {};
    this$1.delta = {};
    this$1.track.classList.add('is-grabbing');

    event.preventDefault();
    startPosition.x = event.touches[0].clientX;
    startPosition.y = event.touches[0].clientY;

    var touchmoveHandler = function (evnt) {
      endPosition.x = evnt.touches[0].clientX;
      endPosition.y = evnt.touches[0].clientY;
      this$1.delta.x = endPosition.x - startPosition.x;
      this$1.delta.y = endPosition.y - startPosition.y;
      this$1.updateItemsTranslate(this$1.delta.x);
    };
    var touchendHandler = function () {
      var draggedItems = Math.floor((-this$1.delta.x + (this$1.itemWidth / 2)) / this$1.itemWidth);
      this$1.track.classList.remove('is-grabbing');
      this$1.goTo(this$1.currentItem + draggedItems);

      document.removeEventListener('touchmove', touchmoveHandler);
      document.removeEventListener('touchend', touchendHandler);
    };
    document.addEventListener('touchmove', touchmoveHandler);
    document.addEventListener('touchend', touchendHandler);
  });

  window.addEventListener('resize', this.updateWidth.bind(this), false);
};

Veer.prototype.updateWidth = function updateWidth () {
    var this$1 = this;

  this.containerWidth = this.el.offsetWidth;
  this.itemWidth = (this.containerWidth / this.settings.itemsToShow);
  if (this.settings.centerMode) {
    this.itemWidth = (this.containerWidth / (this.settings.itemsToShow + 0.5));
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

Veer.prototype.goTo = function goTo (index) {
    var this$1 = this;

  if (this.isSliding) { return; }
  this.isSliding = true;

  this.track.style.transition = '0.5s';
  this.currentItem = this.settings.infiniteScroll
    ? index 
    : Math.min(Math.max(index, 0), this.itemsCount - this.settings.itemsToShow);
  this.updateItemsTranslate();
    
  setTimeout(function () {
    this$1.isSliding = false;
    this$1.track.style.transition = '';
    if (this$1.settings.infiniteScroll) {
      this$1.currentItem = this$1.normalizeCurrentItemIndex(this$1.currentItem);
      this$1.updateItemsTranslate();
    }
  }, 500);
};

Veer.prototype.next = function next () {
  this.goTo(this.currentItem + this.settings.itemsToScroll);
};

Veer.prototype.prev = function prev () {
  this.goTo(this.currentItem - this.settings.itemsToScroll);
};

Veer.prototype.updateItemsTranslate = function updateItemsTranslate (drag) {
    if ( drag === void 0 ) drag = 0;

  var fixedRatio = this.settings.infiniteScroll ? this.itemsCount * this.itemWidth : 0;
  this.track.style.transform = "translate3d(" + ((this.currentItem * - this.itemWidth) - fixedRatio + drag) + "px, 0, 0)";
};

Veer.prototype.normalizeCurrentItemIndex = function normalizeCurrentItemIndex (index) {
  console.log(index);
  if (index >= this.itemsCount) {
    index = index - this.itemsCount;
    return this.normalizeCurrentItemIndex(index);
  }
  if (index < 0) {
    index = index + this.itemsCount;
    return this.normalizeCurrentItemIndex(index);
  }
  return index;
};

return Veer;

})));
