#!/usr/bin/env node
// Usage:  ghw <input> <output dir>
// where <input> is either a file or a dir.
var VERSION = '0.0.1'

var fs = require('fs');
var marked = require('marked');

var args = process.argv.splice(2);
var input = args[0];
var output = args[1];

console.log('ghw ' + VERSION);

if(!output) {
    console.log('Missing output!');

    return;
}

console.log(input, output);

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

