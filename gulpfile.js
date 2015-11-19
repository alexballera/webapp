var gulp			= require('gulp');
var browserSync	= require('browser-sync');
var reload			= browserSync.reload;
var minifyHTML    = require('gulp-minify-html');
var sass			= require('gulp-sass');
var autoprefixer	= require('gulp-autoprefixer');
var minifycss		= require('gulp-minify-css');
var rename 		= require('gulp-rename');
var uncss			= require('gulp-uncss');
var	inject			= require('gulp-inject');
var jshint			= require('gulp-jshint');
var uglify			= require('gulp-uglify');
var concat			= require('gulp-concat');
var imagemin		= require('gulp-imagemin');
var pngquant		= require('imagemin-pngquant');

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
	},
	images: {
		main: './src/images/**',
		watch: './src/images/**/*',
		output: './app/images'
	}
};

// HTML minificado
gulp.task('build:html', function() {
	var opts = {
		conditionals: true,
		spare:true
	};
	return gulp.src(config.html.main)
	.pipe(minifyHTML(opts))
	.pipe(gulp.dest(config.html.output));
});

//Styles - Optimizado con uncss y minificado
gulp.task('build:css', function(){
	gulp.src(config.styles.main)
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer('last 2 version'))
	.pipe(rename({ suffix: '.min' }))
	.pipe(minifycss())
	.pipe(uncss({
		html: config.html.main
	}))
	.pipe(gulp.dest(config.styles.output))
});

// Scripts: todos los archivos JS concatenados en uno solo minificado
gulp.task('build:js', function() {
	return gulp.src(config.scripts.main)
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(concat('main.js'))
	.pipe(rename({ suffix: '.min' }))
	.pipe(uglify())
	.pipe(gulp.dest(config.scripts.output));
});

// Images
gulp.task('build:images', function() {
	return gulp.src(config.images.main)
	.pipe(imagemin({
		optimizationLevel: 3,
		progressive: true,
		interlaced: true,
		use: [pngquant()]
	}))
	.pipe(gulp.dest(config.images.output));
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
	gulp.watch(config.images.watch, ['build:images']);
});

//Build
gulp.task('build', ['build:html', 'build:css', 'build:js', 'build:images', 'inject']);

//Default
gulp.task('default', ['serve', 'watch', 'build']);