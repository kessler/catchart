const hcat = require('hcat')
const WebSocketServer = require('ws').Server
const fs = require('fs')
const path = require('path')
const HumanTime = require('custom-human-time')
const LinkedList = require('digital-chain')

const timeFormatter = new HumanTime({
	names: {
		millisecond: ' ms',
		second: ' s',
		minute: ' m',
		hour: ' h'
	}
})

const client = fs.readFileSync(path.join(__dirname, 'dist', 'client.js'), 'utf8')
const css = fs.readFileSync(path.join(__dirname, 'node_modules', 'frappe-charts', 'dist', 'frappe-charts.min.css'))

module.exports = function(stream, config) {
	config = config || {}
	config.serveOnce = false

	// how long we're resting between exec()
	let waitTime

	// start time of the first chunk
	let startTime
	let selectedDataFunction
	let buff = new LinkedList()

	stream.once('data', init)
	stream.once('data', () => startTime = Date.now())
	stream.on('data', (chunk) => {
		buff.push(chunk)
	})

	const dataFunctions = {
		keyValueData: data => {
			let splitted = data.split(',')

			if (splitted.length !== 2) {
				throw new Error(`invalid data for key / value pair ${data}`)
			}

			return { label: splitted[0], value: [splitted[1]] }
		},

		timeSeriesData: data => {
			let timeDiff = Date.now() - startTime
			return {
				label: timeFormatter.print(timeDiff),
				value: [data]
			}
		},

		multiValueData: data => {
			let timeDiff = Date.now() - startTime
			let splitted = data.split(',')
			for (let i = 0; i < splitted.length; i++) {
				splitted[i] = parseFloat(splitted[i])
			}

			return {
				label: timeFormatter.print(timeDiff),
				value: splitted
			}
		}
	}

	function init(chunk) {
		if (config.dataFunction !== undefined) {
			selectedDataFunction = dataFunctions[config.dataFunction]
			if (!selectedDataFunction) {
				throw new Error(`invalid data function ${config.dataFunction}`)
			}			
		}

		let data = toString(chunk).split(',')

		selectedDataFunction = selectDataFunction(data)

		if (data.length > 2 && selectedDataFunction === dataFunctions.multiValueData) {
			config.datasetCount = data.length
		}
		
		const html = `
<html>
	<head>
		<style>${css}</style>
		<script>
			$$context = ${JSON.stringify(config)}
		</script>
		<script>${client}</script>
	</head>
	<body>
	<div id="chart"></div>
	</body>
</html>
`
		let server = hcat(html, config)
		let wss = new WebSocketServer({ server: server })
		wss.on('connection', ws => exec(ws))
	}

	function exec(ws) {
		if (buff.length > 0) {
			waitTime = 10
			let data = selectedDataFunction(toString(buff.shift()))
			return ws.send(JSON.stringify(data), () => exec(ws))
		}

		if (waitTime < 2000) {
			waitTime *= 2
		}

		setTimeout(() => exec(ws), waitTime)
	}

	function selectDataFunction(data) {
		
		if (data.length === 2) {
			return dataFunctions.keyValueData
		}

		if (data.length > 2) {
			return dataFunctions.multiValueData
		}

		return dataFunctions.timeSeriesData
	}

	function toString(chunk) {
		return chunk.toString().trim()
	}
}