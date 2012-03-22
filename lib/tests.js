#!/usr/bin/env node
var assert = require('assert');
var ghw = require('./ghw');

suite(ghw.transformers.bracket_pipe_link, {
    '[[foo|bar]]': '<a href="bar.html">foo</a>',
    '[[foo|bar bar]]': '<a href="bar-bar.html">foo</a>',
    '[[a|b]] [[b|a]]': '<a href="b.html">a</a> <a href="a.html">b</a>',
    '[[a|http://b]]': '<a href="http://b">a</a>',
    '[[a|https://b]]': '<a href="https://b">a</a>'
});

suite(ghw.transformers.pipe_link, {
    '[foo|bar]': '<a href="bar">foo</a>',
    '[foo|bar bar]': '<a href="bar-bar">foo</a>',
    '[foo|bar] [bar|foo]': '<a href="bar">foo</a> <a href="foo">bar</a>'
});

suite(ghw.transformers.bracket_link, {
    '[[]]': '[[]]',
    '[[foo]]': '<a href="foo.html">foo</a>',
    '[[foo foo]]': '<a href="foo-foo.html">foo foo</a>',
    '[[a]] [[b]]': '<a href="a.html">a</a> <a href="b.html">b</a>'
});

suite(ghw.transformers.paragraphs, {
    'foo\nbar': '<p>foo</p><p>bar</p>',
    'foo\n\nbar': '<p>foo</p><p>bar</p>'
});

function suite(f, tests) {
    for(var i in tests) {
        var o = tests[i];
        var r = f(i);

        try {
            assert.ok(r == o);
        }
        catch (e) {
            console.log('Expected ' + r + ', received ' + o);
        }
    }
}

