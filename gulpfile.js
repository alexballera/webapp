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
  html: {
    main: './build/index.html',
    watch: './build/**/*.html',
    build: './build',
    dist: './dist'
  },
  styles: {
    main: './build/styles/scss/style.scss',
    watch: './build/styles/scss/**/*.scss',
    build: './build/styles',
    dist: './dist/styles'
  },
  scripts: {
    main: './build/scripts/js/main.js',
    watch: './build/scripts/**/*.js',
    build: './build/scripts',
    dist: './dist/scripts'
  },
  images: {
    main: './build/images/resources/**',
    watch: './build/images/**/*.*',
    build: './build/images',
    dist: './dist/images'
  },
  videos: {
    main: './build/videos/**',
    watch: './build/videos/**/*.*',
    build: './build/videos',
    dist: './dist/videos'
  },
  fonts: {
    main: './build/styles/fonts/**',
    watch: './build/styles/fonts/**/*.*',
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
gulp.task('html', function () {
  var opts = {
    conditionals: true,
    spare: true
  }
  return gulp.src(globs.html.main)
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(globs.dist))
})

// Styles: CSS  Minificado
gulp.task('styles', ['build:styles'], function () {
  gulp.start('uncss')
})
gulp.task('build:styles', function () {
  return gulp.src(globs.styles.main)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(globs.styles.build))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(globs.styles.build))
})
// Optimiza styles.min.css
gulp.task('uncss', function () {
  return gulp.src(globs.styles.build + '/**.min.css')
    .pipe(uncss({
      html: ['index.html', globs.html.watch]
    }))
    .pipe(gulp.dest(globs.styles.dist))
    .pipe(gulp.dest(globs.styles.build))
})

// Scripts: todos los archivos JS concatenados en uno solo minificado
gulp.task('scripts', function () {
  return browserify(globs.scripts.main)
    .bundle()
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(globs.scripts.dist + '/js'))
    .pipe(gulp.dest(globs.scripts.build + '/js'))
})

// Images
gulp.task('images', ['build:images'], function () {
  gulp.start('clean:images')
})
gulp.task('build:images', ['copy:images'], function () {
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
gulp.task('copy:images', function () {
  return gulp.src(globs.images.build + '/*.*')
    .pipe(gulp.dest(globs.images.dist))
})
gulp.task('clean:images', function (cb) {
  del(globs.images.main + '/*.*', cb)
})

// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src(globs.html.main)
    .pipe(inject(gulp.src([globs.styles.build + '/style.min.css', globs.scripts.build + '/vendors/*.js', globs.scripts.build + '/js/main.min.js'], {read: false}), {relative: true}))
    .pipe(gulp.dest(globs.build))
})

// Inyectando las librerias Bower
gulp.task('wiredep', function () {
  gulp.src('./build/*.html')
    .pipe(wiredep({
      directory: './build/bower_components'
    }))
    .pipe(gulp.dest('./build'))
})

// Clean
gulp.task('clean', function (cb) {
  return del([globs.html.dist + '/**/.*.html', './dist/bower_components/**', globs.styles.dist, globs.scripts.dist, globs.images.dist, globs.videos.dist, globs.fonts.dist], cb)
})

// Install
gulp.task('install', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe(install())
})

// Copy
gulp.task('copy', function () {
  gulp.src(['./build/bower_components/**'])
    .pipe(gulp.dest('./dist/bower_components'))
  gulp.src([globs.scripts.build + '/vendors/*.js'])
    .pipe(gulp.dest(globs.scripts.dist + '/vendors/'))
  gulp.src(globs.html.watch)
    .pipe(gulp.dest('./'))
  gulp.src(globs.videos.watch)
    .pipe(gulp.dest(globs.videos.dist))
  gulp.src(globs.fonts.watch)
    .pipe(gulp.dest(globs.fonts.dist))
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
  gulp.watch(globs.html.watch, ['html'])
  gulp.watch(globs.styles.watch, ['styles'])
  gulp.watch(globs.scripts.watch, ['scripts'])
  gulp.watch(globs.images.watch, ['images'])
  gulp.watch(['./bower.json'], ['wiredep', 'copy'])
})

// Install
gulp.task('server', ['install'], function () {
  gulp.start('build')
})

// Build
gulp.task('build', ['html', 'styles', 'scripts', 'images', 'inject', 'wiredep', 'copy'])

// Default
gulp.task('default', ['clean'], function () {
  gulp.start('serve', 'watch', 'build')
})
