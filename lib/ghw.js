var fs = require('fs');
var marked = require('marked');

exports.transform = transform;
exports.transformers = transformers();

function transform(f, transformers, done) {
    var data = fs.readFileSync(f, 'utf-8'); // TODO: might want to pass as param
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
            var i = n.toLowerCase();
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

// http://phpjs.org/functions/ltrim:467
function ltrim(str, charlist) {
    charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
    var re = new RegExp('^[' + charlist + ']+', 'g');
    return (str + '').replace(re, '');
}

// http://phpjs.org/functions/rtrim:507
function rtrim(str, charlist) {
    charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
    var re = new RegExp('[' + charlist + ']+$', 'g');
    return (str + '').replace(re, '');
}

function trim(str, charlist) {
    return rtrim(ltrim(str, charlist), charlist);
}

function all(o) {
    for(var i = 0, len = o.length; i < len; i++) {
        if(!o[i]) return false;
    }

    return true;
}

function transformers() {
    return attachMissing({
        table: {
            match: function(text, output) {
                var parts = text.split('\n');
                if(parts.length < 2) return text;

                var header = trim(parts[0], '|');
                var align = trim(parts[1], '|');
                var lines = parts.slice(2);
                var headerParts = header.split('|');
                var headerLen = headerParts.length;
                var alignParts = align.split('|');
                var alignLen = alignParts.length;

                if(headerLen < 2) return text;
                if(headerLen != alignLen) return text;
                if(all(lines.map(function(v) {return v.indexOf('|') >= 0;})))

                return output({
                    header: headerParts,
                    align: alignParts.map(function(p) {
                        if(p[0] == ':' && p[p.length - 1] == ':') return 'center';
                        if(p[p.length - 1] == ':') return 'right';
                        return 'left';
                    }),
                    lines: lines.map(function(line) { return rtrim(line, '|').split('|');})
                });
            },
            toHTML: function(o) {
                if(!o) return '';

                var cols = o.header.length;
                var h = o.header? '<thead><tr><th>' + o.header.join('</th><th>') + '</th></tr></thead>': '';
                var c = '<tbody><tr>' + o.lines.map(function(v) {
                    function empty(a) {var ret = []; for(var i = 0; i < a; i++) {ret.push('');}; return ret;}
                    if(v.length != cols) v = v.concat(empty(cols - v.length));
                    return '<td>' + v.join('</td><td>') + '</td>';
                }).join('</tr><tr>') + '</tr></tbody>';

                return '<table>' + h + c + '</table>';
            }
        },
        bracket_pipe_link: {
            pattern: /\[\[([^\|]+)\|([^\]]+)\]\]/g,
            toHTML: function(o) {
                var suffix = o.r.match('^http')? '': '.html';

                return '<a href="' + o.r.replace(' ', '-').toLowerCase() + suffix + '">' + o.l + '</a>';
            }
        },
        pipe_link: {
            pattern: /\[([^\|]+)\|([^\]]+)\]/g,
            toHTML: function(o) {
                return '<a href="' + o.r.replace(' ', '-') + '">' + o.l + '</a>';
            }
        },
        bracket_link: {
            pattern: /\[\[([^\]]+)\]\]/g,
            toHTML: function(o) {
                return '<a href="' + o.l.replace(' ', '-').toLowerCase()  + '.html">' + o.l + '</a>';
            }
        },
        regular_link_with_whitespace: {
            pattern: /\[([^\]]+)\]\s+\(([^\)]+)\)/g,
            toHTML: function(o) {
                return '<a href="' + o.r + '">' + o.l + '</a>';
            }
        },
        paragraphs: {
            toHTML: function(o) {
                if(o.l) return '<p>' + o.l.split('\n').filter(id).join('</p><p>') + '</p>';
            }
        }
    });

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

function id(a) {
    return a;
}

