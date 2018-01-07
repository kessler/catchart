#!/usr/bin/env node
const chartcat = require('./index')
const config = require('./config')
const StreamSlicer = require('stream-slicer')
const pump = require('pump')

chartcat(pump(process.stdin, new StreamSlicer()), config)