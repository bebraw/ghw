#!/usr/bin/env node
// Usage:  ghw <input dir> <output dir>
var VERSION = '0.0.1'

var fs = require('fs');
var marked = require('marked');

// TODO: get files from given dir
//var dir = process.argv.splice(2)[0];

// TODO: load them to some nice data structure
// TODO: define conversions
// TODO: write them to HTML
 
function parseFile(path) {
    fs.readFile(path, 'utf-8', function(err, data) {
        if (err) throw err;

        // TODO: convert on parse
        // TODO: once parsing has been done, load to data structure
        // using marked.lexer
        // TODO: once that's ok, write to output
    });
}

console.log('ghw ' + VERSION);

