# Turbo
ES6 carousal

#### Current version: 0.0.1

## key features
* Build using ES6 classes
* Lightweight
* Easy customizing
* Support SVG out of the box
* Infinity scroll
* Center mood

[example](https://baianat.github.io/turbo/)


## How to use
#### include necessary files
``` html
<head>
  <link rel="stylesheet" href="dist/css/turbo.css">
</head>
<body>
    ...
    <script type="text/javascript" src="dist/js/turbo.js"></script>
</body>
```

#### HTML markup
Just the ordinary table markup with class ``table``
``` html
<div class="turbo" id="carousal1">
  <div class="item">
    ...
  </div>
  <div class="item">
    ...
  </div>

  <!-- you can add any icon you want or use ours-->
  <a class="turbo-next">
    <svg class="icon" id="icon-next" viewBox="0 0 24 24">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  </a>
  <a class="turbo-back">
    <svg class="icon" id="icon-back" viewBox="0 0 24 24">
      <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
    </svg>
  </a>
</div>
```

#### Create new carosal
``` javascript
  let myCarousal = new Turbo('#carousal1', { settings });
```
{
    itemsToShow = 1,
    itemsToScroll = 1,
    infiniteScroll = true,
    centerMode = false
  }

#### Settings
| Properties     | default  | description                    |
| -------------- | -------- | ------------------------------ |
| itemsToShow    | 1        | how many items shows           |
| itemsToScroll  | 1        | how many items to scroll       |
| infiniteScroll | true     | enable/disable infinite scroll |
| centerMode     | false    | enable/disable center mode     |

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017 [Baianat](http://baianat.com)
