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
    this.itemsCount = this.items.length - 1;
    this.currentItem = 0;
    this.itemWidth  = 0;
    this.clones = [];
    this.containerWidth = 0;
    this.track = null;
    this.nextButton = this.el.querySelector('.veer-next');
    this.backButton = this.el.querySelector('.veer-back');
    this.isSliding = false;

    this.initEvents();
    this.initWrapper();
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
    if (this.backButton) {
      this.backButton.addEventListener('click', this.back.bind(this), false);
    }
    window.addEventListener('resize', this.updateWidth.bind(this), false);
  }

  updateWidth() {
    this.containerWidth = this.el.offsetWidth;
    this.itemWidth = (this.containerWidth / this.settings.itemsToShow) - 10;
    if (this.settings.centerMode) {
      this.itemWidth = (this.containerWidth / (this.settings.itemsToShow + 0.5)) - 10;
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
    const slideWidth = this.itemWidth + 10;
    const fixedRatio = this.settings.infiniteScroll ? (this.itemsCount + 1) * slideWidth : 0;
    this.track.style.transition = '0.5s';
    this.track.style.transform = `translate(${(index * - slideWidth) - fixedRatio}px, 0)`;
    this.currentItem = index;

    setTimeout(() => {
      this.track.style.transition = '0s';
      if (this.currentItem > this.itemsCount) {
        this.currentItem = 0;
        this.track.style.transform = `translate(${-fixedRatio}px, 0)`;
      }
      if (this.currentItem < 0) {
        this.currentItem = this.itemsCount;
        this.track.style.transform = `translate(${(this.itemsCount * - slideWidth) - fixedRatio}px, 0)`;
      }
      this.isSliding = false;
    }, 500);
  }

  next() {
    if(
      this.currentItem !== this.itemsCount - (this.settings.itemsToShow - 1) ||
      this.settings.infiniteScroll
    ) {
      this.goTo(this.currentItem + this.settings.itemsToScroll);
    }
  }

  back() {
    if(this.currentItem !== 0 || this.settings.infiniteScroll) {
      this.goTo(this.currentItem - this.settings.itemsToScroll);
    }
  }
}

export default veer;
