var fs = require('fs');
var marked = require('marked');
var funkit = require('funkit');
var hl = require("highlight").Highlight;


marked.setOptions({
    highlight: function(code, lang) {
        return hl(code);
    }
});

var id = funkit.id;
var partition = funkit.string.partition;
var ltrim = funkit.string.ltrim;


exports.transform = transform;
exports.transformers = transformers();

function transform(f, data, transformers, done) {
    var ctx = {sections: []};
    var tokens = marked.lexer(data).map(function(t) {
        if(t.type == 'text' || t.type == 'paragraph') {
            var text = t.text;

            for(var k in transformers) {
                var v = transformers[k];
                text = v.match(text, v.toHTML);
            }

            return {
                type: 'text',
                text: text
            };
        }
        if(t.type == 'heading') {
            var n = t.text;
            var i = idfy(n.toLowerCase()); // XXX: not guaranteed to be unique
            ctx.sections.push({name: n, id: i});

            return {
                type: 'heading',
                depth: t.depth,
                text: '<h' + t.depth + ' id="' + i + '">' + n + '</h' + t.depth + '>'
            };
        }
        return t;
    });
    tokens.links = [];

    ctx.data = marked.parser(tokens);

    done(f, ctx);
}

function idfy(val) {
    return val.toLowerCase().replace(/[ \-]+/g, '_').replace(/\.+/g, '');
}

function transformers() {
    return attachMissing({
        bracket_pipe_link: {
            pattern: /\[\[([^\|]+)\|([^\]]+)\]\]/g,
            toHTML: function(o) {
                var suffix = o.r.match('^https?')? '': '.html';

                return '<a href="' + o.r.replace(/ /g, '-').toLowerCase() + suffix + '">' + o.l + '</a>';
            }
        },
        pipe_link: {
            pattern: /\[([^\|]+)\|([^\]]+)\]/g,
            toHTML: function(o) {
                return '<a href="' + o.r.replace(/ /g, '-') + '">' + o.l + '</a>';
            }
        },
        bracket_link: {
            pattern: /\[\[([^\]]+)\]\]/g,
            toHTML: function(o) {
                return '<a href="' + o.l.toLowerCase().replace(/ /g, '-').replace(/\?/g, '%253F')  + '.html">' + o.l + '</a>';
            }
        },
        regular_link_with_whitespace: {
            pattern: /\[([^\]]+)\]\s+\(([^\)]+)\)/g,
            toHTML: function(o) {
                return '<a href="' + o.r + '">' + o.l + '</a>';
            }
        },
        pure_link_begin: {
            pattern: /^https?:\/\/.+/g,
            toHTML: function(o) {
                var parts = partition(' ', o.r);
                var lPart = ltrim('http://', ltrim('https://',  parts[0]));
                var rPart = parts[1]? ' ' + parts[1]: '';

                return '[' + lPart + ']' + '(' + parts[0] + ')' + rPart;
            }
        },
        pure_link_end: {
            pattern: /\s+https?:\/\/\s+/g,
            toHTML: function(o) {
                var parts = partition(' ', o.r);
                var lPart = parts[0]? parts[0] + ' ': '';

                return lPart + replaceLinks(parts[1]);
            }
        },
        paragraphs: {
            toHTML: function(o) {
                if(o.l) return '<p>' + o.l.split('\n').filter(id).join('</p><p>') + '</p>';
            }
        }
    });

    function replaceLinks(o) {
        return o.replace(/(https?:\/\/)([a-zA-Z0-9.\/\-\_]*)/g, function(m, p1, p2) {
            return '[' + p2 + ']' + '(' + m + ')';
        });
    }

    function attachMissing(o) {
        for(var k in o) {
            var v = o[k];

            attachMatch(v);
            attachToAST(v);
        }

        function attachMatch(v) {
            if(v.match) return;

            if(v.pattern) {
                v.match = function(text, output) {
                    if(!text) return;
                    output = output || function(o) {return o;};

                    return text.replace(v.pattern, function(orig, l, r) {
                        return output(v.toAST(l, r));
                    });
                };
            }
            else {
                v.match = function(text, output) {
                    return output(v.toAST(text));
                };
            }
        }

        function attachToAST(v) {
            if(!v.toAST) {
                v.toAST = function(l, r) {
                    return {'l': l, 'r': r};
                };
            }
        }

        return o;
    }
}
