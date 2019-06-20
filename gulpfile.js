var _PREFIX = 'usmedia-assessment-';
var _SHORTNAME = 'main';
var _BASE = 'public/';
var _TARGET = _BASE + 'assets/';

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gdebug = require('gulp-debug');
var rename = require('gulp-rename');
var header = require('gulp-header');
var clean = require('gulp-clean');
var tap = require('gulp-tap');
var gzip = require('gulp-gzip');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var wait = require('gulp-wait');
var plumber = require('gulp-plumber');
var del = require('del');
var notify = require( 'gulp-notify' ); 

// JS Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

// CSS Plugins
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var prefix = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');

// IMG Plugins
var imagemin = require('gulp-imagemin');
var spritesmith = require('gulp.spritesmith');
var svgsprite = require('gulp-svg-sprite');
var svgspriteconfig = {
  mode: {
    css: {
      // Activate the «css» mode
      render: {
        css: true // Activate CSS output (with default options)
      }
    }
  }
};

var webserver = require('gulp-webserver');

// Lint Task
gulp.task('lint', function() {
  gulp
    .src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  del([_TARGET + '/dev/js/*', _TARGET + '/js/*'], { force: true }).then(() => {
    gulp
      .src('src/js/**/*.js')
      .pipe(plumber())
      .pipe(wait(100)) //because deleting gives a callback too early
      .pipe(concat(_PREFIX + _SHORTNAME + '.js'))
      .pipe(gulp.dest(_TARGET + '/dev/js'))
      .pipe(uglify())
      .pipe(gulp.dest(_TARGET + '/js'))
      .pipe(livereload())
      .on('end', function() {
        if (process.argv.indexOf('--prod') > -1) gulp.start('compress-js');
      });
  });
});

// Concatenate & prefix & Minify CSS
gulp.task('styles', function() {
  del([_TARGET + '/dev/css/*', _TARGET + '/css/*'], { force: true }).then(
    () => {
      gulp
        .src('src/scss/style.scss')
        .pipe(plumber())
        .pipe(sassGlob())
        .pipe(
          sass({
            errLogToConsole: true,
            outputStyle: 'expanded',
            includePaths: ['src/scss/']
          })
        )
        .pipe(prefix('last 10 version', '> 1%', 'ie 8'))
        .pipe(rename(_PREFIX + _SHORTNAME + '.css'))
        .pipe(gulp.dest(_TARGET + '/dev/css'))
        .pipe(minifycss())
        .pipe(gulp.dest(_TARGET + '/css'))
        .pipe(livereload())
        // .pipe( notify( {
        //   message: 'TASK: "styles" Completed!',
        //   onLast : true
        // }))
        .on('end', function() {
          if (process.argv.indexOf('--prod') > -1) gulp.start('compress-css');
        });
    }
  );
});

gulp.task('distributeFonts', function() {
  del([_TARGET + '/dev/fonts/*', _TARGET + '/fonts/*'], { force: true }).then(
    () => {
      gulp
        .src('src/fonts/**/*')

        .pipe(plumber())
        .pipe(wait(100)) //because deleting gives a callback too early
        .pipe(gulp.dest(_TARGET + '/dev/fonts'))
        .pipe(gulp.dest(_TARGET + '/fonts'))
        .on('end', function() {
          if (process.argv.indexOf('--prod') > -1) gulp.start('compress-fonts');
        });
    }
  );
});

// Append Files
gulp.task('append-js-files', function() {
  gulp
    .src('src/js_files/**/*')
    .pipe(gulp.dest(_TARGET + '/dev/js'))
    .pipe(gulp.dest(_TARGET + '/js'))
    .pipe(livereload());
});
gulp.task('append-css-files', function() {
  gulp
    .src('src/css_files/**/*')
    .pipe(gulp.dest(_TARGET + '/dev/css'))
    .pipe(gulp.dest(_TARGET + '/css'))
    .pipe(livereload());
});

// Images
// gulp.task('del-images', function() {
//   return del([_TARGET + '/dev/img/*', _TARGET + '/img/*']);
// });
gulp.task('images', function() {
  del([_TARGET + '/dev/img/*', _TARGET + '/img/*'], { force: true }).then(
    () => {
      gulp
        .src('src/img/**/*')
        .pipe(plumber())
        .pipe(wait(500)) //because deleting gives a callback too early
        .pipe(imagemin())
        .pipe(gulp.dest(_TARGET + '/dev/img'))
        .pipe(gulp.dest(_TARGET + '/img'))
        .pipe(livereload());
    }
  );
});

