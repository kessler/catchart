#!/usr/bin/env node

const chartcat = require('./index')
const StreamSlicer = require('stream-slicer')
const { pipeline } = require('stream')
const program = require('./program')

let slicer = new StreamSlicer({ sliceBy: program.rowSeparator })
let chartStream = chartcat(program)

pipeline(process.stdin, slicer, chartStream, err => {
	if (err) {
		return console.error(err)
	}
})