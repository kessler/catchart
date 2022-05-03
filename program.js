const program = require('commander')
const version = require('./package.json').version
const config = require('./config')

program.version(version)
	.option('-c, --chartType <chartType>', 'Change the chart type <line | bar | radar | pie>', config.chartType)
	.option('-w, --windowSize <windowSize>', 'When piping data to catchart, this is the maximum data points that will appear on the graph at any given time', config.windowSize)
	.option('-t, --title <title>', 'Specify a custom title', config.title)
	.option('-r, --rowSeparator <rowSeparator>', 'The character that separates rows in the input data (default: \\n)')
	.option('--logarithmicScale <logarithmicScale>', 'Use logarithmic scaling in axes, possible values: x y or x,y')
	.option('--inputFormat <inputFormat>', 'The format of each row <auto | json | csv >', config.inputFormat)
	.option('--dataField <dataField>', 
		`When the input format is json, this option will specify which field in the row is the source of the data.
This can be a singular value or an array. When "auto" is set, these fields will be "value" or "data". 
When input format is csv dataField is ignored`, 'auto')
	.option('--labelSource <labelSource>', 
`When the input format is json, labels are obtained from each row using a specific field, specified through this option.
While this option is set to "auto" then label will be obtained from "label" or "title" or "key.
When the input format is csv and labelSource is set to "auto" then the label will be the time difference from the start
to the data point. Setting labelSource to "row" will case the label to be extracted from the data, specifically the first
value in each row will be considered the label`, 'auto')
	.option('--showValueLabels', 'show labels on values in the chart', config.showValueLabels)
	.option('--noFill', 'Do not fill the area under the chart line with color', config.noFill)
	.option('--usePatterns', 'Fill the area under the chart line with a pattern, this is meant for individuals who suffer from color blindness', config.usePatterns)
	.option('--fieldCount <fieldCount>', 'The number of fields that are piped to catchart in each row, "auto" will try to deduce this value from the first row of data', config.fieldCount)
	.option('--port <port>', 'hcat config: http port to use, defaults to a randomly picked port', 0)
	.option('--hostname <hostname>', 'hcat config: hostname of the http server', 'localhost')
	.option('--contentType <contentType>', 'hcat config: content type of the response', 'text/html')
	.option('--shutdownDelay <millis>', 'delay (in ms) before shutting down server once ths input stream ended', 1000)
	.parse(process.argv)

// using \n as default breaks --help
if (program.rowSeparator === undefined) {
	program.rowSeparator = config.rowSeparator
}

module.exports = program