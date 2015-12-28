var gulp = require('gulp')
var browserSync = require('browser-sync')
var reload = browserSync.reload
var minifyHTML = require('gulp-minify-html')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var minifycss = require('gulp-minify-css')
var rename = require('gulp-rename')
var uncss = require('gulp-uncss')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var imagemin = require('gulp-imagemin')
var pngquant = require('imagemin-pngquant')
var cache = require('gulp-cache')
var del = require('del')
var inject = require('gulp-inject')
var wiredep = require('wiredep').stream
var install = require('gulp-install')

// Variables
var globs = {
  build: './build',
  dist: './dist',
  src: './src',
  html: {
    main: './src/index.html',
    watch: './src/**/*.html',
    build: './build',
    dist: './dist'
  },
  styles: {
    main: './src/styles/scss/style.scss',
    watch: './src/styles/scss/**/*.scss',
    src: './src/styles',
    build: './build/styles',
    dist: './dist/styles'
  },
  scripts: {
    main: './src/scripts/main.js',
    watch: './src/scripts/**/*.js',
    src: './src/scripts',
    build: './build/scripts',
    dist: './dist/scripts'
  },
  images: {
    main: './src/images/**',
    watch: './src/images/**/*.*',
    src: './src/images',
    build: './build/images',
    dist: './dist/images'
  },
  videos: {
    main: './src/videos/**',
    watch: './src/videos/**/*.*',
    src: './src/videos',
    build: './build/videos',
    dist: './dist/videos'
  },
  fonts: {
    main: './src/styles/fonts/**',
    watch: './src/styles/fonts/**/*.*',
    src: './src/styles/fonts',
    build: './build/styles/fonts',
    dist: './dist/styles/fonts'
  }
}

// Servidor - Browsersync
gulp.task('serve', function () {
  browserSync.init({
    notify: false,
    logPrefix: 'BS',
    server: {
      baseDir: [globs.build]
    },
    host: '0.0.0.0',
    port: 8080,
    ui: {
      port: 8081
    },
    browser: ['google-chrome']
  })
})

// HTML minificado
gulp.task('build:html', function () {
  var opts = {
    conditionals: true,
    spare: true
  }
  return gulp.src(globs.html.main)
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(globs.build))
    .pipe(gulp.dest(globs.dist))
})

// Styles: CSS  Minificado
gulp.task('build:styles', ['styles'], function () {
  gulp.start('uncss')
})
gulp.task('styles', function () {
  return gulp.src(globs.styles.main)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(globs.styles.src))
})
// Optimiza styles.min.css
gulp.task('uncss', function () {
  return gulp.src(globs.styles.src + '/style.css')
    .pipe(uncss({
      html: ['index.html', globs.html.watch]
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(globs.styles.src))
    .pipe(gulp.dest(globs.styles.dist))
    .pipe(gulp.dest(globs.styles.build))
})

// Scripts: todos los archivos JS concatenados en uno solo minificado
gulp.task('build:scripts', function () {
  return browserify(globs.scripts.main)
    .bundle()
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(globs.scripts.src))
    .pipe(gulp.dest(globs.scripts.dist))
    .pipe(gulp.dest(globs.scripts.build))
})

// Images
gulp.task('build:images', function () {
  return gulp.src(globs.images.main)
    .pipe(cache(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
      use: [pngquant()]
    })))
    .pipe(gulp.dest(globs.images.build))
    .pipe(gulp.dest(globs.images.dist))
})

// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src(globs.html.main)
    .pipe(inject(gulp.src([globs.styles.src + '/style.min.css', globs.scripts.src + '/vendors/*.js', globs.scripts.src + '/main.min.js'], {read: false}), {relative: true}))
    .pipe(gulp.dest(globs.src))
})

// Inyectando las librerias Bower
gulp.task('wiredep', function () {
  gulp.src('./src/*.html')
    .pipe(wiredep({
      directory: './src/bower_components'
    }))
    .pipe(gulp.dest(globs.build))
})

// Clean
gulp.task('clean', function (cb) {
  return del([globs.build, globs.dist], cb)
})

// Install
gulp.task('install', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe(install())
})

// Copy
gulp.task('copy', function () {
  gulp.src(globs.html.watch)
    .pipe(gulp.dest('./'))
  gulp.src(['./src/bower_components/**'])
    .pipe(gulp.dest('./build/bower_components'))
    .pipe(gulp.dest('./dist/bower_components'))
  gulp.src(globs.fonts.src + '/**/*.*')
    .pipe(gulp.dest(globs.fonts.build))
  gulp.src(globs.styles.src + '/vendors/*.css')
    .pipe(gulp.dest(globs.styles.build + '/vendors/'))
  gulp.src([globs.scripts.src + '/vendors/*.js'])
    .pipe(gulp.dest(globs.scripts.build + '/vendors/'))
    .pipe(gulp.dest(globs.scripts.dist + '/vendors/'))
  gulp.src(globs.videos.watch)
    .pipe(gulp.dest(globs.videos.build))
    .pipe(gulp.dest(globs.videos.dist))
})

// Reload
gulp.watch([
  globs.html.watch,
  globs.styles.watch,
  globs.scripts.watch,
  './bower.json'
]).on('change', reload)

// Watch
gulp.task('watch', function () {
  gulp.watch(globs.html.watch, ['build:html'])
  gulp.watch(globs.styles.watch, ['build:styles'])
  gulp.watch(globs.scripts.watch, ['build:scripts'])
  gulp.watch(globs.images.watch, ['build:images'])
  gulp.watch(['./bower.json'], ['wiredep', 'copy'])
})

// Install
gulp.task('server', ['install'], function () {
  gulp.start('build')
})

// Build
gulp.task('build', ['copy'], function () {
  gulp.start('build:html', 'build:scripts', 'build:images', 'inject', 'wiredep', 'build:styles', reload)
})

// Default
gulp.task('default', ['clean'], function () {
  gulp.start('serve', 'watch', 'build')
})
