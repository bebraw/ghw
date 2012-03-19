#!/usr/bin/env node
var VERSION = '0.3.0';

var fs = require('fs');
var marked = require('marked');

exports.transform = transform;
exports.transformers = transformers();

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

