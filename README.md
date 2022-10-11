# catchart
_(pronounced ca-chart)_

**Pipe something from command line to a chart in the browser**

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
chart types: `line`, `bar`, `radar`, `pie`, `doughnut`, `scatter`, `polar`, `bubble`

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

## features
- support most of chart.js chart types
- support json and simple array input formats
- specify configuration through environment variables, files or cli parameters (see rc module and commander module for further information)
- fill the area under the line, also supports patterns.
- restrict the amount of displayed data using --windowSize. Catchart will dump data that falls outside of the window.
- align data to a left or right Y axis using configuration or automatically:
  * `--yLeft=[0, 1, 2]` and `--yRight=[3, 4]` will make series 0, 1 and 2 be on the left and 3,4 on the right. When using this config, all the series indices must be specified. With arrays the first item is the X value, if your input array is [1,2,3,4,5], yLeft=0,1 and yRight=3,4 will put 2 and 3 on the left Y axis and 3,4 on the right Y axis for X=1
  * Auto align Y axis: a somewhat feeble/experimental attempt at grouping series with similar magnitude on the left and right Y axes. `--disableAutoAlignYAxis` to disable 

## dev
- clone this repo
- hack
- npm run build_client; node emitter `<csv | singlecsv | json>` | node catchart`
- also `node emitter.js csv | node catchart.js --yLeft=[0,1] --yRight=[2,3]`
- send a PR :)

### TODOS
- refactor code, especially server
- write tests (right now using emitter.js to test manually)

## license

[MIT](http://opensource.org/licenses/MIT) © Yaniv Kessler
