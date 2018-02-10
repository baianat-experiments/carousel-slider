import { select } from './utilities';

class Veer {
  constructor(selector, {
    itemsToShow = 1,
    itemsToScroll = 1,
    infiniteScroll = true,
    centerMode = false,
    transitionTime = 500,
    controls = null,
    drag = true,
    classes = {
      active: 'is-active',
      current: 'is-current',
      prev: 'is-prev',
      next: 'is-next'
    }
  } = {}) {
    this.el = select(selector);
    this.settings = {
      itemsToShow,
      itemsToScroll,
      infiniteScroll,
      centerMode,
      transitionTime,
      controls,
      drag,
      classes
    };
    this.init();
  }

  init() {
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
    if (this.settings.infiniteScroll) this.initClones();
    if (this.settings.controls) {
      this.settings.controls.settings.follows = this;
    }
    this.updateWidth();
  }

  initWrapper() {
    const fragment = document.createDocumentFragment();
    this.track = document.createElement('div');
    this.track.classList.add('veer-track');
    this.items.forEach((item, index) => {
      const veerItem = document.createElement('div');
      veerItem.classList.add('veer-item');
      veerItem.appendChild(item);
      this.items[index] = veerItem;
      this.track.appendChild(veerItem);
    });
    fragment.appendChild(this.track);
    this.el.appendChild(fragment);
  }

