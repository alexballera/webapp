var gulp			= require('gulp'),
	browserSync	= require('browser-sync'),
	reload			= browserSync.reload,
	sass			= require('gulp-sass'),
	autoprefixer	= require('gulp-autoprefixer'),
	minifycss 		= require('gulp-minify-css'),
	rename 		= require('gulp-rename'),
	inject			= require('gulp-inject');

//Variables
var config = {
	styles: {
		main: './src/styles/scss/style.scss',
		watch: './src/styles/scss/**/*.scss',
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

// Inyectando css y js al index.html
gulp.task('inject', function () {
	gulp.src('./app/**/*.html')
	.pipe(inject(gulp.src(config.styles.output + '**/*.css' , {read: false}), {relative: true}))
	.pipe(gulp.dest('./app'));
});



//Watch
gulp.task('watch', function(){
	gulp.watch(config.styles.watch, ['build:css']);
	gulp.watch(config.html.watch, ['build']);
	gulp.watch(config.styles.watch).on('change', reload);
	gulp.watch(config.html.watch).on('change', reload);
	gulp.watch('gulpfile.js').on('change', reload);
});

//Build
gulp.task('build', ['build:css', 'inject']);

//Default
gulp.task('default', ['serve', 'watch', 'build']);