const Chart = require('chart.js')
const domReady = require('domready')
const pattern = require('patternomaly')

domReady(main)

function main() {
	const context = global.$$context

	const chartData = {
		datasets: [],
		labels: []
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

		if (context.noFill) {
			backgroundColor = new Color(0, 0, 0, 0)
		}

		chartData.datasets.push({
			label: `dataset #${i + 1}`,
			borderColor: borderColor.toString(),
			backgroundColor,
			borderWidth: 1,
			data: []
		})
	}

	const chart = new Chart('myChart', {
		data: chartData,
		options: {
			title: {
				display: true,
				text: context.title
			}
		},
		type: context.chartType
	})

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