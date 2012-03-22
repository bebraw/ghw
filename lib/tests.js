#!/usr/bin/env node
var assert = require('assert');
var t = require('./ghw').transformers;

// TODO
dsuite(t.table.match, merge(
    {
        '': ''
    },
    multiple([
        'foo|bar\n-|-',
        '|foo|bar\n-|-',
        'foo|bar|\n-|-',
        '|foo|bar|\n-|-'
        ],
        {header: ['foo', 'bar'], align: ['left', 'left'], lines: []}
    )
));

function merge(a, b) {
    var ret = {};

    for(var k in a) {ret[k] = a[k];}
    for(var k in b) {ret[k] = b[k];}

    return ret;
}

function multiple(keys, value) {
    var ret = {};

    keys.forEach(function(k) {
        ret[k] = value;
    });

    return ret;
}

suite(matchToHTML(t.bracket_pipe_link), {
    '[[foo|bar]]': '<a href="bar.html">foo</a>',
    '[[foo|bar bar]]': '<a href="bar-bar.html">foo</a>',
    '[[a|b]] [[b|a]]': '<a href="b.html">a</a> <a href="a.html">b</a>',
    '[[a|http://b]]': '<a href="http://b">a</a>',
    '[[a|https://b]]': '<a href="https://b">a</a>'
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
    '[[a]] [[b]]': '<a href="a.html">a</a> <a href="b.html">b</a>'
});

suite(matchToHTML(t.paragraphs), {
    'foo': '<p>foo</p>',
    'foo\nbar': '<p>foo</p><p>bar</p>',
    'foo\n\nbar': '<p>foo</p><p>bar</p>'
});

function matchToHTML(o) {
    return function(t) {
        return o.match(t, o.toHTML)
    }
}

function suite(f, tests) {
    for(var i in tests) {
        var o = tests[i];
        var r = f(i);

        try {
            assert.ok(r == o);
        }
        catch (e) {
            console.log('Expected ' + o + ', received ' + r);
        }
    }
}

function dsuite() {}

