const gulp = require('gulp')
const bro = require('gulp-bro')
const babelify = require('babelify')

gulp.task('build', () => {
	let broStream = bro({
		transform: [			
			babelify.configure({ presets: ['es2015', 'stage-2'] }), 
			['browserify-css'],
			['uglifyify', { global: true }]
		]
	})

	return gulp.src('client.js').pipe(broStream).pipe(gulp.dest('dist'))
})