// Compress
gulp.task('compress-create-htaccess', function() {
  fs.writeFile(
    _TARGET + '/.htaccess',
    'RewriteCond %{HTTP:Accept-Encoding} gzip\nRewriteCond %{REQUEST_FILENAME}.gzip -f\nRewriteRule ^(.*)$ $1.gz [R=307,L]',
    function(err) {
      if (err) console.log(err);
    }
  );
});
gulp.task('compress-js', function() {
  gulp
    .src(_TARGET + '/js/**/*')
    .pipe(gzip({ preExtension: 'gz' }))
    .pipe(gulp.dest(_TARGET + '/js'));
});
gulp.task('compress-css', function() {
  gulp
    .src(_TARGET + '/css/**/*')
    .pipe(gzip({ preExtension: 'gz' }))
    .pipe(gulp.dest(_TARGET + '/css'));
});
gulp.task('compress-img', function() {
  gulp
    .src(_TARGET + '/img/**/*')
    .pipe(gzip({ preExtension: 'gz' }))
    .pipe(gulp.dest(_TARGET + '/img'));
});
gulp.task('compress-fonts', function() {
  gulp
    .src(_TARGET + '/fonts/**/*')
    .pipe(gzip({ preExtension: 'gz' }))
    .pipe(gulp.dest(_TARGET + '/fonts'));
});
gulp.task('copy-icons', function() {
  gulp.src('src/icons/**/*').pipe(gulp.dest(_TARGET + '/icons'));
});

// Sprite
gulp.task('createSpritesheets', function() {
  var _sprites = [];
  fs.truncate('src/scss/_sprites.scss', 0, function(err) {});

  gulp
    .src('src/scss/sprites/**/*', { read: false })
    .pipe(clean({ force: true }));

  gulp.src('src/sprites/**/*.png').pipe(
    tap(function(file, t) {
      file = file.path.split('/');
      file = file[file.length - 2];
      if (_sprites.indexOf(file) == -1) {
        _sprites.push(file);
        var spriteData = gulp.src('src/sprites/' + file + '/*.png').pipe(
          spritesmith({
            algorithm: 'binary-tree',
            imgName: '../img/' + file + '.png',
            cssName: '_' + file + '.scss',
            cssVarMap: function(sprite) {
              sprite.name =
                'ss-' + file + '-' + sprite.name.split('@2x').join('');
            }
          })
        );
        spriteData.img.pipe(gulp.dest('src/img/'));
        //console.log(spriteData);
        spriteData.css
          .pipe(
            header('\t$ss-' + file + "-image: '../img/" + file + ".png';\n")
          )
          .pipe(gulp.dest('src/scss/sprites/'));

        // add file to map
        fs.appendFile(
          'src/scss/_sprites.scss',
          '@import  "sprites/_' + file + '";\n',
          function(err) {}
        );
      }
    })
  );

  console.log(
    'make sure to run gulp to implement the changes to your final src'
  );
});

gulp.task('reload', function() {
  gulp.src(_BASE).pipe(livereload());
});

gulp.task('createSVGSpritesheets', function() {
  gulp
    .src('**/*.svg', { cwd: 'src/svg-sprites' })
    .pipe(svgsprite(svgspriteconfig))
    .pipe(gulp.dest(_TARGET + '/svg-sprite'));
});

gulp.task('build', [
  'styles',
  'append-css-files',
  'scripts',
  'append-js-files',
  'images',
  'fonts',
  'copy-icons'
]);

gulp.task('webserver', function() {
  gulp.src('./').pipe(
    webserver({
      livereload: true,
      directoryListing: true,
      open: true
    })
  );
});

// Runs
gulp.task('default', function() {
  livereload.listen();
  gulp.watch('src/scss/**/*.scss', ['styles', 'append-css-files']);
  gulp.watch('src/css_files/**/*.css', ['styles', 'append-css-files']);
  gulp.watch('src/js/**/*.js', ['scripts', 'append-js-files']);
  gulp.watch('src/js_files/**/*.js', ['scripts', 'append-js-files']);
  gulp.watch('src/img/**/*', ['images']);
  gulp.watch('src/icons/**/*', ['copy-icons']);
  // gulp.watch('www/assets/**/*', ['deploy:assets']);
});
gulp.task('check', ['lint']);
gulp.task('compress', [
  'compress-create-htaccess',
  'scripts',
  'compress-js',
  'styles',
  'compress-css',
  'images',
  'compress-img',
  'fonts',
  'compress-fonts'
]);
gulp.task('fonts', ['distributeFonts']);
gulp.task('spritesheets', ['createSpritesheets']);
gulp.task('svg-spritesheets', ['createSVGSpritesheets']);
