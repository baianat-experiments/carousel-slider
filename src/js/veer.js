import {
  select
} from './utilities';


class Veer {
  constructor(selector, {
    itemsToShow = 1,
    itemsToScroll = 1,
    infiniteScroll = true,
    centerMode = false
  } = {}) {
    this.el = select(selector);
    this.settings = {
      itemsToShow,
      itemsToScroll,
      infiniteScroll,
      centerMode
    };
    this.init();
  }

  init() {
    this.items = Array.from(this.el.querySelectorAll(':scope > *:not([class^="veer"])'));
    this.itemsCount = this.items.length;
    this.currentItem = 0;
    this.itemWidth  = 0;
    this.clones = [];
    this.containerWidth = 0;
    this.track = null;
    this.nextButton = this.el.querySelector('.veer-next');
    this.prevButton = this.el.querySelector('.veer-prev');
    this.isSliding = false;

    this.initWrapper();
    this.initEvents();
    if (this.settings.infiniteScroll) this.initClones();
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
    const afterClones = document.createDocumentFragment();
    this.items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add('veer-clone');
      this.clones.push(clone);
      afterClones.appendChild(clone);
    });
    this.track.appendChild(afterClones);

    const beforeClones = document.createDocumentFragment();
    this.items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add('veer-clone');
      this.clones.push(clone);
      beforeClones.appendChild(clone);
    });
    this.track.insertBefore(beforeClones, this.track.firstChild);
  }

  initEvents() {
    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.next.bind(this), false);
    }
    if (this.prevButton) {
      this.prevButton.addEventListener('click', this.prev.bind(this), false);
    }

    this.track.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      let startPosition = {}
      let endPosition = {}
      this.delta = {}
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
        const draggedItems = Math.floor((-this.delta.x + (this.itemWidth / 2))/ this.itemWidth);
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

    window.addEventListener('resize', this.updateWidth.bind(this), false);
  }

  updateWidth() {
    this.containerWidth = this.el.offsetWidth;
    this.itemWidth = (this.containerWidth / this.settings.itemsToShow);
    if (this.settings.centerMode) {
      this.itemWidth = (this.containerWidth / (this.settings.itemsToShow + 0.5));
      this.track.firstChild.style.marginLeft = `${this.itemWidth / 4}px`;
    }
    this.items.forEach((item) => {
      item.style.width = `${this.itemWidth}px`;
    });
    this.clones.forEach((clone) => {
      clone.style.width = `${this.itemWidth}px`;
    });
    this.goTo(this.currentItem);
  }

  goTo(index) {
    if (this.isSliding) return;
    this.isSliding = true;

    this.track.style.transition = '0.5s';
    this.currentItem = this.settings.infiniteScroll
      ? index 
      : Math.min(Math.max(index, 0), this.itemsCount - this.settings.itemsToShow);
    this.updateItemsTranslate();
    
    setTimeout(() => {
      this.isSliding = false;
      this.track.style.transition = '';
      if (this.settings.infiniteScroll) {
        this.currentItem = this.normalizeCurrentItemIndex(this.currentItem);
        this.updateItemsTranslate();
      }
    }, 500);
  }

  next() {
    this.goTo(this.currentItem + this.settings.itemsToScroll);
  }

  prev() {
    this.goTo(this.currentItem - this.settings.itemsToScroll);
  }

  updateItemsTranslate(drag = 0) {
    const fixedRatio = this.settings.infiniteScroll ? this.itemsCount * this.itemWidth : 0;
    this.track.style.transform = `translate3d(${(this.currentItem * - this.itemWidth) - fixedRatio + drag}px, 0, 0)`;
  }

  normalizeCurrentItemIndex(index) {
    console.log(index)
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