  initClones() {
    const clonesAfter = document.createDocumentFragment();
    this.items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add('veer-clone');
      this.clonesAfter.push(clone);
      clonesAfter.appendChild(clone);
    });
    this.track.appendChild(clonesAfter);

    const clonesBefore = document.createDocumentFragment();
    this.items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add('veer-clone');
      this.clonesBefore.push(clone);
      clonesBefore.appendChild(clone);
    });
    this.track.insertBefore(clonesBefore, this.track.firstChild);
  }

  initEvents() {
    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.next.bind(this), false);
    }
    if (this.prevButton) {
      this.prevButton.addEventListener('click', this.prev.bind(this), false);
    }

    if (this.settings.drag) {
      this.track.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        let startPosition = {};
        let endPosition = {};
        this.delta = {x: 0, y: 0};
        this.track.classList.add('is-grabbing');

        event.preventDefault();
        startPosition.x = event.clientX;
        startPosition.y = event.clientY;

        const mousemoveHandler = (evnt) => {
          endPosition.x = evnt.clientX;
          endPosition.y = evnt.clientY;
          this.delta.x = endPosition.x - startPosition.x;
          this.delta.y = endPosition.y - startPosition.y;
          this.updateItemsTranslate(this.delta.x);
        }
        const mouseupHandler = () => {
          const draggedItems = Math.floor((-this.delta.x + (this.itemWidth / 2)) / this.itemWidth);
          this.track.classList.remove('is-grabbing');
          this.goTo(this.currentItem + draggedItems);
          document.removeEventListener('mousemove', mousemoveHandler);
          document.removeEventListener('mouseup', mouseupHandler);
        }
        document.addEventListener('mousemove', mousemoveHandler);
        document.addEventListener('mouseup', mouseupHandler);
      });

      this.track.addEventListener('touchstart', (event) => {
        console.log(event)
        let startPosition = {}
        let endPosition = {}
        this.delta = {}
        this.track.classList.add('is-grabbing');

        event.preventDefault();
        startPosition.x = event.touches[0].clientX;
        startPosition.y = event.touches[0].clientY;

        const touchmoveHandler = (evnt) => {
          endPosition.x = evnt.touches[0].clientX;
          endPosition.y = evnt.touches[0].clientY;
          this.delta.x = endPosition.x - startPosition.x;
          this.delta.y = endPosition.y - startPosition.y;
          this.updateItemsTranslate(this.delta.x);
        }
        const touchendHandler = () => {
          const draggedItems = Math.floor((-this.delta.x + (this.itemWidth / 2)) / this.itemWidth);
          this.track.classList.remove('is-grabbing');
          this.goTo(this.currentItem + draggedItems);

          document.removeEventListener('touchmove', touchmoveHandler);
          document.removeEventListener('touchend', touchendHandler);
        }
        document.addEventListener('touchmove', touchmoveHandler);
        document.addEventListener('touchend', touchendHandler);
      });
    }

    window.addEventListener('resize', this.updateWidth.bind(this), false);
  }

  updateWidth() {
    this.containerWidth = this.el.offsetWidth;
    this.itemWidth = (this.containerWidth / this.settings.itemsToShow);
    if (this.settings.centerMode) {
      this.itemWidth = (this.containerWidth / (this.settings.itemsToShow + 0.5));
    }
    this.items.forEach((item) => {
      item.style.width = `${this.itemWidth}px`;
    });
    this.clonesBefore.forEach((clone) => {
      clone.style.width = `${this.itemWidth}px`;
    });
    this.clonesAfter.forEach((clone) => {
      clone.style.width = `${this.itemWidth}px`;
    });
    this.goTo(this.currentItem);
  }

  goTo(index, muted = false) {
    if (this.isSliding) return;
    this.isSliding = true;

    this.track.style.transition = `${this.settings.transitionTime / 1000}s`;
    this.items.forEach(item => { item.style.transition = `${this.settings.transitionTime / 1000}s` });
    this.clonesBefore.forEach(clone => { clone.style.transition = `${this.settings.transitionTime / 1000}s` });
    this.clonesAfter.forEach(clone => { clone.style.transition = `${this.settings.transitionTime / 1000}s` });
    this.currentItem = this.settings.infiniteScroll
      ? index
      : Math.min(Math.max(index, 0), this.itemsCount - 1);
    this.updateItemsTranslate();
    this.updateItemsClasses();
    if (this.settings.controls && !muted) this.settings.controls.goTo(this.currentItem, true);
    if (this.settings.follows && !muted) this.settings.follows.goTo(this.currentItem, true);

    setTimeout(() => {
      this.isSliding = false;
      this.track.style.transition = '';
      this.items.forEach(item => { item.style.transition = '' });
      this.clonesBefore.forEach(clone => { clone.style.transition = '' });
      this.clonesAfter.forEach(clone => { clone.style.transition = '' });
      if (this.settings.infiniteScroll) {
        this.currentItem = this.normalizeCurrentItemIndex(index);
        this.updateItemsTranslate();
        this.updateItemsClasses();
      }
    }, this.settings.transitionTime);
  }

  next() {
    this.goTo(this.currentItem + this.settings.itemsToScroll);
  }

  prev() {
    this.goTo(this.currentItem - this.settings.itemsToScroll);
  }

  updateItemsTranslate(drag = 0) {
    let centringRatio = 0;
    let fixedRatio = 0;
    const startHalf = Math.floor((this.settings.itemsToShow - 1) / 2);
    const endHalf = startHalf + Math.floor((this.settings.itemsToShow - 1) % 2);
    let maxItems = this.itemsCount - this.settings.itemsToShow;
    let scrolledItems = Math.min(Math.max(this.currentItem, 0), maxItems);
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
    this.track.style.transform = `translate3d(${this.transformX}px, 0, 0)`;
  }

  updateItemsClasses() {
    const classes = this.settings.classes
    // clean all classes
    this.items.forEach(item => item.classList.remove(...Object.values(classes)));
    if (this.settings.infiniteScroll) {
      this.clonesAfter.forEach(item => item.classList.remove(...Object.values(classes)));
      this.clonesBefore.forEach(item => item.classList.remove(...Object.values(classes)));
    }
    let startIndex = this.settings.infiniteScroll
      ? this.currentItem
      : Math.min(this.currentItem, this.itemsCount - this.settings.itemsToShow);
    let endIndex = this.currentItem + this.settings.itemsToShow;
    if (this.settings.centerMode) {
      const cauterizeRatio = Math.floor((this.settings.itemsToShow - 1) / 2);
      startIndex = this.currentItem - cauterizeRatio;
      endIndex -= cauterizeRatio;
    }
    this.addClass(this.currentItem, classes.current);
    this.addClass(startIndex - 1, classes.prev);
    this.addClass(endIndex, classes.next);
    for (let i = startIndex; i < endIndex; i++) {
      this.addClass(i, classes.active);
    }
  }

  addClass(index, className) {
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
  }

  normalizeCurrentItemIndex(index) {
    if (index >= this.itemsCount) {
      index = index - this.itemsCount;
      return this.normalizeCurrentItemIndex(index);
    }
    if (index < 0) {
      index = index + this.itemsCount;
      return this.normalizeCurrentItemIndex(index);
    }
    return index;
  }
}

export default Veer;
