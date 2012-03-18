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

if(!input) {
    console.log('Missing input and output!');

    return;
}

if(!output) {
    console.log('Missing output!');

    return;
}

console.log(input, output);

parseFile(input);

 
function parseFile(path) {
    fs.readFile(path, 'utf-8', function(err, data) {
        if (err) throw err;

        var tokens = marked.lexer(data);
        console.log(tokens);

        // TODO: convert links to something sensible
        // TODO: write to HTML
    });
}

