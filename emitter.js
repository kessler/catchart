let count = 1
setInterval(() => {
	console.log(`${next()}\n`)
}, 1000)

function next() {
	if (Math.random() > 0.5) {
		return count++
	} else {
		return count--
	}
}