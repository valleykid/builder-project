'use strict';

var webpack = require('webpack');
var through = require('through2');
var path = require('path');

exports.webpack = function(){
	return through.obj(function(chunk, enc, cb){
        var filename = chunk.path.match(/\/lib\/([^\/]+)\/index|([^\/]+)\/lib\/index/);
            filename = (filename[1] || filename[2] || 'main').toLowerCase() + '.js';
        //console.log(filename);
        webpack({
            entry: chunk.path,
            output: {
                path: path.join(process.cwd(), './build/js'),
                filename: filename,
                libraryTarget: 'umd'
            },
            externals: {
                'jquery': 'jQuery',
                'underscore': '_',
                'backbone': 'Backbone',
                'n3': 'n3'
            },
            resolve: {
                root: [
                    path.resolve('./app/modules')
                ],
                alias: {}
            }
        }, function(err, stats){
            //console.log(stats);
            cb(null, chunk);
        });
    });
};

exports.componentRename = function(){
	return through.obj(function(chunk, enc, cb){
        /*var p = chunk.path.replace(/\/components\/(\w+)[\/\w\.]+$/, '/css/$1.css');
        chunk.path = p; console.log(p);*/
        var arr = chunk.path.split('/'), p, last;
        var id = arr.indexOf('components');
        //var blackList = ['aksearchbu'];
        if(~id){
            arr = arr.slice(0, id+2);
            last = arr[arr.length-1].toLowerCase();
            arr[arr.length-1] = last+'.css';
            chunk.path = p = arr.join('/').replace('components', 'css');
        }
        //if(~blackList.indexOf(last)) chunk.path = ''; console.log(p);
        cb(null, chunk);
    });
};

exports.copy = function(){
	return through.obj(function(chunk, enc, cb){
        var filename = path.basename(chunk.path),
            originalPath = chunk.path;
        chunk.path = path.join(process.cwd(),
            ~originalPath.indexOf('/fonts/')? 'css/fonts' : 'css/img/', filename);
        //console.log(originalPath, chunk.path);
        cb(null, chunk);
    });
};

exports.replacePath = function(){
	return through.obj(function(chunk, enc, cb){
        chunk.path = chunk.path.replace('src', 'lib');
        //console.log(chunk.path);
        cb(null, chunk);
    });
};

exports.errorCallback = function(err){
	console.log(err);
    this.emit('end');
};