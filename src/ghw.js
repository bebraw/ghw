#!/usr/bin/env node
// Usage:  ghw <input> <output dir>
// where <input> is either a file or a dir.
var VERSION = '0.0.3'

var fs = require('fs');
var marked = require('marked');
var mu = require('mu2');

if(require.main == module) {
    var program = require('commander');

    program.
        version(VERSION).
        option('-t --template <template>', 'base template (Moustache)').
        option('-i --input <input>', 'input (file/directory)').
        option('-o --output <output>', 'output directory').
        parse(process.argv);

    function quit(msg) {
        console.log(msg);
        process.exit();
    }

    if (!program.template) quit('Missing template');
    if (!program.input) quit('Missing input');
    if (!program.output) quit('Missing output');

    console.log('ghw ' + VERSION);

    transform(program.input, transformers(), function(f, d) {
        var stream = mu.compileAndRender(program.template, {data: d});
        var target = program.output + f.substring(f.lastIndexOf('/'), f.length).substring(0, f.indexOf('.')) + 'html';
        var writeStream = fs.createWriteStream(target);

        stream.pipe(writeStream);
        stream.on('end', function() {
            console.log('Wrote ' + target);
        });
    });
}
else {
    exports.VERSION = VERSION;
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

