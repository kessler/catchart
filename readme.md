# catchart (WIP)
_(pronounced ca-chart)_

**cat something from command line to a chart in the browser**

[![npm status](http://img.shields.io/npm/v/catchart.svg?style=flat-square)](https://www.npmjs.org/package/catchart) 

## command line

`npm i -g catchart`

#### simple y over t
```
echo 1\n2\n3 | catchart
```
![catchart #1](/1.png?raw=true | width=100)

#### custom label / value
```
echo sunday,1\nmonday,2\ntuesday,3 | catchart
```
![catchart #2](/2.png?raw=true "catchart #2")

#### multiple data sets over time
```
echo 1,2,3\n4,5,6\n-1,-2,-3 | catchart
```
![catchart #3](/3.png?raw=true "catchart #3")

## api
TBD

## license

[MIT](http://opensource.org/licenses/MIT) © Yaniv Kessler
