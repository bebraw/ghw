#!/usr/bin/env node
var assert = require('assert');
var ghw = require('./ghw');

var bracket_link = ghw.transformers.bracket_link;
assert.ok(bracket_link('[[]]') == '[[]]');
assert.ok(bracket_link('[[a]]') == '<a href="a.html">a</a>');

// TODO: test whitespace underscore mapping

// TODO: test [[name|link]]

