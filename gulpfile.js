var gulp			= require('gulp');
var browserSync	= require('browser-sync');
var reload			= browserSync.reload;
var minifyHTML    = require('gulp-minify-html');
var sass			= require('gulp-sass');
var autoprefixer	= require('gulp-autoprefixer');
var minifycss		= require('gulp-minify-css');
var rename 		= require('gulp-rename');
var	inject			= require('gulp-inject');
var jshint			= require('gulp-jshint');
var uglify			= require('gulp-uglify');
var concat			= require('gulp-concat');

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

//Variables
var config = {
	html: {
		main: './src/index.html',
		watch: './src/**/*.html',
		output: './app'
	},
	styles: {
		main: './src/styles/scss/style.scss',
		watch: './src/styles/scss/**/*.scss',
		output: './app/css'
	},
	scripts: {
		main: './src/scripts/main.js',
		watch: './src/scripts/**/*.js',
		output: './app/js'
	}
};

// HTML
gulp.task('build:html', function() {
	var opts = {
		conditionals: true,
		spare:true
	};
	return gulp.src(config.html.main)
	.pipe(minifyHTML(opts))
	.pipe(gulp.dest(config.html.output));
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

// Scripts
gulp.task('build:js', function() {
	return gulp.src(config.scripts.main)
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(concat('main.js'))
	.pipe(rename({ suffix: '.min' }))
	.pipe(uglify())
	.pipe(gulp.dest(config.scripts.output));
});

// Inyectando css y js al index.html
gulp.task('inject', function () {
	gulp.src('./app/**/*.html')
	.pipe(inject(gulp.src(
	      [config.styles.output + '**/*.css',
	      config.scripts.output + '**/*.js' ] ,
	      {read: false}),
	{relative: true}))
	.pipe(gulp.dest('./app'));
});



//Watch
gulp.task('watch', function(){
	gulp.watch(config.html.watch, ['build']);
	gulp.watch(config.html.watch).on('change', reload);
	gulp.watch(config.styles.watch, ['build:css']);
	gulp.watch(config.styles.watch).on('change', reload);
	gulp.watch(config.scripts.watch, ['build:js']);
	gulp.watch(config.scripts.watch).on('change', reload);
});

//Build
gulp.task('build', ['build:html', 'build:css', 'build:js', 'inject']);

//Default
gulp.task('default', ['serve', 'watch', 'build']);