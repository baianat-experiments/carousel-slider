# Veer

A beautiful responsive carousel.

## Key Features

* Built using ES6 classes.
* Lightweight.
* Easy customizing.
* Support SVG out of the box.
* Infinity scroll.
* Center mode.
* Fully responsive.

## [Example](https://baianat.github.io/veer/)

## Getting Started

### Install

First step is to install it using yarn or npm

```bash
npm install @baianat/align

# or use yarn
yarn add @baianat/align
```

### Include necessary files

``` html
<head>
  <link rel="stylesheet" href="dist/css/veer.css">
</head>
<body>
    ...
    <script type="text/javascript" src="dist/js/veer.js"></script>
</body>
```

#### HTML markup

``` html
<div class="veer" id="myCarousel">
  <div class="item">
    ...
  </div>
  <div class="item">
    ...
  </div>

  <!-- you can add any icon you want or use ours-->
  <a class="veer-next">
    <svg class="icon" id="icon-next" viewBox="0 0 24 24">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  </a>
  <a class="veer-back">
    <svg class="icon" id="icon-back" viewBox="0 0 24 24">
      <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
    </svg>
  </a>
</div>
```

### Create new carousel

``` javascript
  let myCarousel = new Veer('#myCarousel', {
    // settings
  });
```

### Settings

| VARIABLE       | DEFAULT | DESCRIPTION |
| -------------- | ------- | ------------|
| itemsToShow    | 1       | this variable allows you to set the amount of items displayed at a time |
| itemsToScroll  | 1       | this variable allows you to set how many items to scroll at a time|
| infiniteScroll | true    | this variable allows you enable or disable infinite scroll |
| centerMode     | false   | this variable allows you enable or disable center mode |

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017 [Baianat](http://baianat.com)
