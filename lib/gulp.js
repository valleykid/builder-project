/**
 * vk(valleykiddy@gmail.com)
 * 2016-6-24
 */

'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var CustomFunctions = require('less-plugin-functions');
var cf = new CustomFunctions();
var merge = require('merge-stream');

var path = require('path');
var util = require('./util');
var nodeModulesPath = path.join(__dirname, '..', 'node_modules');
var cfg = {
    build: './build',
    commSrc: './src',
    commLib: './lib',
    commStyle: './style',
    components: './components',
    sitePath: '../n3aksite/build',
    mainFile: '?(akcomm|docs)',
    styleFile: '?(img|fonts)'
};

module.exports = gulp;

// less
gulp.task('less', function(){
    return gulp.src([
        path.join(cfg.commStyle, cfg.mainFile+'.less'),
        path.join(cfg.components, '**/index.less'), '!node_modules/**/*.less', '!**/_*.less'
    ])
    .pipe(plugins.less({
        plugins: [cf]
    }))
    .on('error', util.errorCallback)
    .pipe(util.componentRename())
    .pipe(plugins.newer(
        path.join(cfg.build, 'css', '*.css')
    ))
    .pipe(gulp.dest(
        path.join(cfg.build, 'css')
    ))
    .pipe(gulp.dest(
        path.join(cfg.sitePath, 'css')
    ));
});

gulp.task('cssmin', function(){
    return gulp.src([
            path.join(cfg.build, 'css', '**/*.css'), '!'+cfg.build+'/css/**/*.min.css'
        ])
        .pipe(plugins.cssmin())
        .pipe(plugins.rename({suffix:'.min'}))
        .pipe(gulp.dest(
            path.join(cfg.build, 'css')
        ));
});

// js
gulp.task('es6-5', function(){
    var src = gulp.src(
            path.join(cfg.commSrc, '**/*.js')
        )
        .pipe(plugins.babel({presets: [
            path.join(nodeModulesPath, 'babel-preset-es2015')
        ]}))
        .pipe(gulp.dest(cfg.commLib));
    var wdg = gulp.src([
            path.join(cfg.components, '*/src/**/*.js'), '!node_modules/**/*.js'
        ])
        .pipe(plugins.babel({presets: [
            path.join(nodeModulesPath, 'babel-preset-es2015')
        ]}))
        .pipe(util.replacePath())
        .pipe(gulp.dest(cfg.components));
    return merge(src, wdg);
});

gulp.task('webpack', ['es6-5'], function(){
    return gulp.src([
            path.join(cfg.commLib, '*/index.js'),
            path.join(cfg.components, '*/lib/index.js'), '!node_modules/**/*.js'
        ])
        .pipe(util.webpack());
});

gulp.task('jsconcat', ['webpack'], function(){
    return gulp.src([
            path.join(cfg.build, 'js', '*.js'), '!'+cfg.build+'/js/'+cfg.mainFile+'.js'
        ])
        .pipe(plugins.concat('n3ak.js'))
        .pipe(gulp.dest(
            path.join(cfg.build, 'js')
        ));
});

gulp.task('jsmin', function(){
    return gulp.src(
            path.join(cfg.build, 'js', '*.js')
        )
        .pipe(plugins.uglify())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest(
            path.join(cfg.build, 'js')
        ));
});

//copy
gulp.task('copy', function(){
    return gulp.src([
            path.join(cfg.commStyle, '**/'+cfg.styleFile+'/*'),
            path.join(cfg.components, '*/style/'+cfg.styleFile+'/*')
        ])
        .pipe(util.copy())
        .pipe(gulp.dest(
            path.join(cfg.build, 'css')
        ));
});

gulp.task('watch', function(){
    gulp.watch(['**/*.less', '!node_modules/**/*.less'], ['less']);
    gulp.watch(['./src/**/*.js', './components/*/src/**/*.js', '!node_modules/**/*.js'], ['jsconcat']);
});