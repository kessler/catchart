import Chart from 'chart.js/auto'

import domReady from 'domready'
import pattern from 'patternomaly'

domReady(main)

function main() {

	const context = global.$$context

	if (context.showValueLabels) {
		labelPlugin()
	}

	const chartData = {
		datasets: [],
		labels: []
	}

	const chartConfig = {
		data: chartData,
		type: context.chartType,
		options: {
			title: {
				display: true,
				text: context.title
			},

			scales: {
				yLeft: {
					position: 'left'
				}
			}
		}
	}

	const { left, right } = context.yAxisAlignment || {}

	if (right && right.length > 0) {
		chartConfig.options.scales.yRight = {
			position: 'right',
			grid: {
				drawOnChartArea: false, // only want the grid lines for one axis to show up
			}
		}
	}

	for (let i = 0; i < context.fieldCount; i++) {
		let borderColor = pickColor()
		let patternName = pickPattern()

		let backgroundColor
		if (context.usePatterns) {
			backgroundColor = pattern.draw(patternName, borderColor.toString(0.2))
		} else {
			backgroundColor = borderColor.toString(0.2)
		}

		const dataset = {
			yAxisID: 'yLeft',
			borderColor: borderColor.toString(),
			backgroundColor,
			borderWidth: 1,
			fill: true,
			tension: 0.2,
			label: `dataset #${i + 1}`,
			data: []
		}

		if (right && right.includes(i)) {
			dataset.yAxisID = 'yRight'
		}

		chartData.datasets.push(dataset)
	}

	const chart = new Chart(document.getElementById('myChart'), chartConfig)

	const host = global.document.location.host

	const ws = new WebSocket('ws://' + host)

	let count = 0

	ws.onopen = () => console.log('opened')
	ws.onclose = () => console.log('close')
	ws.onerror = err => console.error(err)

	ws.onmessage = event => {
		let shouldTrim = count++ > context.windowSize
		let entry = JSON.parse(event.data)

		for (let i = 0; i < entry.values.length; i++) {
			let data = chartData.datasets[i].data
			data.push(parseFloat(entry.values[i]))

			if (shouldTrim) {
				data.shift()
			}
		}

		let labels = chartData.labels
		labels.push(entry.label)

		if (shouldTrim) {
			labels.shift()
		}

		chart.update()
	}
}

class Color {
	constructor(r, g, b, a = 1) {
		this.r = r
		this.g = g
		this.b = b
		this.a = a
	}

	toString(overrideAlpha) {
		let alpha = overrideAlpha
		if (overrideAlpha === undefined) {
			alpha = this.a
		}

		return `rgba(${this.r},${this.g},${this.b},${alpha})`
	}
}

let colorIndex = 0
const colors = [
	new Color(0, 215, 0), new Color(0, 0, 215), new Color(0, 215, 215), new Color(244, 119, 66), new Color(215, 0, 0),
	new Color(65, 244, 241), new Color(106, 65, 244), new Color(60, 60, 60), new Color(0, 0, 0)
]

let patternIndex = 0
const patternNames = [
	'plus', 'cross', 'dash', 'cross-dash', 'dot', 'dot-dash', 'disc', 'ring', 'line', 'line-vertical',
	'weave', 'zigzag', 'zigzag-vertical', 'diagonal', 'diagonal-right-left', 'square', 'box', 'triangle',
	'triangle-inverted', 'diamond', 'diamond-box'
]

function pickColor() {
	if (colorIndex === colors.length) {
		colorIndex = 0
	}

	return colors[colorIndex++]
}

function pickPattern() {
	if (patternIndex === patternNames.length) {
		patternIndex = 0
	}

	return patternNames[patternIndex++]
}

function labelPlugin() {
	Chart.plugins.register({
		afterDatasetsDraw
	})

	function afterDatasetsDraw(chart, easing) {

		// To only draw at the end of animation, check for easing === 1
		var ctx = chart.ctx

		for (let i = 0; i < chart.data.datasets.length; i++) {
			let dataset = chart.data.datasets[i]
			var meta = chart.getDatasetMeta(i)
			if (!meta.hidden) {
				for (let j = 0; j < meta.data.length; j++) {
					let element = meta.data[j]

					// Draw the text in black, with the specified font
					ctx.fillStyle = 'rgb(0, 0, 0)'

					var fontSize = 16
					var fontStyle = 'normal'
					var fontFamily = 'Helvetica Neue'
					ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily)

					// Just naively convert to string for now
					var dataString = dataset.data[j].toString()

					// Make sure alignment settings are correct
					ctx.textAlign = 'center'
					ctx.textBaseline = 'middle'

					var padding = 5
					var position = element.tooltipPosition()
					ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding)
				}
			}
		}
	}
}