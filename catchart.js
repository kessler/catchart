#!/usr/bin/env node

const catchart = require('./index')
const split = require('split')
const { pipeline } = require('stream')
const program = require('./program')

const chartStream = catchart(program)

pipeline(process.stdin, split(program.rowSeparator), chartStream, err => {
	if (err) {
		console.error(err)
		return 
	}
})