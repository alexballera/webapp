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
npm install --save-dev gulp browser-sync gulp-minify-html gulp-sass gulp-autoprefixer gulp-minify-css gulp-rename gulp-uncss gulp-jshint gulp-uglify gulp-concat gulp-imagemin imagemin-pngquant gulp-cache del gulp-inject wiredep gulp-install
```

##Declaramos las dependencias
```javascript
var gulp      = require('gulp');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var minifyHTML  = require('gulp-minify-html');
var sass      = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var minifycss   = require('gulp-minify-css');
var rename      = require('gulp-rename');
var uncss     = require('gulp-uncss');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');
var cache     = require('gulp-cache');
var del       = require('del');
var inject      = require('gulp-inject');
var wiredep   = require('wiredep').stream;
var install     = require("gulp-install");

```
##Servidor - Browsersync
[Browsersync](http://www.browsersync.io/ )
```javascript
//Servidor - Browsersync
gulp.task('serve', function () {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    server: {
      baseDir: [ './app', './dist']
    },
    host: '0.0.0.0',
    port: 8080,
    ui: {
      port: 8081
    },
    browser: ["google-chrome", "firefox"]
  });
});
```
##Declaramos las variables globales
```javascript
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

```

##HTML
[gulp-minify](https://www.npmjs.com/package/gulp-minify-html)  
**Tasks**
```javascript
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
```
Watch & reload
```javascript
gulp.watch(config.html.watch, ['build']).on('change', reload);
```
##Styles
[gulp-sass](https://www.npmjs.com/package/gulp-sass)  
[gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)  
[gulp-minify-css](https://www.npmjs.com/package/gulp-minify-css)  
[gulp-rename](https://www.npmjs.com/package/gulp-rename)  
[gulp-uncss](https://www.npmjs.com/package/gulp-uncss)  

**Tasks**
```javascript
///Styles: CSS  Minificado
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
  return gulp.src(config.styles.app + '/**.min.css')
  .pipe(uncss({
    html: ['index.html', 'app/**/*.html']
    }))
  .pipe(gulp.dest(config.styles.output))
  .pipe(gulp.dest(config.styles.app));
});
```
**Watch & reload**
```javascript
gulp.watch(config.styles.watch, ['styles']).on('change', reload);
```

##Scripts
[gulp-uglify](https://www.npmjs.com/package/gulp-uglify)  
[gulp-jshint](https://www.npmjs.com/package/gulp-jshint)  
[gulp-concat](https://www.npmjs.com/package/gulp-concat)  

**Tasks**
```javascript
// Scripts: todos los archivos JS concatenados en uno solo minificado
gulp.task('scripts', function() {
  return gulp.src([config.scripts.app+'/js/*.js'])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(concat('main.js'))
  .pipe(rename({ suffix: '.min' }))
  .pipe(uglify())
  .pipe(gulp.dest(config.scripts.output))
  .pipe(gulp.dest(config.scripts.app));
});
```
**Watch & reload**
```javascript
gulp.watch(config.scripts.watch, ['scripts']).on('change', reload);
```

##Images
[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)  
[imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant)  
[gulp-cache](https://github.com/jgable/gulp-cache)  
[del](https://www.npmjs.com/package/del)  
**Tasks**
```javascript
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
```
**Watch & reload**
```javascript
gulp.watch(config.images.watch, ['images']).on('change', reload);
```

##Inyectamos css y js con gulp-inject
[gulp-inject](https://www.npmjs.com/package/gulp-inject)  
Con gulp-inject, inyectamos archivos al html, como por ejemplo la hoja de estilo css y la hoja de script js.  

**Tasks**  

```javascript
// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src('./app/*.html')
  .pipe(inject(gulp.src([config.styles.app+'/vendors/*.css', './app/styles/style.min.css', config.scripts.app+'/vendors/*.js', './app/scripts/main.min.js'], {read: false}), {relative: true}))
  .pipe(gulp.dest('./app'));
});
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
  gulp.src('./app/*.html')
  .pipe(wiredep({
    directory: './app/bower_components'
  }))
  .pipe(gulp.dest('./app'));
});
```
**Watch & reload**
```javascript
gulp.watch(['./bower.json'], ['wiredep', 'copy']).on('change', reload);
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
  "directory": "app/lib",
  "scripts" :  {
    "postinstall" : "gulp wiredep"
  }
}
```

##Clean
[del](https://www.npmjs.com/package/del) 

**Tasks**  
Podemos hacer tareas por archivo o directorio, o un task clean e incluir allí todas las tareas  
```javascript
// Clean
gulp.task('clean', function(cb) {
  return del(['./dist/**/.*.html', './dist/bower_components/**', config.styles.output, config.scripts.output, config.images.output], cb);
});
```

##Instalamos **bower** y **npm**
**Tasks**  
```javascript
//Install
gulp.task('install', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(install());
});
```

##Copy
**Tasks**  
```javascript
//Copy
gulp.task('copy', function () {
  gulp.src(['./app/bower_components/**'])
  .pipe(gulp.dest('./dist/bower_components'));
  gulp.src([config.scripts.app + '/vendors/*.js'])
  .pipe(gulp.dest(config.scripts.output + '/vendors/'));
  gulp.src([config.styles.app + '/vendors/*.css'])
  .pipe(gulp.dest(config.styles.output + '/vendors/'));
});
```
**.bowerrc**  
Verificamos las siguientes líneas de código  
```json
{
  "directory": "app/lib",
  "scripts" :  {
    "postinstall" : "gulp wiredep", 
    "postinstall" : "gulp copy"
  }
}
```

##Watch & Reload
```javascript
//Reload
gulp.watch([
  config.html.watch, 
  config.styles.watch, 
  config.scripts.watch, 
  './bower.json'
]).on('change', reload);

//Watch
gulp.task('watch', function(){
  gulp.watch(config.html.watch, ['build']);
  gulp.watch(config.styles.watch, ['styles']);
  gulp.watch(config.scripts.watch, ['scripts']);
  gulp.watch(config.images.watch, ['images']);
  gulp.watch(['./bower.json'], ['wiredep', 'copy']);
});
```
##Install
```javascript
//Install
gulp.task('server', ['install'], function(){
  gulp.start('build');
});
```
##Build
```javascript
//Build
gulp.task('build', ['html', 'styles', 'scripts', 'images', 'inject', 'wiredep', 'copy']);
```
Ejecutamos desde la terminal  
```sh
$ gulp build
```
##Default
Creamos una función con **start**, para que primero se ejecute clean, y luego el resto de las dependencias  
```javascript
//Default
gulp.task('default', ['clean'], function() {
  gulp.start('serve', 'watch', 'build');
});
```
Ejecutamos desde la terminal  
```sh
$ gulp
```
##Licencia
[MIT License](https://github.com/alexballera/webapp/blob/master/LICENSE)  

