module.exports = {
	mode: process.env.BUILD_MODE || 'production',
	entry: './client.js',
	output: {
		filename: 'client.js'
	}
}