# catchart (WIP)
_(pronounced ca-chart)_

**cat something from command line to a chart in the browser**

uses [frappe charts](https://frappe.github.io/charts/) for, ahem, charting...

[![npm status](http://img.shields.io/npm/v/catchart.svg?style=flat-square)](https://www.npmjs.org/package/catchart) 

## command line

`npm i -g catchart`

#### simple y over t
```
echo 1\n2\n3 | catchart
```
<img src="/1.png?raw=true" width="400">

#### custom label / value
```
echo sunday,1\nmonday,2\ntuesday,3 | catchart
```
<img src="/2.png?raw=true" width="400">

#### multiple data sets over time
```
echo 1,2,3\n4,5,6\n-1,-2,-3 | catchart
```
<img src="/3.png?raw=true" width="400">

#### other chart types, custom title
```
echo 1,2,3\n4,5,6\n-1,-2,-3 | catchart --title=catchart --chartType=bar
```
chart types: `line`, `scatter`, `bar`

<img src="/4.png?raw=true" width="400">

## api
TBD

## license

[MIT](http://opensource.org/licenses/MIT) © Yaniv Kessler
