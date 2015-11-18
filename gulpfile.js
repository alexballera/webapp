var gulp		= require('gulp');
var webserver	= require('gulp-webserver');
var sass		= require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss 	= require('gulp-minify-css');
var rename 	= require('gulp-rename');

//Servidor
gulp.task('server', function(){
	gulp.src('./build')
	.pipe(webserver({
		host: '0.0.0.0',
		port: 8080,
		livereload: true
	}));
});

//Variables
var globs = {
	styles: {
		main: './src/scss/main.scss',
		watch: './src/scss/**/*.scss',
		output: './build/css'
	},
	html: {
		watch: './src/*.html'
	}
}

//Styles
gulp.task('build:css', function(){
	gulp.src(globs.styles.main)
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer('last 2 version'))
	.pipe(rename({ suffix: '.min' }))
	.pipe(minifycss())
	.pipe(gulp.dest(globs.styles.output));
	});

//Watch
gulp.task('watch', function(){
	gulp.watch(globs.styles.watch, ['build:css']);
	gulp.watch(globs.html.watch, ['build']);
});

//Build
gulp.task('build', ['build:css']);

//Default
gulp.task('default', ['server', 'watch', 'build']);