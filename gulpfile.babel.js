const gulp        = require('gulp');
const handlebars  = require('gulp-compile-handlebars');
const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const uglify      = require('gulp-uglify');
const sourcemaps  = require('gulp-sourcemaps');
const livereload  = require('gulp-livereload');
const connect     = require('gulp-connect');
const rename      = require('gulp-rename');
const sass        = require('gulp-sass');
const concat      = require('gulp-concat');

const Tasks = Object.freeze({
  BUILD:   'build',
  SCRIPTS: 'scripts',
  STYLES:  'styles',
  DEFAULT: 'default',
  WATCH:   'watch',
  CONNECT: 'connect'
});

const Paths = Object.freeze({
  SRC: './index.js',
  SOURCE: './index.js',
  DIST: './build',
  DIST_MAIN: '.',
  MAPS: './maps',
  SCRIPTS: './src/**/*.js',
  STYLES: ['assets/styles/*.scss', 'assets/styles/**/*.scss'],
  STYLE_DIST: 'assets/style.css',
  PARTIALS_DIR: './src/partials',
  PARTIALS: './src/partials/*.hbs',
  MAIN_FILE: 'index.hbs',
  MAIN_STYLE_FILE: 'assets/styles/main.scss',
  DIST_FILE: 'index.html',
});

const BabelConfig = Object.freeze({
  only: /^(?:.*\/node_modules\/(?:a|b)\/|(?!.*\/node_modules\/)).*$/,
  presets: ['es2015'],
  plugins: ['transform-object-rest-spread'],
  global: true
});

const BrowserifyConfig = Object.freeze({
  entries: Paths.SRC,
  debug: true
});

const Transforms = Object.freeze({
  BABELIFY: 'babelify'
});

gulp.task(Tasks.BUILD, function () {
  const data = {
    title: 'Redux Vanilla Boilerplate'
  };
  const options = {
      batch : [ Paths.PARTIALS_DIR ],
      helpers : {
          capitals : function(str){
              return str.toUpperCase();
          }
      }
  };

  return gulp.src(Paths.MAIN_FILE)
    .pipe(handlebars(data, options))
    .pipe(rename(Paths.DIST_FILE))
    .pipe(gulp.dest(Paths.DIST_MAIN));
});

gulp.task(Tasks.SCRIPTS, function () {
    return browserify(BrowserifyConfig)
      .transform(Transforms.BABELIFY, BabelConfig)
      .bundle()
      .pipe(source(Paths.SOURCE))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write(Paths.MAPS))
      .pipe(gulp.dest(Paths.DIST));
});

gulp.task(Tasks.STYLES, function() {
  return gulp.src(Paths.MAIN_STYLE_FILE)
  .pipe(sass())
  .pipe(concat(Paths.STYLE_DIST))
  .pipe(gulp.dest(Paths.DIST));
});

gulp.task(Tasks.WATCH, [ Tasks.BUILD ], function () {
    livereload.listen();
    gulp.watch(
      [
        Paths.SOURCE,
        Paths.SCRIPTS,
        Paths.STYLES,
        Paths.PARTIALS,
        Paths.MAIN_FILE
      ],[
        Tasks.BUILD,
        Tasks.SCRIPTS,
        Tasks.STYLES
      ]
    );
});

gulp.task(Tasks.CONNECT, function() {
  connect.server({
    root: '.',
    port: 8883
  });
});

gulp.task(Tasks.DEFAULT, [
  Tasks.CONNECT,
  Tasks.BUILD,
  Tasks.SCRIPTS,
  Tasks.STYLES,
  Tasks.WATCH
]);
