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
  var drag = ref.drag; if ( drag === void 0 ) drag = true;
  var classes = ref.classes; if ( classes === void 0 ) classes = {
    active: 'is-active',
    center: 'is-center',
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
    drag: drag,
    classes: classes
  };
  this.init();
};

Veer.prototype.init = function init () {
  this.items = Array.from(this.el.querySelectorAll(':scope > *:not([class^="veer"])'));
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

  this.initWrapper();
  this.initEvents();
  if (this.settings.infiniteScroll) { this.initClones(); }
  if (this.settings.controls) {
    this.settings.controls.settings.follows = this;
  }
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
};

Veer.prototype.initEvents = function initEvents () {
    var this$1 = this;

  if (this.nextButton) {
    this.nextButton.addEventListener('click', this.next.bind(this), false);
  }
  if (this.prevButton) {
    this.prevButton.addEventListener('click', this.prev.bind(this), false);
  }

  if (this.settings.drag) {
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
        var draggedItems = Math.floor((-this$1.delta.x + (this$1.itemWidth / 2)) / this$1.itemWidth);
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
  this.items.forEach(function (item) {
    item.style.width = (this$1.itemWidth) + "px";
  });
  this.clonesBefore.forEach(function (clone) {
    clone.style.width = (this$1.itemWidth) + "px";
  });
  this.clonesAfter.forEach(function (clone) {
    clone.style.width = (this$1.itemWidth) + "px";
  });
  this.goTo(this.currentItem);
};

Veer.prototype.goTo = function goTo (index, muted) {
    var this$1 = this;
    if ( muted === void 0 ) muted = false;

  if (this.isSliding) { return; }
  this.isSliding = true;

  this.track.style.transition = (this.settings.transitionTime / 1000) + "s";
  this.items.forEach(function (item) { item.style.transition = (this$1.settings.transitionTime / 1000) + "s"; });
  this.clonesBefore.forEach(function (clone) { clone.style.transition = (this$1.settings.transitionTime / 1000) + "s"; });
  this.clonesAfter.forEach(function (clone) { clone.style.transition = (this$1.settings.transitionTime / 1000) + "s"; });
  this.currentItem = this.settings.infiniteScroll ? index : this.normalizeCurrentItemIndex(index);
  this.updateItemsTranslate();
  if (this.settings.controls && !muted) { this.settings.controls.goTo(this.currentItem, true); }
  if (this.settings.follows && !muted) { this.settings.follows.goTo(this.currentItem, true); }

  setTimeout(function () {
    this$1.isSliding = false;
    this$1.track.style.transition = '';
    this$1.items.forEach(function (item) { item.style.transition = ''; });
    this$1.clonesBefore.forEach(function (clone) { clone.style.transition = ''; });
    this$1.clonesAfter.forEach(function (clone) { clone.style.transition = ''; });
    if (this$1.settings.infiniteScroll) {
      this$1.currentItem = this$1.normalizeCurrentItemIndex(index);
      this$1.updateItemsTranslate();
    }
  }, this.settings.transitionTime);
};

Veer.prototype.next = function next () {
  var maxItems = this.settings.centerMode
    ? this.itemsCount - 1
    : this.itemsCount - this.settings.itemsToShow;
  var nextIndex = this.settings.infiniteScroll
    ? this.currentItem + this.settings.itemsToScroll
    : Math.min(this.currentItem + this.settings.itemsToScroll, maxItems);
  this.goTo(nextIndex);
};

Veer.prototype.prev = function prev () {
  var prevIndex = this.settings.infiniteScroll
    ? this.currentItem - this.settings.itemsToScroll
    : Math.max(this.currentItem - this.settings.itemsToScroll, 0);
  this.goTo(prevIndex);
};

Veer.prototype.updateItemsTranslate = function updateItemsTranslate (drag) {
    if ( drag === void 0 ) drag = 0;

  var centringRatio = this.settings.centerMode
    ? ((this.settings.itemsToShow - 0.5) * 0.5) * this.itemWidth
    : 0;
  var fixedRatio = this.settings.infiniteScroll
    ? this.itemsCount * this.itemWidth
    : 0;
  var transformX = (this.currentItem * -this.itemWidth) - fixedRatio + drag + centringRatio;
  this.track.style.transform = "translate3d(" + transformX + "px, 0, 0)";
  this.updateItemsClasses();
};

Veer.prototype.updateItemsClasses = function updateItemsClasses () {
    var this$1 = this;

  var classes = this.settings.classes;
  // clean all classes
  this.items.forEach(function (item) { return (ref = item.classList).remove.apply(ref, Object.values(classes))
      var ref; });
  if (this.settings.infiniteScroll) {
    this.clonesAfter.forEach(function (item) { return (ref = item.classList).remove.apply(ref, Object.values(classes))
        var ref; });
    this.clonesBefore.forEach(function (item) { return (ref = item.classList).remove.apply(ref, Object.values(classes))
        var ref; });
  }
  var startIndex = this.currentItem;
  var endIndex = this.currentItem + this.settings.itemsToShow;
  if (this.settings.centerMode) {
    this.addClass(this.currentItem, classes.center);
    var cauterizeRatio = Math.round((this.settings.itemsToShow - 1) / 2);
    startIndex -= cauterizeRatio;
    endIndex -= cauterizeRatio;
  }
  this.addClass(startIndex - 1, classes.prev);
  this.addClass(endIndex, classes.next);
  for (var i = startIndex; i < endIndex; i++) {
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
