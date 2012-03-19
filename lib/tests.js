#!/usr/bin/env node
var assert = require('assert');
var ghw = require('./ghw');

var bracket_pipe_link = ghw.transformers.bracket_pipe_link;
assert.ok(bracket_pipe_link('[[foo|bar]]') == '<a href="bar.html">foo</a>');
assert.ok(bracket_pipe_link('[[foo|bar bar]]') == '<a href="bar-bar.html">foo</a>');
assert.ok(bracket_pipe_link('[[a|b]] [[b|a]]') == '<a href="b.html">a</a> <a href="a.html">b</a>');
assert.ok(bracket_pipe_link('[[a|http://b]]') == '<a href="http://b">a</a>');
assert.ok(bracket_pipe_link('[[a|https://b]]') == '<a href="https://b">a</a>');

var pipe_link = ghw.transformers.pipe_link;
assert.ok(pipe_link('[foo|bar]') == '<a href="bar">foo</a>');
assert.ok(pipe_link('[foo|bar bar]') == '<a href="bar-bar">foo</a>');
assert.ok(pipe_link('[foo|bar] [bar|foo]') == '<a href="bar">foo</a> <a href="foo">bar</a>');

var bracket_link = ghw.transformers.bracket_link;
assert.ok(bracket_link('[[]]') == '[[]]');
assert.ok(bracket_link('[[foo]]') == '<a href="foo.html">foo</a>');
assert.ok(bracket_link('[[foo foo]]') == '<a href="foo-foo.html">foo foo</a>');
assert.ok(bracket_link('[[a]] [[b]]') == '<a href="a.html">a</a> <a href="b.html">b</a>');

var paragraphs = ghw.transformers.paragraphs;
assert.ok(paragraphs('foo\nbar') == '<p>foo</p><p>bar</p>');
assert.ok(paragraphs('foo\n\nbar') == '<p>foo</p><p>bar</p>');

