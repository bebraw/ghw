#!/usr/bin/env node
var t = require('./ghw').transformers;
var suite = require('suite.js');

// TODO: still probably missing some cases (left + right bound with | etc.)
suite(matchToTableAST(t.table), suite.merge(
    {
        'foo|bar\n-|-\na|b': {
            header: ['foo', 'bar'], align: ['left', 'left'], lines: [['a', 'b']]
        },
        'foo|bar\n-|-': {
            header: ['foo', 'bar'], align: ['left', 'left'], lines: []
        },
        'foo|bar\n:-|-': {
            header: ['foo', 'bar'], align: ['left', 'left'], lines: []
        },
        'foo|bar\n:-:|-': {
            header: ['foo', 'bar'], align: ['center', 'left'], lines: []
        },
        'foo|bar\n-:|-': {
            header: ['foo', 'bar'], align: ['right', 'left'], lines: []
        },
        'foo|bar|baz\n-|-|-\nsomething|': {
            header: ['foo', 'bar', 'baz'], align: ['left', 'left', 'left'],
            lines: [['something']]
        },
        //'foo|bar\n-|-\na|\nboo': undefined, OK???
        'foo|bar\n-': undefined,
        'foo\nbar': undefined,
        'foo|bar': undefined
    },
    suite.multiple([
        'foo|bar\n-|-',
        '|foo|bar\n-|-',
        'foo|bar|\n-|-',
        '|foo|bar|\n-|-'
        ],
        {header: ['foo', 'bar'], align: ['left', 'left'], lines: []}
    )
));

function matchToTableAST(o) {
    return function(t) {
        var ret;

        o.match(t, captureAST);

        function captureAST(header, lines, align) {
            ret = {
                header: header,
                align: align,
                lines: lines
            };
        }

        return ret;
    };
}

suite(matchToHTML(t.table), {
        'foo|bar\n-|-\na|b\na|': '<table><thead><tr><th>foo</th><th>bar</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr><tr><td>a</td><td></td></tr></tbody></table>'
});

suite(matchToHTML(t.bracket_pipe_link), {
    '[[foo|bar]]': '<a href="bar.html">foo</a>',
    '[[foo|bar bar]]': '<a href="bar-bar.html">foo</a>',
    '[[a|b]] [[b|a]]': '<a href="b.html">a</a> <a href="a.html">b</a>',
    '[[a|http://b]]': '<a href="http://b">a</a>',
    '[[a|https://b]]': '<a href="https://b">a</a>',
    '[[foo|Foo Bar]]': '<a href="foo-bar.html">foo</a>'
});

suite(matchToHTML(t.pipe_link), {
    '[foo|bar]': '<a href="bar">foo</a>',
    '[foo|bar bar]': '<a href="bar-bar">foo</a>',
    '[foo|bar] [bar|foo]': '<a href="bar">foo</a> <a href="foo">bar</a>'
});

suite(matchToHTML(t.bracket_link), {
    '[[]]': '[[]]',
    '[[foo]]': '<a href="foo.html">foo</a>',
    '[[foo foo]]': '<a href="foo-foo.html">foo foo</a>',
    '[[a]] [[b]]': '<a href="a.html">a</a> <a href="b.html">b</a>',
    '[[Foo Bar]]': '<a href="foo-bar.html">Foo Bar</a>'
});

suite(matchToHTML(t.regular_link_with_whitespace), {
    '[foo] (bar)': '<a href="bar">foo</a>'
});

suite(matchToHTML(t.pure_link), {
    'http://jgestures.codeplex.com': '[jgestures.codeplex.com](http://jgestures.codeplex.com)',
    'foo': 'foo'
});

suite(matchToHTML(t.paragraphs), {
    'foo': '<p>foo</p>',
    'foo\nbar': '<p>foo</p><p>bar</p>',
    'foo\n\nbar': '<p>foo</p><p>bar</p>'
});

function matchToAST(o) {
    return function(t) {
        var ret;

        o.match(t, captureAST);

        function captureAST(o) {
            ret = o;
        }

        return ret;
    };
}

function matchToHTML(o) {
    return function(t) {
        return o.match(t, o.toHTML);
    };
}

