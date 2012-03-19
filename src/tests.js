#!/usr/bin/env node
var assert = require('assert');
var ghw = require('./ghw');

var pipe_link = ghw.transformers.pipe_link;
assert.ok(pipe_link('[foo|bar]') == '<a href="bar">foo</a>');

var bracket_link = ghw.transformers.bracket_link;
assert.ok(bracket_link('[[]]') == '[[]]');
assert.ok(bracket_link('[[foo]]') == '<a href="foo.html">foo</a>');

