#!/usr/bin/env node
var assert = require('assert');
var t = require('./ghw').transformers;

// TODO: still probably missing some cases (left + right bound with | etc.)
suite(matchToAST(t.table), merge(
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
        'foo|bar\n-|-\na|\nboo': undefined,
        'foo|bar\n-': undefined,
        'foo\nbar': undefined,
        'foo|bar': undefined
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

suite(matchToHTML(t.table), {
        'foo|bar\n-|-\na|b': '<table><tr><th>foo</th><th>bar</th></tr><tr><td>a</td><td>b</td></tr></table>'
});

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

function matchToAST(o) {
    return function(t) {
        var ret;

        o.match(t, captureAST)

        function captureAST(o) {
            ret = o;
        }

        return ret;
    }
}

function matchToHTML(o) {
    return function(t) {
        return o.match(t, o.toHTML)
    }
}

function suite(f, tests, kCb) {
    kCb = kCb || function(k) {return k;};

    for(var k in tests) {
        var o = tests[k];
        var r = f(kCb(k));

        try {
            assert.ok(equals(r, o));
        }
        catch (e) {
            console.log('Expected:', o, '\nReceived:', r);
        }
    }
}

function dsuite() {}

// http://stackoverflow.com/questions/201183/how-do-you-determine-equality-for-two-javascript-objects
function equals(a, b) {
    function checkArray(n, m) {
        for(var i = 0, len = n.length; i < len; i++) {
            if(!equals(n[i], m[i])) return false;
        }

        return true;
    }

    function checkObject(n, m) {
        for(var i in n) {
            if(n.hasOwnProperty(i)) {
                if(!m.hasOwnProperty(i)) return false;
                if(!equals(n[i], m[i])) return false;
            }
        }

        return true;
    }

    if(isArray(a) && isArray(b)) return checkArray(a, b) && checkArray(b, a);
    if(isObject(a) && isObject(b)) return checkObject(a, b) && checkObject(b, a);

    return a === b;
}

// http://andrewpeace.com/javascript-is-array.html
function isArray(input) {
    return typeof(input)=='object'&&(input instanceof Array);
}

// http://phpjs.org/functions/is_object:450
function isObject(mixed_var) {
    if (Object.prototype.toString.call(mixed_var) === '[object Array]') {
            return false;
    }
    return mixed_var !== null && typeof mixed_var == 'object';
}

