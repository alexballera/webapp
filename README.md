## Instalamos Dependencias
```
npm install --save-dev gulp browser-sync gulp-minify-html gulp-sass gulp-autoprefixer gulp-minify-css gulp-rename gulp-uncss gulp-jshint gulp-uglify gulp-concat gulp-imagemin imagemin-pngquant gulp-cache del gulp-inject wiredep gulp-install
```

##Declaramos las dependencias
```
var gulp              = require('gulp');
var browserSync = require('browser-sync');
var reload           = browserSync.reload;
```
##Declaramos las variables globales
```
var config = {
    styles: {
    },
    html: {
    },
    scripts{
    },
    images{
    }
};
```
##Servidor - Browsersync
[Browsersync](http://www.browsersync.io/ )
```
gulp.task('serve', function () {
    'use strict';
    browserSync({
        notify: false,
        logPrefix: 'BS',
        server: {
            baseDir:  ['app']
        },
        host: '0.0.0.0', //Mediante el host tenemos acceso externo
        port: 8080,
        ui: {
            port: 8081
        },
        browser: ["google-chrome", "firefox"] //Escogemos el navegador, por dafault es el predeterminado
    });
});
```

##HTML
**Minify**  
**Instalamos dependencias**  
`$ npm install gulp-minify-html --save-dev`  
**Agregamos dependencias a gulpfile.js**  
`var minifyHTML   = require('gulp-minify-html');`  
**Declaramos variables  
```
var config = {
  html: {
    main: './app/index.html',
    watch: './app/**/*.html',
    output: './dist'
  },
};
```
**Tasks**
```
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
Watch & reload
gulp.task('watch', function(){
  gulp.watch(config.html.watch, ['build']);
  gulp.watch(config.html.watch).on('change', reload);
});
```
**Ejecutamos la tarea desde build**  
`gulp.task('build', ['html']);`  
##Styles
SASS  
Autoprefixer  
Minify-CSS  
Rename  
UnCSS  
**Instalamos dependencias**
```
$ npm install gulp-sass --save-dev
$ npm install gulp-autoprefixer --save-dev
$ npm install gulp-minify-css --save-dev
$ npm install gulp-uncss --save-dev
$ npm install gulp-rename --save-dev
```
**Agregamos dependencias a gulpfile.js**
```
var sass              = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var minifycss      = require('gulp-minify-css');
var rename         = require('gulp-rename');
var uncss            = require('gulp-uncss');
```
**Declaramos variables**
```
var config = {
    styles: {
    main: './app/styles/scss/style.scss',
    watch: './app/styles/scss/**/*.scss',
    app: './app/styles',
    output: './dist/styles'
  },
};
```
**Tasks**
```
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
```
**Watch & reload**
```
gulp.task('watch', function(){
  gulp.watch(config.styles.watch, ['styles']);
  gulp.watch(config.styles.watch).on('change', reload);
});
```
**Ejecutamos la tarea desde build**  
`gulp.task('build', ['styles']);`  
##Scripts
Uglify  
Jshint  
Concat  
**Instalamos dependencias**
```
$ npm install gulp-uglify --save-dev
$ npm install gulp-jshint --save-dev
$ npm install gulp-concat --save-dev
```
**Agregamos dependencias a gulpfile.js**
```
var jshint             = require('gulp-jshint');
var uglify             = require('gulp-uglify');
var concat            = require('gulp-concat');
```
**Declaramos variables**
```
var config = {
  scripts: {
    main: './app/scripts/main.js',
    watch: './app/scripts/**/*.js',
    app: './app/scripts',
    output: './dist/scripts'
  },
};
```
**Tasks**
```
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
```
**Watch & reload**
```
gulp.task('watch', function(){
  gulp.watch(config.scripts.watch, ['scripts']);
  gulp.watch(config.scripts.watch).on('change', reload);
});
```
**Ejecutamos la tarea desde build**  
`gulp.task('build', ['build:js']);`  
##Images
Imagemin  
Pngquant  
gulp-cache  
Del  
**Instalamos dependencias**
```
$ npm install gulp-imagemin --save-dev
$ npm install imagemin-pngquant --save-dev
$ npm install gulp-cache --save-dev
$ npm install del --save-dev
```
**Agregamos dependencias a gulpfile.js**
```
var imagemin       = require('gulp-imagemin');
var pngquant        = require('imagemin-pngquant');
var cache              = require('gulp-cache');
var del               = require('del');
```
**Declaramos variables**
```
var config = {
    images: {
    main: './app/images/resources/**',
    watch: './app/images/**/*.*',
    app: './app/images',
    output: './dist/images'
  }
};
```
**Tasks**
```
// Images
gulp.task('images', ['build:images'], function() {
    gulp.start('clean:images');
});
gulp.task('build:images', ['dist:images'], function() {
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
gulp.task('dist:images', function() {
  return gulp.src(config.images.app + '/*.*')
  .pipe(gulp.dest(config.images.output));
});
gulp.task('clean:images', function(cb) {
    del(config.images.main + '/*.*', cb);
});
```
**Watch & reload**
```
gulp.task('watch', function(){
  gulp.watch(config.images.watch, ['images']);
  gulp.watch(config.images.watch).on('change', reload);
});
```
**Ejecutamos la tarea desde build**  
`gulp.task('build', ['build:images']);`  
##Inyectamos css y js con gulp-inject
[Gulp Inject](https://www.npmjs.com/package/gulp-inject)  
Con gulp-inject, inyectamos archivos al html, como por ejemplo la hoja de estilo css y la hoja de script js.  
**Instalación  
`$ npm install --save-dev gulp-inject`  
**Tasks**  
`var inject = require('gulp-inject');`  
```
// Inyectando css y js al index.html
gulp.task('inject', function () {
  gulp.src('./app/*.html')
  .pipe(inject(gulp.src(['./app/styles/style.min.css', './app/scripts/main.min.js'], {read: false}), {relative: true}))
  .pipe(gulp.dest('./app'));
});
```
**Preparamos el archivo index.html**
```
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
    **<!-- inject:css -->**
    **<!-- endinject -->**
</head>
<body> 
    **<!-- inject:js -->**
    **<!-- endinject -->**
</body>
</html>
```
**Ejecutamos la tarea desde build**  
`gulp.task('build', ['inject']);`  
##Inyectamos librerías de Bower con wiredep
[wiredep](https://www.npmjs.com/package/wiredep)  
Con wiredep, inyectamos las librerías de bower (css y js) al html. Se deben agregar las dependencias mediante el comando 
`$ bower install --save <paquete>`  
**Instalación**  
`$ npm install --save-dev wiredep`  
**Tasks**  
`var wiredep = require('wiredep');`  
```
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
```
gulp.task('watch', function(){
  gulp.watch(['./bower.json'], ['wiredep']);
  gulp.watch('./bower.json').on('change', reload);
});
```
**Preparamos el archivo index.html**
```
<!DOCTYPE html>
<html>
<head>
  <title>My index</title>
    **<!-- bower:css -->**
    **<!-- endbower -->**
</head>
<body> 
    **<!-- bower:js -->**
    **<!-- endbower -->**
</body>
</html>
```
**bower.json**  
Agregar las siguientes líneas “overrides” antes de “dependencies”  
```
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
```
{
  "directory": "app/lib",
  "scripts" :  {
    "postinstall" : "gulp wiredep"
  }
}
```
**Ejecutamos la tarea desde build**  
`gulp.task('build', ['wiredep']);`  
##Clean
**del**  
**Instalación**  
`$ npm install --save-dev del`  
**Tasks**  
Podemos hacer tareas por archivo o directorio, o un task clean e incluir allí todas las tareas  
`var del               = require('del');`  
```
// Clean
gulp.task('clean', function(cb) {
return del(['./dist/**/.*.html', config.styles.output, config.scripts.output, config.images.output], cb);
});
```
**Ejecutamos la tarea**  
```
gulp.task('default', ['clean'], function() {
  gulp.start('serve', 'watch', 'build');
});
```
##Copy
**Tasks**  
```
//Copy
gulp.task('copy', function () {
  return gulp.src(['./app/bower_components/**'])
  .pipe(gulp.dest('./dist/bower_components'));
});
```
**.bowerrc**  
Verificamos las siguientes líneas de código  
```
{
  "directory": "app/lib",
  "scripts" :  {
    "postinstall" : "gulp wiredep", 
    "postinstall" : "gulp copy"
  }
}
```
##Install
**Instalación**  
`npm install --save-dev gulp-install`  
**Tasks**  
`var install = require("gulp-install");`  
```
//Install
gulp.task('install', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(install());
});
```
**Ejecutamos la tarea**  
```
//Install
gulp.task('update', ['install'], function(){
  gulp.start('build');
});
```
##Watch
```
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
  gulp.watch(['./bower.json'], ['wiredep']);
  gulp.watch('./bower.json').on('change', reload);
});
```
##Build
```
//Build
gulp.task('build', ['html', 'styles', 'scripts', 'images', 'inject', 'wiredep']);
```
Ejecutamos desde la terminal **gulp build**  
##Default
Creamos una función con start, para que primero se ejecute clean, y luego el resto de las dependencias  
```
//Default
gulp.task('default', ['clean'], function() {
  gulp.start('serve', 'watch', 'build');
});
```
Ejecutamos desde la terminal **gulp**  
