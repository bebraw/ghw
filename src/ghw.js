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

transform(input, output);

function transform(f, o) {
    fs.readFile(f, 'utf-8', function(err, data) {
        if (err) throw err;

        var tokens = marked(data); //marked.lexer(data);

        // TODO: convert links to something sensible
        //console.log(tokens);

        // TODO: mkdir if necessary
        var target = o + f.substring(f.lastIndexOf('/'), f.length).substring(0, f.indexOf('.')) + 'html';
        fs.writeFile(target, tokens, function(err) {
            if (err) throw err;

            console.log('Wrote ' + target);
        })
    });
}

