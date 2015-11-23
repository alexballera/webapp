var gulp              = require('gulp');
var browserSync = require('browser-sync');
var reload           = browserSync.reload;
var minifyHTML   = require('gulp-minify-html');
var sass              = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var minifycss      = require('gulp-minify-css');
var rename         = require('gulp-rename');
var uncss            = require('gulp-uncss');
var jshint             = require('gulp-jshint');
var uglify             = require('gulp-uglify');
var concat            = require('gulp-concat');
var imagemin       = require('gulp-imagemin');
var pngquant        = require('imagemin-pngquant');
var cache              = require('gulp-cache');
var del               = require('del');
var inject               = require('gulp-inject');
var wiredep           = require('wiredep').stream;
var install              = require("gulp-install");

//Servidor - Browsersync
gulp.task('serve', function () {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    server: {
      baseDir: [ './dist', './app']
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
    main: './app/index.html',
    watch: './app/**/*.html',
    output: './dist'
  },
  styles: {
    main: './app/styles/scss/style.scss',
    watch: './app/styles/scss/**/*.scss',
    app: './app/styles',
    output: './dist/styles'
  },
  scripts: {
    main: './app/scripts/main.js',
    watch: './app/scripts/**/*.js',
    app: './app/scripts',
    output: './dist/scripts'
  },
  images: {
    main: './app/images/resources/**',
    watch: './app/images/**/*.*',
    app: './app/images',
    output: './dist/images'
  }
};

//HTML minificado
gulp.task('html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };
  return gulp.src(config.html.main)
  .pipe(minifyHTML(opts))
  .pipe(gulp.dest(config.html.output));
});

//Styles: CSS  Minificado
gulp.task('styles', ['build:styles'], function() {
    gulp.start('uncss');
});
gulp.task('build:styles', function(){
  return gulp.src(config.styles.main)
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer('last 2 version'))
  .pipe(gulp.dest(config.styles.app))
  .pipe(rename({ suffix: '.min' }))
  .pipe(minifycss())
  .pipe(gulp.dest(config.styles.app));
});

// Optimiza styles.min.css
gulp.task('uncss', function() {
  return gulp.src(config.styles.app + '/style.min.css')
  .pipe(uncss({
    html: ['index.html', 'app/**/*.html']
    }))
  .pipe(gulp.dest(config.styles.output))
  .pipe(gulp.dest(config.styles.app));
});

// Scripts: todos los archivos JS concatenados en uno solo minificado
gulp.task('scripts', function() {
  return gulp.src([config.scripts.app+'/js/*.js', config.scripts.app+'/vendors/*.js'])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(concat('main.js'))
  .pipe(rename({ suffix: '.min' }))
  .pipe(uglify())
  .pipe(gulp.dest(config.scripts.output))
  .pipe(gulp.dest(config.scripts.app));
});

// Images
gulp.task('images', ['build:images'], function() {
    gulp.start('clean:images');
});
gulp.task('build:images', ['copy:images'], function() {
  return gulp.src(config.images.main)
  .pipe(cache(imagemin({
    optimizationLevel: 3,
    progressive: true,
    interlaced: true,
    use: [pngquant()]
  })))
  .pipe(gulp.dest(config.images.app))
  .pipe(gulp.dest(config.images.output));
});
gulp.task('copy:images', function() {
  return gulp.src(config.images.app + '/*.*')
  .pipe(gulp.dest(config.images.output));
});
gulp.task('clean:images', function(cb) {
    del(config.images.main + '/*.*', cb);
});

// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src('./app/*.html')
  .pipe(inject(gulp.src(['./app/styles/style.min.css', './app/scripts/main.min.js'], {read: false}), {relative: true}))
  .pipe(gulp.dest('./app'));
});

// Inyectando las librerias Bower
gulp.task('wiredep', function () {
  gulp.src('./app/*.html')
  .pipe(wiredep({
    directory: './app/bower_components'
  }))
  .pipe(gulp.dest('./app'));
});

// Clean
gulp.task('clean', function(cb) {
    return del(['./dist/**/.*.html', './dist/bower_components/**', config.styles.output, config.scripts.output, config.images.output], cb);
});

//Install
gulp.task('install', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(install());
});

//Copy
gulp.task('copy', function () {
  return gulp.src(['./app/bower_components/**'])
  .pipe(gulp.dest('./dist/bower_components'));
});

//Watch
gulp.task('watch', function(){
  gulp.watch(config.html.watch, ['build']);
  gulp.watch(config.html.watch).on('change', reload);
  gulp.watch(config.styles.watch, ['styles']);
  gulp.watch(config.styles.watch).on('change', reload);
  gulp.watch(config.scripts.watch, ['scripts']);
  gulp.watch(config.scripts.watch).on('change', reload);
  gulp.watch(config.images.watch, ['images']);
  gulp.watch(config.images.watch).on('change', reload);
  gulp.watch(['./bower.json'], ['wiredep', 'copy']);
  gulp.watch('./bower.json').on('change', reload);
});

//Install
gulp.task('update', ['install'], function(){
  gulp.start('build');
});

//Build
gulp.task('build', ['html', 'styles', 'scripts', 'images', 'inject', 'wiredep', 'copy']);

//Default
gulp.task('default', ['clean'], function() {
  gulp.start('serve', 'watch', 'build');
});