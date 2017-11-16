// uncomment when I manage to figure out why this particular css
// is indigestible for browserify-css
//require('frappe-charts/dist/frappe-charts.min.css')

const Chart = require('frappe-charts/dist/frappe-charts.min.cjs.js')
const domReady = require('domready')

let colorIndex = 0
const colors = [
	'green', 'blue', 'violet', 'red', 'orange', 'yellow', 'light-blue',
	'light-green', 'purple', 'magenta', 'grey', 'dark-grey'
]

domReady(main)

function main() {
	const context = global.$$context

	const data = {
		labels: [],
		datasets: []
	}

	for (let i = 0; i < context.datasetCount; i++) {
		console.log(i)
		data.datasets.push({
			title: `dataset #${i + 1}`,
			color: pickColor(),
			values: []
		})
	}

	const chart = new Chart({
		parent: '#chart', // or a DOM element
		title: context.title,
		data,
		type: context.chartType, // or 'line', 'scatter', 'pie', 'percentage'
		height: 250
	})

	const host = global.document.location.host

	const ws = new WebSocket('ws://' + host)

	let count = 0

	ws.onopen = () => console.log('opened')
	ws.onclose = () => console.log('close')
	ws.onerror = err => console.error(err)

	ws.onmessage = event => {

		let data = JSON.parse(event.data)
		console.log(data)
		chart.add_data_point(
			data.value,
			data.label
		)

		if (count++ > context.windowSize) {
			chart.remove_data_point(0)
		}
	}
}

function pickColor() {
	if (colorIndex === colors.length) {
		colorIndex = 0
	}

	return colors[colorIndex++]
}