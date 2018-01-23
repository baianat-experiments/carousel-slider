/**
 * gulp modules
 */
const gulp = require('gulp');
const stylus = require('gulp-stylus');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const gulpif = require('gulp-if');
const rollup = require('gulp-rollup'); 
const sequence = require('gulp-sequence');

const buble = require('rollup-plugin-buble');

const del = require('del');

const browserSync = require('browser-sync');
const reload = browserSync.reload;

let env = 'dev'

function isProduction() {
  return env === 'production';
};

/**
 * Browser-sync task
 */
gulp.task('browser-sync', () => {
  browserSync.init({
    server: './'
  });
})

/**
 * Watch task
 */
gulp.task('watch', () => {
  gulp.watch('./**/src/js/**/*.js', ['scripts']);
  gulp.watch('./**/src/stylus/**/*.styl', ['styles']);
  gulp.watch('./**/*.html', () => {
    gulp.src('./**/*.html').pipe(reload({ stream: true }));
  });
});

/**
 * styles task
 */
gulp.task('styles', () => {
  return gulp.src('src/stylus/app.styl')
    .pipe(plumber())
    .pipe(stylus({
      compress: isProduction(),
    }))
    .pipe(autoprefixer('last 5 version'))
    .pipe(rename({
      basename: 'veer',
      suffix: isProduction() ? '.min' : '',
      extname: '.css'
    }))
    .pipe(gulp.dest(`dist/css`))
    .pipe(reload({ stream: true }));

});

/**
 * Scripts task
 */
gulp.task('scripts', () => {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(rollup({
      input: 'src/js/veer.js',
      format: 'umd',
      name: `Veer`,
      allowRealFiles: true,
      plugins: [
        buble()
      ]
    }))
    .pipe(rename({
      basename: 'veer',
      suffix: isProduction() ? '.min' : '',
      extname: '.js'
    }))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({ stream: true }));
});


/**
 * Clean task
 */
gulp.task('clean', () => {
  return del(['dist']);
});

gulp.task('changeEnv', () => { env = 'production' });

gulp.task('production', sequence(
  'clean',
  ['styles', 'scripts'],
  'changeEnv',
  ['styles', 'scripts']
));
/**
 * Default task
 */
gulp.task('default', ['styles', 'scripts', 'browser-sync', 'watch']);
