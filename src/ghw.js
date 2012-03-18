#!/usr/bin/env node
// Usage:  ghw <input> <output dir>
// where <input> is either a file or a dir.
var VERSION = '0.0.2'

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

        var tokens = marked.lexer(data);

        tokens = tokens.map(function(t) {
            if(t.type == 'text') {
                return {
                    type: 'text',
                    text: t.text.replace(
                        /\[\[([^\]]+)\]\]/,
                        '< href="$1.html">$1</a>'
                    )
                };
            }
            return t;
        });
        tokens.links = [];

        var html = marked.parser(tokens);

        // TODO: attach HTML head, body etc.

        // TODO: mkdir if necessary
        var target = o + f.substring(f.lastIndexOf('/'), f.length).substring(0, f.indexOf('.')) + 'html';
        fs.writeFile(target, html, function(err) {
            if (err) throw err;

            console.log('Wrote ' + target);
        })
    });
}

