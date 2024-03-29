const hcat = require('hcat')
const WebSocket = require('ws')
const fs = require('fs')
const path = require('path')
const HumanTime = require('custom-human-time')
const LinkedList = require('digital-chain')
const through2 = require('through2')
const debug = require('debug')('catchart')
const defaultConfig = require('./config')
const enableDestroy = require('server-destroy')

const { isNullOrUndefined } = require('util')

const timeFormatter = new HumanTime({
	names: {
		millisecond: ' ms',
		second: ' s',
		minute: ' m',
		hour: ' h'
	}
})

module.exports = function(config) {
	let done = false
	let initialized = false
	// TODO maybe apply defaults here for programmatic use
	config = config || defaultConfig

	debug('config is %o', config)

	// hcat option
	// we don't want the server to die right after first request
	// since we're serving websockets, so this is enforced
	config.serveOnce = false

	const state = {
		// how long we're resting between exec() when the buffer is empty
		// this number will grow exponentially if the buffer is empty 
		// and then reset back to 10 when the buffer has something in it
		websocketTransmitDelayMillis: 10,
		// start time of the first chunk
		startTime: undefined,
		buff: new LinkedList(),
		websocketConnected: false,
		inputFormat: config.inputFormat,
		dataField: config.dataField,
		labelSource: config.labelSource
	}

	// start the show
	let stream = through2(processInput)
	stream.on('finish', shutdown)

	return stream

	function processInput(chunk, enc, cb) {

		if (enc !== 'buffer') {
			throw new Error(`unexpected encoding ${enc}`)
		}

		let data = toString(chunk)

		if (!initialized) {
			init(data)
		}

		data = state.parseFunction(data)

		let entry = {
			values: state.dataFunction(data),
			label: state.labelFunction(data, state)
		}

		debug('process input [%o]', entry)
		state.buff.push(entry)

		cb()
	}

	function init(data) {
		state.startTime = Date.now()

		let dataField = state.dataField
		let labelSource = state.labelSource

		if (state.inputFormat === 'auto') {
			debug('inputFormat is "auto"')
			if (data.startsWith('{')) {
				state.inputFormat = 'json'
			} else {
				state.inputFormat = 'csv'
			}
		}

		debug('inputFormat set to "%s"', state.inputFormat)

		if (state.inputFormat === 'json') {
			state.parseFunction = parseFunctions.json

			if (dataField === 'auto') {
				debug('dataField is "auto"')
				dataField = ['value', 'data']
			}

			if (!Array.isArray(dataField)) {
				dataField = [dataField]
			}

			debug('dataField set to [%o]', dataField)

			if (labelSource === 'auto') {
				debug('lableSource is "auto"')
				labelSource = ['label', 'title', 'key']
			}

			if (!Array.isArray(labelSource)) {
				labelSource = [labelSource]
			}

			debug('labelSource set to [%o]', labelSource)

			state.dataFunction = dataFunctions.json(dataField)
			state.labelFunction = labelFunctions.json(labelSource)

		} else {

			state.parseFunction = parseFunctions.arrSplit
			debug('labelSource is "%s"', labelSource)

			if (labelSource === 'auto') {
				state.dataFunction = dataFunctions.arr
				state.labelFunction = labelFunctions.timeSeries
			} else {
				state.dataFunction = dataFunctions.arrSlice(1)
				state.labelFunction = labelFunctions.arrFirst
			}
		}

		const parsed = state.parseFunction(data)
		const sliced = state.dataFunction(parsed)

		if (config.fieldCount === 'auto') {
			debug('fieldCount is set to "auto"')
			config.fieldCount = sliced.length
			debug('setting fieldCount to "%d", deduced from first row of data', sliced.length)
		}

		let yAxisAlignment
		let alignmentFromConfig = getAlignmentFromConfig(config)

		if (!config.disableAutoAlignYAxis && !alignmentFromConfig) {
			debug('autoAlignYAxis is enabled')
			
			const nMags = sliced.map(calcNumberMagnitude)
			const magAvg = average(nMags)
			debug('values magnitude vector is %o, magnitude average is %s', nMags, magAvg)
			
			yAxisAlignment = splitByAverage(nMags, magAvg)
		} else {
			// map all to left otherwise
			yAxisAlignment = alignmentFromConfig || { left: sliced.map((v, i) => i), right: [] }
		}

		debug(`data series aligment is: left %o, right %o`, yAxisAlignment.left, yAxisAlignment.right)

		const clientContext = {
			chartType: config.chartType,
			noFill: config.noFill,
			usePatterns: config.usePatterns,
			windowSize: config.windowSize,
			title: config.title,
			fieldCount: config.fieldCount,
			showValueLabels: config.showValueLabels,
			disableAnimation: config.disableAnimation,
			yAxisAlignment
		}

		debug('client context: %o', clientContext)

		state.server = hcat(createClientPage(clientContext), config)
		enableDestroy(state.server)
		state.wss = new WebSocket.Server({ server: state.server })
		state.wss.on('connection', onIncomingConnection)

		initialized = true
	}

	function onIncomingConnection(ws) {
		if (state.websocketConnected) {
			return ws.close(-1, 'too many connections')
		}

		state.websocketConnected = true

		ws.on('error', err => {
			console.error('websocket error', err)
		})

		ws.on('close', () => {
			state.websocketConnected = false
		})

		exec(ws)
	}

	function exec(ws) {
		if (done) return
		if (ws.readyState === WebSocket.CLOSE) return

		if (state.buff.length > 0 && ws.readyState === WebSocket.OPEN) {
			state.websocketTransmitDelayMillis = 10
			return ws.send(JSON.stringify(state.buff.shift()), () => exec(ws))
		}

		// some sort of exponential wait time with an upper cap
		// 10 * 2^8
		if (state.websocketTransmitDelayMillis < 2560) {
			state.websocketTransmitDelayMillis *= 2
		}

		setTimeout(() => exec(ws), state.websocketTransmitDelayMillis)
	}

	function shutdown() {
		if (state.server) {
			setTimeout(() => {
				debug('shutting down server...')
				done = true
				state.wss.clients.forEach(ws => ws.terminate())
				state.wss.close()
				state.server.destroy()
			}, 1000)
		}
	}
}

