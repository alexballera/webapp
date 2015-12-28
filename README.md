## Overview
* [Instalamos Dependencias](#instalamos-dependencias)
* [Declaramos Dependencias](#declaramos-las-dependencias)
* [Servidor Browsersync](#servidor-browsersync)
* [Declaramos variables globales](#declaramos-las-variables-globales)
* [HTML](#html)
* [Styles](#styles)
* [Scripts](#scripts)
* [Images](#images)
* [Inyectamos CSS y JS](#inyectamos-css-y-js-con-gulp-inject)
* [Inyectamos Librerías de Bower](#inyectamos-librerias-de-bower-con-wiredep)
* [Clean](#clean)
* [Instalamos Bower y NPM](#instalamos-bower-y-npm)
* [Copy](#copy)
* [Watch & Reload](#watch-reload)
* [Install](#install)
* [Build](#build)
* [Default](#default)
* [Licencia](#licencia)

## Instalamos Dependencias
```sh
npm install --save-dev gulp browser-sync gulp-minify-html gulp-sass gulp-autoprefixer gulp-minify-css gulp-rename gulp-uncss browserify vinyl-source-stream vinyl-buffer gulp-uglify gulp-imagemin imagemin-pngquant gulp-cache del gulp-inject wiredep gulp-install
```
##Declaramos las dependencias
```javascript
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
```
##Declaramos las variables globales
```javascript
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

```
##Servidor - Browsersync
[Browsersync](http://www.browsersync.io/ )  
```javascript
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
```

##HTML
[gulp-minify](https://www.npmjs.com/package/gulp-minify-html)  
**Tasks**  
```javascript
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
```
##Styles
[gulp-sass](https://www.npmjs.com/package/gulp-sass)  
[gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)  
[gulp-minify-css](https://www.npmjs.com/package/gulp-minify-css)  
[gulp-rename](https://www.npmjs.com/package/gulp-rename)  
[gulp-uncss](https://www.npmjs.com/package/gulp-uncss)  
**Tasks**  
```javascript
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
```
##Scripts
[gulp-uglify](https://www.npmjs.com/package/gulp-uglify)  
[gulp-jshint](https://www.npmjs.com/package/gulp-jshint)  
[gulp-concat](https://www.npmjs.com/package/gulp-concat)  
**Tasks**  
```javascript
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
```
##Images
[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)  
[imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant)  
[gulp-cache](https://github.com/jgable/gulp-cache)  
[del](https://www.npmjs.com/package/del)  
**Tasks**  
```javascript
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
```
##Inyectamos css y js con gulp-inject
[gulp-inject](https://www.npmjs.com/package/gulp-inject)  
Con gulp-inject, inyectamos archivos al html, como por ejemplo la hoja de estilo css y la hoja de script js.  
**Tasks**  
```javascript
// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src(globs.html.main)
    .pipe(inject(gulp.src([globs.styles.src + '/style.min.css', globs.scripts.src + '/vendors/*.js', globs.scripts.src + '/main.min.js'], {read: false}), {relative: true}))
    .pipe(gulp.dest(globs.src))
})
```
**Preparamos el archivo index.html**  
```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
    <!-- inject:css -->
    <!-- endinject -->
</head>
<body> 
    <!-- inject:js -->
    <!-- endinject -->
</body>
</html>
```
##Inyectamos librerías de Bower con wiredep
[wiredep](https://www.npmjs.com/package/wiredep)  
Con wiredep, inyectamos las librerías de bower (css y js) al html. Se deben agregar las dependencias mediante el comando  
**Tasks**  
```javascript
// Inyectando las librerias Bower
gulp.task('wiredep', function () {
  gulp.src('./src/*.html')
    .pipe(wiredep({
      directory: './src/bower_components'
    }))
    .pipe(gulp.dest(globs.build))
})
```
**Preparamos el archivo index.html**  
```html
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
    <!-- bower:css -->
    <!-- endbower -->
</head>
<body> 
    <!-- bower:js -->
    <!-- endbower -->
</body>
</html>
```
**bower.json**  
Agregar las siguientes líneas “overrides” antes de “dependencies”  
```json
"overrides": {
    "bootstrap": {
      "main": [
        "dist/js/bootstrap.min.js",
        "dist/css/bootstrap.min.css",
        "less/bootstrap.less"
      ]
    },
    "jquery": {
      "main": "dist/jquery.min.js"
    },
    "font-awesome": {
      "main": "css/font-awesome.min.css"
    }
  }
```
**.bowerrc**  
Verificamos las siguientes líneas de código  
```json
{
  "directory": "src/bower_components",
  "scripts" :  {
    "postinstall" : "gulp wiredep", 
    "postinstall" : "gulp copy"
  }
}
```
##Clean
[del](https://www.npmjs.com/package/del)  
**Tasks**  
Podemos hacer tareas por archivo o directorio, o un task clean e incluir allí todas las tareas  
```javascript
// Clean
gulp.task('clean', function (cb) {
  return del([globs.build, globs.dist], cb)
})
```
##Instalamos **bower** y **npm**
**Tasks**  
```javascript
// Install
gulp.task('install', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe(install())
})
```
##Copy
**Tasks**  
```javascript
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
```
**.bowerrc**  
Verificamos las siguientes líneas de código  
```json
{
  "directory": "src/bower_components",
  "scripts" :  {
    "postinstall" : "gulp wiredep", 
    "postinstall" : "gulp copy"
  }
}
```
##Watch & Reload
```javascript
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
```
##Install
```javascript
// Install
gulp.task('server', ['install'], function () {
  gulp.start('build')
})
```
Ejecutamos desde la terminal  
```sh
$ gulp server
```
##Build
```javascript
// Build
gulp.task('build', ['copy'], function () {
  gulp.start('build:html', 'build:scripts', 'build:images', 'inject', 'wiredep', 'build:styles', reload)
})
```
Ejecutamos desde la terminal  
```sh
$ gulp build
```
##Default
Creamos una función con **start**, para que primero se ejecute clean, y luego el resto de las dependencias  
```javascript
// Default
gulp.task('default', ['clean'], function () {
  gulp.start('serve', 'watch', 'build')
})
```
Ejecutamos desde la terminal  
```sh
$ gulp
```
##Licencia
[MIT License](https://github.com/alexballera/webapp/blob/master/LICENSE)  

