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
  var transitionTime = ref.transitionTime; if ( transitionTime === void 0 ) transitionTime = 500;
  var controls = ref.controls; if ( controls === void 0 ) controls = null;
  var dragging = ref.dragging; if ( dragging === void 0 ) dragging = true;
  var touching = ref.touching; if ( touching === void 0 ) touching = true;
  var clicking = ref.clicking; if ( clicking === void 0 ) clicking = false;
  var classes = ref.classes; if ( classes === void 0 ) classes = {
    active: 'is-active',
    current: 'is-current',
    prev: 'is-prev',
    next: 'is-next'
  };

  this.el = select(selector);
  this.settings = {
    itemsToShow: itemsToShow,
    itemsToScroll: itemsToScroll,
    infiniteScroll: infiniteScroll,
    centerMode: centerMode,
    transitionTime: transitionTime,
    controls: controls,
    dragging: dragging,
    touching: touching,
    clicking: clicking,
    classes: classes
  };
  this.init();
};

Veer.prototype.init = function init () {
  this.items = Array.from(this.el.querySelectorAll(':scope > *:not([class^="veer"])'));
  this.allItems = this.items;
  this.itemsCount = this.items.length;
  this.currentItem = 0;
  this.itemWidth = 0;
  this.clonesAfter = [];
  this.clonesBefore = [];
  this.containerWidth = 0;
  this.track = null;
  this.nextButton = this.el.querySelector('.veer-next');
  this.prevButton = this.el.querySelector('.veer-prev');
  this.isSliding = false;
  this.delta = { x: 0, y: 0 };

  this.initWrapper();
  if (this.settings.infiniteScroll) {
    this.initClones();
  }
  if (this.settings.controls) {
    this.settings.controls.settings.follows = this;
  }

  this.initEvents();
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

  var clonesAfter = document.createDocumentFragment();
  this.items.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.classList.add('veer-clone');
    this$1.clonesAfter.push(clone);
    clonesAfter.appendChild(clone);
  });
  this.track.appendChild(clonesAfter);

  var clonesBefore = document.createDocumentFragment();
  this.items.forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.classList.add('veer-clone');
    this$1.clonesBefore.push(clone);
    clonesBefore.appendChild(clone);
  });
  this.track.insertBefore(clonesBefore, this.track.firstChild);
  this.allItems = this.items.concat(this.clonesBefore, this.clonesAfter);
};

Veer.prototype.initEvents = function initEvents () {
    var this$1 = this;

  if (this.nextButton) {
    this.nextButton.addEventListener('click', this.next.bind(this), false);
  }
  if (this.prevButton) {
    this.prevButton.addEventListener('click', this.prev.bind(this), false);
  }
  var startPosition = {};
  var endPosition = {};
  var moveHandler = function (event) {
    endPosition.x = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
    endPosition.y = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
    this$1.delta.x = endPosition.x - startPosition.x;
    this$1.delta.y = endPosition.y - startPosition.y;
    this$1.updateItemsTranslate(this$1.delta.x);
  };
  var upHandler = function () {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    document.removeEventListener('touchmove', moveHandler);
    document.removeEventListener('touchend', upHandler);
    if (this$1.delta.x === 0) { return; }
    var draggedItems = Math.round(this$1.delta.x / this$1.itemWidth + (Math.sign(this$1.delta.x) * 0.25));
    this$1.track.classList.remove('is-grabbing');
    var startIndex = this$1.settings.centerMode ? this$1.currentItem : this$1.activeItemsStart;
    this$1.goTo(startIndex - draggedItems);
    this$1.delta.x = 0;
    this$1.delta.y = 0;
  };

  if (this.settings.dragging) {
    this.track.addEventListener('mousedown', function (event) {
      if (event.button !== 0) { return; }
      this$1.track.classList.add('is-grabbing');

      event.preventDefault();
      startPosition.x = event.clientX;
      startPosition.y = event.clientY;

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });
  }

  if (this.settings.touching) {
    this.track.addEventListener('touchstart', function (event) {
      this$1.track.classList.add('is-grabbing');

      event.preventDefault();
      startPosition.x = event.touches[0].clientX;
      startPosition.y = event.touches[0].clientY;

      document.addEventListener('touchmove', moveHandler);
      document.addEventListener('touchend', upHandler);
    });
  }

  if (this.settings.clicking) {
    this.items.forEach(function (item, index) { item.addEventListener('click', function () { return this$1.goTo(index); }); });
    if (this.settings.infiniteScroll) {
      this.clonesAfter.forEach(function (item, index) { item.addEventListener('click', function () { return this$1.goTo(index + this$1.itemsCount); }); });
      this.clonesBefore.forEach(function (item, index) { item.addEventListener('click', function () { return this$1.goTo(index - this$1.itemsCount); }); });
    }
  }

  window.addEventListener('resize', this.updateWidth.bind(this), false);
};

