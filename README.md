# catchart (WIP)
_(pronounced ca-chart)_

**cat something from command line to a chart in the browser**

uses [chart.js](http://www.chartjs.org/) for, ahem, charting...

[![npm status](http://img.shields.io/npm/v/catchart.svg?style=flat-square)](https://www.npmjs.org/package/catchart) 

## command line

`npm i -g catchart`

`catchart --help`

#### simple y over t
```
echo 1\n2\n3\n | catchart
```
<img src="/1.png?raw=true" width="400">

#### custom label / value
```
echo sunday,1,2,3\nmonday,4,5,6\ntuesday,7,8,9\n | catchart --labelSource=row
```
<img src="/2.png?raw=true" width="400">

#### multiple data sets over time
```
echo 1,2,3\n4,5,6\n-1,-2,-3\n | catchart
```
<img src="/3.png?raw=true" width="400">

#### other chart types, custom title
```
echo 1,2,3\n4,5,6\n-1,-2,-3 | catchart --title=catchart --chartType=bar
```
chart types: `line`, `bar`, `radar`, `pie`

<img src="/4.png?raw=true" width="400">

#### JSON input works too!
```
echo "{ \"data\": 1 }"\n"{ \"data\": 2, \"label\": \"foo\" }"\n | catchart
```


## api
`catchart` cli in it's simplest form, looks very much like this:

```js
const catchart = require('catchart')
const Slicer = require('stream-slicer')

process.stdin.pipe(new Slicer()).pipe(catchart())
```

## dev
- clone this repo
- hack
- gulp build; node emitter `csv | singlecsv | json` | node catchart`
- send a PR :)

### TODOS
- refactor code, especially server
- write tests (right now using emitter.js to test manually)

## license

[MIT](http://opensource.org/licenses/MIT) © Yaniv Kessler
