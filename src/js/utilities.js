/**
 * Utilities
 */
export function select(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }
  return element;
}
export function css(element, styles) {
  Object.keys(styles).forEach((key) => {
    element.style[key] = styles[key];
  });
}
export function sync(callback) {
  setTimeout(() => callback(), 1000 / 60);
}

export function callable(func) {
  if (typeof func === 'function') {
    func();
  }
}

export function getAverage(array, length) {
  let sum = 0;
  const elements = array.slice(Math.max(array.length - length, 1));
  elements.forEach((value) => sum = sum + value);
  return Math.ceil(sum / length);
}

export function getArray(length, value) {
  return new Array(length).fill(value);
}

export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function throttle (callback, limit) {
  var wait = false;
  return function () {
    var context = this, args = arguments;
    if (!wait) {
      callback.apply(context, args);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
}
