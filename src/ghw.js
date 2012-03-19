#!/usr/bin/env node
// Usage:  ghw <input> <output dir>
// where <input> is either a file or a dir.
var VERSION = '0.0.3'

var path = require('path');
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

    fs.stat(program.input, function(err, stats) {
        if (err) throw err;

        if(stats.isFile()) {
            transform(program.input, transformers(), proc);
        }
        if(stats.isDirectory()) {
            fs.readdir(program.input, function(err, files) {
                if (err) throw err;

                files.forEach(function (file) {
                    var p = path.join(program.input, file);
                   
                    fs.stat(p, function(err, stats) {
                        if(stats.isFile()) {
                            transform(p, transformers(), proc);
                        }
                    });
                });
            });
        }
    });

    function proc(f, d) {
        var stream = mu.compileAndRender(program.template, {data: d});
        var target = path.join(program.output, path.basename(f, '.md') + '.html');
        var writeStream = fs.createWriteStream(target);

        stream.pipe(writeStream);
        stream.on('end', function() {
            console.log('Wrote ' + target);
        });
    }
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
                var text = t.text;

                for(var k in transformers) {
                    text = transformers[k](text);
                }

                return {
                    type: 'text',
                    text: text
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
        pipe_link: function(t) {
            return t.replace(
                /\[([^\|]+)\|([^\]]+)\]/,
                '<a href="$2">$1</a>'
            );
        },
        bracket_link: function(t) {
            return t.replace(
                /\[\[([^\]]+)\]\]/,
                '<a href="$1.html">$1</a>'
            );
        }
    };
}