Veer.prototype.updateWidth = function updateWidth () {
    var this$1 = this;

  this.containerWidth = this.el.offsetWidth;
  this.itemWidth = (this.containerWidth / this.settings.itemsToShow);
  if (this.settings.centerMode) {
    this.itemWidth = (this.containerWidth / (this.settings.itemsToShow + 0.5));
  }
  this.allItems.forEach(function (item) {
    item.style.width = (this$1.itemWidth) + "px";
  });
  this.goTo(this.currentItem);
};

Veer.prototype.goTo = function goTo (index, muted) {
    var this$1 = this;
    if ( muted === void 0 ) muted = false;

  if (this.isSliding) { return; }
  this.isSliding = true;

  this.track.style.transition = (this.settings.transitionTime / 1000) + "s";
  this.allItems.forEach(function (item) {
    item.style.transition = (this$1.settings.transitionTime / 1000) + "s";
  });
  this.currentItem = this.settings.infiniteScroll
    ? index
    : Math.min(Math.max(index, 0), this.itemsCount - 1);

  if (this.settings.controls && !muted) { this.settings.controls.goTo(this.currentItem, true); }
  if (this.settings.follows && !muted) { this.settings.follows.goTo(this.currentItem, true); }
  this.update();
  setTimeout(function () {
    this$1.isSliding = false;
    this$1.track.style.transition = '';
    this$1.allItems.forEach(function (item) { item.style.transition = ''; });

    if (this$1.settings.infiniteScroll) {
      this$1.currentItem = this$1.normalizeCurrentItemIndex(index);
      this$1.update();
    }
  }, this.settings.transitionTime);
};

Veer.prototype.next = function next () {
  this.goTo(this.currentItem + this.settings.itemsToScroll);
};

Veer.prototype.prev = function prev () {
  this.goTo(this.currentItem - this.settings.itemsToScroll);
};

Veer.prototype.update = function update () {
  this.updateItemsTranslate();
  this.updateActiveItems();
  this.updateItemsClasses();
};

Veer.prototype.updateActiveItems = function updateActiveItems () {
  this.activeItemsStart = Math.min(this.currentItem, this.itemsCount - this.settings.itemsToShow);
  this.activeItemsEnd = this.currentItem + this.settings.itemsToShow;

  if (this.settings.centerMode) {
    var cauterizeRatio = Math.floor((this.settings.itemsToShow - 1) / 2);
    this.activeItemsStart = this.currentItem - cauterizeRatio;
    this.activeItemsEnd -= cauterizeRatio;
  }
  if (!this.settings.centerMode && this.settings.infiniteScroll) {
    this.activeItemsStart = this.currentItem;
  }
};

Veer.prototype.updateItemsTranslate = function updateItemsTranslate (drag) {
    if ( drag === void 0 ) drag = 0;

  var centringRatio = 0;
  var fixedRatio = 0;
  var startHalf = Math.floor((this.settings.itemsToShow - 1) / 2);
  var endHalf = startHalf + Math.floor((this.settings.itemsToShow - 1) % 2);
  var maxItems = this.itemsCount - this.settings.itemsToShow;
  var scrolledItems = Math.min(Math.max(this.currentItem, 0), maxItems);
  if (this.settings.centerMode) {
    centringRatio = (startHalf + 0.25) * this.itemWidth;
  }
  if (this.settings.infiniteScroll) {
    fixedRatio = this.itemsCount * this.itemWidth;
    scrolledItems = this.currentItem;
  }
  if (this.settings.centerMode && !this.settings.infiniteScroll) {
    scrolledItems = this.currentItem > this.itemsCount - 1 - endHalf
      ? this.itemsCount - 1 - endHalf : this.currentItem;
    centringRatio = this.currentItem < startHalf ? (this.currentItem + 0.25) * this.itemWidth : centringRatio;
  }
  this.transformX = (scrolledItems * -this.itemWidth) - fixedRatio + drag + centringRatio;
  this.track.style.transform = "translate3d(" + (this.transformX) + "px, 0, 0)";
};

Veer.prototype.updateItemsClasses = function updateItemsClasses () {
    var this$1 = this;

  var classes = this.settings.classes;
  this.allItems.forEach(function (item) { return (ref = item.classList).remove.apply(ref, Object.values(classes))
      var ref; });

  this.addClass(this.currentItem, classes.current);
  this.addClass(this.activeItemsStart - 1, classes.prev);
  this.addClass(this.activeItemsEnd, classes.next);
  for (var i = this.activeItemsStart; i < this.activeItemsEnd; i++) {
    this$1.addClass(i, classes.active);
  }
};

Veer.prototype.addClass = function addClass (index, className) {
  if ((index < 0 || index >= this.itemsCount) && !this.settings.infiniteScroll) {
    return;
  }
  if (index < 0) {
    this.clonesBefore[index + this.itemsCount].classList.add(className);
    return;
  }
  if (index >= this.itemsCount) {
    this.clonesAfter[index - this.itemsCount].classList.add(className);
    return;
  }
  this.items[index].classList.add(className);
};

Veer.prototype.normalizeCurrentItemIndex = function normalizeCurrentItemIndex (index) {
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
