#!/usr/bin/env node
// Usage:  ghw <input> <output dir>
// where <input> is either a file or a dir.
var VERSION = '0.0.3'

var fs = require('fs');
var marked = require('marked');
var mu = require('mu2');

if(require.main == module) {
    var args = process.argv.splice(2);
    var input = args[0];
    var output = args[1];

    // TODO: pass this via a param
    var template = 'templates/base.html';

    console.log('ghw ' + VERSION);

    if(!input) {
        console.log('Missing input and output!');

        return;
    }

    if(!output) {
        console.log('Missing output!');

        return;
    }

    transform(input, transformers(), function(f, d) {
        var stream = mu.compileAndRender(template, {data: d});
        var target = output + f.substring(f.lastIndexOf('/'), f.length).substring(0, f.indexOf('.')) + 'html';
        var writeStream = fs.createWriteStream(target);

        stream.pipe(writeStream);
        stream.on('end', function() {
            console.log('Wrote ' + target);
        });
    });
}
else {
    exports.transform = transform;
    exports.transformers = transformers();
}

function transform(f, transformers, done) {
    fs.readFile(f, 'utf-8', function(err, data) {
        if (err) throw err;

        var tokens = marked.lexer(data).map(function(t) {
            if(t.type == 'text') {
                // TODO: match [[name|link]] before this
                return {
                    type: 'text',
                    text: transformers.bracket_link(t.text)
                };
            }
            return t;
        });
        tokens.links = [];

        done(f, marked.parser(tokens));
    });
}

function transformers() {
    return {
        bracket_link: function(t) {
            return t.replace(
                /\[\[([^\]]+)\]\]/,
                '<a href="$1.html">$1</a>'
            );
        }
    };
}

