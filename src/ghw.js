#!/usr/bin/env node
var VERSION = '0.3.0';

var path = require('path');
var fs = require('fs');
var wrench = require('wrench');
var marked = require('marked');
var mu = require('mu2');

if(require.main == module) {
    var program = require('commander');

    program.
        version(VERSION).
        option('-t --templates <template>', 'template directory').
        option('-i --input <input>', 'input (file/directory)').
        option('-o --output <output>', 'output directory').
        parse(process.argv);

    function quit(msg) {
        console.log(msg);
        process.exit();
    }

    if (!program.templates) quit('Missing template directory');
    if (!program.input) quit('Missing input');
    if (!program.output) quit('Missing output');

    var baseTemplate = path.join(program.templates, 'base.html');

    path.exists(baseTemplate, function(exists) {
        exists? main(): quit('Template directory is missing base.html'); 
    });

    function main() {
        console.log('ghw ' + VERSION + '\n');

        if(!path.existsSync(program.output)) {
            fs.mkdirSync(program.output);
        }

        fs.stat(program.input, function(err, stats) {
            if (err) throw err;

            if(stats.isFile()) {
                transform(program.input, transformers(), partial(proc, baseTemplate, program.output));
            }
            if(stats.isDirectory()) {
                fs.readdir(program.input, function(err, files) {
                    if (err) throw err;

                    files.forEach(function (file) {
                        var p = path.join(program.input, file);
                   
                        fs.stat(p, function(err, stats) {
                            if(stats.isFile()) {
                                transform(p, transformers(), partial(proc, baseTemplate, program.output));
                            }
                        });
                    });
                });
            }
        });

        wrench.copyDirSyncRecursive(program.templates, program.output);
        // TODO: might want to skip dot files and base.html
    }

    function proc(t, o, f, d) {
        var stream = mu.compileAndRender(t, {data: d});
        var target = path.join(o, path.basename(f, '.md') + '.html');
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

// http://stackoverflow.com/questions/4394747/javascript-curry-function
function partial(fn) {
    var slice = Array.prototype.slice;
    var args = slice.apply(arguments, [1]);

    return function() {
        return fn.apply(null, args.concat(slice.apply(arguments)));
    };
}

function transform(f, transformers, done) {
    fs.readFile(f, 'utf-8', function(err, data) {
        if (err) throw err;

        var tokens = marked.lexer(data).map(function(t) {
            if(t.type == 'text' || t.type == 'paragraph') {
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
        bracket_pipe_link: function(t) {
            return t.replace(
                /\[\[([^\|]+)\|([^\]]+)\]\]/g,
                function(orig, a, b) {
                    var suffix = b.match('^http')? '': '.html';

                    return '<a href="' + b.replace(' ', '-') + suffix + '">' + a + '</a>';
                }
            );
        },
        pipe_link: function(t) {
            return t.replace(
                /\[([^\|]+)\|([^\]]+)\]/g,
                function(orig, a, b) {
                    return '<a href="' + b.replace(' ', '-') + '">' + a + '</a>';
                }
            );
        },
        bracket_link: function(t) {
            return t.replace(
                /\[\[([^\]]+)\]\]/g,
                function(orig, a) {
                    return '<a href="' + a.replace(' ', '-')  + '.html">' + a + '</a>';
                }
            );
        },
        paragraphs: function(t) {
            return '<p>' + t.split('\n').filter(id).join('</p><p>') + '</p>';
        }
    };
}

function id(a) {
    return a;
}

