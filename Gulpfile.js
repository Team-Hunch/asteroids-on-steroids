'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var es = require('event-stream');
var browserSync = require('browser-sync').create();

gulp.task('copy', function () {
    gulp.src('./index.html', {base: './'})
        .pipe(gulp.dest('./build/'));
});
gulp.task('build', ['copy'], function () {
    var files = [
        './src/game.js'
    ];

    var tasks = files.map(function (entry) {
        return browserify({ entries: [entry]})
            .bundle()
            .pipe(source(entry))
            .pipe(rename({
                extname: '.bundle.js'
            }))
            .pipe(flatten())
            .pipe(gulp.dest('./build/js'));
    });
    return es.merge.apply(null, tasks);
});

gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });

    gulp.watch("build/**").on('change', function () {
        browserSync.reload();
    });
});

gulp.task('serve:dev', ['serve'], function () {
    var gutil = require('gulp-util'),
        watchify = require('watchify');

    var files = [
        './src/game.js'
    ];

    var tasks = files.map(function (entry) {
        var bundler = watchify(browserify({ entries: [entry]}));

        function rebundle() {
            var stream = bundler.bundle();

            return stream
                .pipe(source(entry))
                .pipe(rename({
                    extname: '.bundle.js'
                }))
                .pipe(flatten())
                .pipe(gulp.dest('./build/js'))
                .on('end', function () {
                    gutil.log('Done!');
                })
        }

        bundler.on('update', function() {
            rebundle();
            
            gutil.log('Rebundle...');
        });

        return rebundle();
    });
    return es.merge.apply(null, tasks);
});
