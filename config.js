const rc = require('rc')

module.exports = rc('catchart', {
	windowSize: 20,
	datasetCount: 1,
	title: `${new Date()} ::: ${process.cwd()}`,

	dataFunction: undefined, // timeSeriesData, keyValueData, multiValueData

	// 'line', 'scatter', 'pie', 'percentage', 'heatmap'
	chartType: 'line'
})