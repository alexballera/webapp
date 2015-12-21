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

// Servidor - Browsersync
gulp.task('serve', function () {
  browserSync.init({
    notify: false,
    logPrefix: 'BS',
    server: {
      baseDir: [globs.app]
    },
    host: '0.0.0.0',
    port: 8080,
    ui: {
      port: 8081
    },
    browser: ['google-chrome']
  })
})

// Variables
var globs = {
  app: './app',
  dist: './dist',
  html: {
    main: './app/index.html',
    watch: './app/**/*.html',
    app: './app',
    dist: './dist'
  },
  styles: {
    main: './app/styles/scss/style.scss',
    watch: './app/styles/scss/**/*.scss',
    app: './app/styles',
    dist: './dist/styles'
  },
  scripts: {
    main: './app/scripts/js/main.js',
    watch: './app/scripts/**/*.js',
    app: './app/scripts',
    dist: './dist/scripts'
  },
  images: {
    main: './app/images/resources/**',
    watch: './app/images/**/*.*',
    app: './app/images',
    dist: './dist/images'
  },
  videos: {
    main: './app/videos/**',
    watch: './app/videos/**/*.*',
    app: './app/videos',
    dist: './dist/videos'
  },
  fonts: {
    main: './app/fonts/**',
    watch: './app/fonts/**/*.*',
    app: './app/fonts',
    dist: './dist/fonts'
  }
}

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
    .pipe(gulp.dest(globs.styles.app))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(globs.styles.app))
})

// Optimiza styles.min.css
gulp.task('uncss', function () {
  return gulp.src(globs.styles.app + '/**.min.css')
    .pipe(uncss({
      html: ['index.html', globs.html.watch]
    }))
    .pipe(gulp.dest(globs.styles.dist))
    .pipe(gulp.dest(globs.styles.app))
})

// Scripts: todos los archivos JS concatenados en uno solo minificado
gulp.task('scripts', function () {
  return browserify(globs.scripts.main)
    .bundle()
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(globs.scripts.dist + '/js'))
    .pipe(gulp.dest(globs.scripts.app + '/js'))
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
    .pipe(gulp.dest(globs.images.app))
    .pipe(gulp.dest(globs.images.dist))
})
gulp.task('copy:images', function () {
  return gulp.src(globs.images.app + '/*.*')
    .pipe(gulp.dest(globs.images.dist))
})
gulp.task('clean:images', function (cb) {
  del(globs.images.main + '/*.*', cb)
})

// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src(globs.html.main)
    .pipe(inject(gulp.src([globs.styles.app + '/style.min.css', globs.scripts.app + '/vendors/*.js', globs.scripts.app + '/js/main.min.js'], {read: false}), {relative: true}))
    .pipe(gulp.dest(globs.app))
})

// Inyectando las librerias Bower
gulp.task('wiredep', function () {
  gulp.src('./app/*.html')
    .pipe(wiredep({
      directory: './app/bower_components'
    }))
    .pipe(gulp.dest('./app'))
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
  gulp.src(['./app/bower_components/**'])
    .pipe(gulp.dest('./dist/bower_components'))
  gulp.src([globs.scripts.app + '/vendors/*.js'])
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