function toString(chunk) {
	return chunk.toString().trim()
}

const labelFunctions = {
	timeSeries: (date, state) => {
		let timeDiff = Date.now() - state.startTime
		return timeFormatter.print(timeDiff)
	},

	json: (fields) => {
		let extract = extractJson(fields)
		return (data, state) => {
			let result = extract(data)

			if (!result) {
				result = labelFunctions.timeSeries(data, state)
			}

			return result
		}
	},

	arrFirst(data) {
		return data[0]
	}
}

const dataFunctions = {
	arr: data => {
		for (let i = 0; i < data.length; i++) {
			let number = parseFloat(data[i])
			if (!isNaN(number)) {
				data[i] = number
			}
		}
		return data
	},

	arrSlice: howMuch => {
		return data => {
			return dataFunctions.arr(data.slice(howMuch))
		}
	},

	json: fields => {
		let extract = extractJson(fields)

		return data => {
			let result = extract(data)

			if (!Array.isArray(result)) {
				result = [result]
			}

			result = dataFunctions.arr(result)

			return result
		}
	}
}

const parseFunctions = {
	json: JSON.parse,
	arrSplit: data => data.split(',')
}

function calcNumberMagnitude(n) {
	if (n === 0) return 0
	return Math.floor(Math.log10(Math.abs(n)))
}

function average(values) {
	return values.reduce((prev, curr) => curr + prev, 0) / values.length
}

function splitByAverage(values, avg) {
	let left = []
	let right = []

	for (let i = 0; i < values.length; i++) {
		if (values[i] <= avg) left.push(i)
		else right.push(i)
	}

	// switch sides if dataset 0 is selected to be on the right side
	if (right.includes(0)) {
		const temp = right
		right = left
		left = temp
	}

	return { right, left }
}

function extractJson(fields) {
	return data => {
		for (let f of fields) {
			let value = data[f]
			if (!isNullOrUndefined(value)) {
				return value
			}
		}
	}
}

function createClientPage(clientContext) {

	let client = fs.readFileSync(path.join(__dirname, 'dist', 'client.js'), 'utf8')

	return `
	<!DOCTYPE html>
	<html>
		<head>
			<script>
				$$context = ${JSON.stringify(clientContext)}
			</script>
			<script>${client}</script>
		</head>
		<body>
			<div style="text-align:center">
				<div class="chart-container" style="width: 95%;margin:auto;">
					<canvas id="myChart"></canvas>
				</div>
			</div>
		</body>
	</html>
	`
}

function getAlignmentFromConfig(cfg) {

	let left = Array.isArray(cfg.yLeft) ? cfg.yLeft : safeJSONParse(cfg.yLeft)
	let right = Array.isArray(cfg.yRight) ? cfg.yRight : safeJSONParse(cfg.yRight)
	
	if (!Array.isArray(left)) {
		left = []
	}

	if (!Array.isArray(right)) {
		right = []
	}

	if (left.length === 0 && right.length === 0) {
		return
	}
	
	return { left, right }
}

function safeJSONParse(str) {
	try {
		return JSON.parse(str)
	} catch (e) {
		debug('safeJSONParse error, this might be ok...', e, str)
		if (!(e instanceof SyntaxError)) {
			throw e
		}
	}
}
