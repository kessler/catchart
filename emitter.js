const program = require('commander')

let customLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
let position = 0

program.version('0.0.1')
	.option('-f, --jsonDataField <jsonDataField>', 'json data field', 'data')
	.option('-c, --customLabel', 'output custom labels')

program.command('json')
	.action(() => {

		let count = 1
		setInterval(() => {
			let row = `{ "${program.jsonDataField}": ["${next()}", "${next()}", "foo"]`
			if (program.customLabel) {
				 row += `, "label": "${getCustomLabel()}"`
			}

			row += '}'

			console.error(`emitter: ${row}`)
			console.log(row)
		}, 1000)

		function next() {
			if (Math.random() > 0.5) {
				return count++
			} else {
				return count--
			}
		}
	})

program.command('singlecsv')
	.action(() => {
		let count = 1
		setInterval(() => {
			console.log(`${next()}`)
		}, 1000)

		function next() {
			if (Math.random() > 0.5) {
				return count++
			} else {
				return count--
			}
		}
	})

program.command('csv')
	.action(() => {

		let count = 1

		setInterval(() => {
			let row = `${next()},${next()},${next()},${next()}`
			if (program.customLabel) {
				row = `${getCustomLabel()}, ${row}`
			}

			console.error(`emitter: ${row}`)
			console.log(row)
		}, 1000)

		function next() {
			if (Math.random() > 0.5) {
				return count++
			} else {
				return count--
			}
		}
	})

program.parse(process.argv)

function getCustomLabel() {
	if (position === customLabel.length) {
		position = 0
	}

	return customLabel[position++]
}