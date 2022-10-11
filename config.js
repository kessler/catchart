const rc = require('rc')

// TODO unify these comments with program.js
module.exports = rc('catchart', {
	rowSeparator: '\n',

	// json
	// csv 
	// auto - if data starts with { json is selected, otherwise assume csv
	inputFormat: 'auto', //json, csv

	// when json
	// if auto then data is obtained from the "value" or "data" property
	// else dataSource is expected to be the name of the data field
	// when csv this config option is ignored
	dataField: 'auto',

	// possible values: 'auto' | [fieldname] for json | [index] for csv
	// when json 
	// if auto select from label from fields: label/title/key
	// otherwise select from field specified in labelSource
	// when csv 
	// if auto, use timeSeries
	// else if set to "row" (or anything else actually) use the first field
	// as label
	// when labels cannot be obtained, use timeSeries
	labelSource: 'auto',

	// show labels on values in the chart
	showValueLabels: false,

	// A json array expression, tells catchart which series Y values are aligned on the LEFT/RIGHT Y axis. Overrides auto align.
	yLeft: undefined,
	yRight: undefined,

	// by default catchart will try to "guess" which side to align the Y values of a data series if there's more than one
	disableAutoAlignYAxis: false,

	// do not fill the area under chart lines with color
	noFill: false,

	// in addition to fill color under chart lines, also apply patterns.
	// this is useful for color blind individuals
	usePatterns: false,

	// size of the buffer
	windowSize: 200,

	// use this flag in increase performance of the chart
	disableAnimation: false,

	// delay (in ms) before shutting down server once ths input stream ended
	shutdownDelay: 1000,

	// how many fields are in a row
	fieldCount: 'auto',

	title: `${new Date()} ::: ${process.cwd()}`,

	chartType: 'line',

	// hcat related options
	port: 0,
	hostname: 'localhost',
	contentType: 'text/html'
})