var gulp			= require('gulp'),
	browserSync	= require('browser-sync'),
	reload			= browserSync.reload,
	sass			= require('gulp-sass'),
	autoprefixer	= require('gulp-autoprefixer'),
	minifycss 		= require('gulp-minify-css'),
	// install			= require('gulp-install'),
	rename 		= require('gulp-rename');

//Variables
var config = {
	styles: {
		main: './src/scss/style.scss',
		watch: './src/scss/**/*.scss',
		output: './app/css'
	},
	html: {
		watch: './app/*.html'
	}
};

//Servidor - Browsersync
gulp.task('serve', function () {
	'use strict';
	browserSync({
		notify: false,
		logPrefix: 'BS',
		server: {
			baseDir:  ['app', 'dist']
		},
		host: '0.0.0.0',
		port: 8080,
		ui: {
			port: 8081
		},
		browser: ["google-chrome", "firefox"]
	});
});

//Styles
gulp.task('build:css', function(){
	gulp.src(config.styles.main)
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer('last 2 version'))
	.pipe(rename({ suffix: '.min' }))
	.pipe(minifycss())
	.pipe(gulp.dest(config.styles.output))
});
// gulp.task('install', function(){
// 	gulp.src('./package.json')
// 	.pipe(install());
// });


//Watch
gulp.task('watch', function(){
	gulp.watch(config.styles.watch, ['build:css']);
	gulp.watch(config.html.watch, ['build']);
	gulp.watch(config.styles.watch).on('change', reload);
	gulp.watch(config.html.watch).on('change', reload);
});

//Build
gulp.task('build', ['build:css']);

//Default
gulp.task('default', ['serve', 'watch', 'build']);