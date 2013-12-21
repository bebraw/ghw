var suite = require('suite.js');
var t = require('../').transformers;


suite(matchToHTML(t.bracketPipeLink), [
    '[[foo|bar]]', '<a href="bar.html">foo</a>',
    '[[foo|bar bar]]', '<a href="bar-bar.html">foo</a>',
    '[[a|b]] [[b|a]]', '<a href="b.html">a</a> <a href="a.html">b</a>',
    '[[a|http://b]]', '<a href="http://b">a</a>',
    '[[a|https://b]]', '<a href="https://b">a</a>',
    '[[foo|Foo Bar]]', '<a href="foo-bar.html">foo</a>',
    '[[foo|Bar Bar Bar]]', '<a href="bar-bar-bar.html">foo</a>'
]);

suite(matchToHTML(t.pipeLink), [
    '[foo|bar]', '<a href="bar">foo</a>',
    '[foo|bar bar]', '<a href="bar-bar">foo</a>',
    '[foo|bar bar bar]', '<a href="bar-bar-bar">foo</a>',
    '[foo|bar] [bar|foo]', '<a href="bar">foo</a> <a href="foo">bar</a>'
]);

suite(matchToHTML(t.bracketLink), [
    '[[]]', '[[]]',
    '[[foo]]', '<a href="foo.html">foo</a>',
    '[[foo foo]]', '<a href="foo-foo.html">foo foo</a>',
    '[[a]] [[b]]', '<a href="a.html">a</a> <a href="b.html">b</a>',
    '[[Foo Bar]]', '<a href="foo-bar.html">Foo Bar</a>',
    '[[Foo Bar Baz??]]', '<a href="foo-bar-baz%253F%253F.html">Foo Bar Baz??</a>'
]);

suite(matchToHTML(t.regularLinkWithWhitespace), [
    '[foo] (bar)', '<a href="bar">foo</a>',
    '[foo](https://foo.com)', '[foo](https://foo.com)'
]);

suite(matchToHTML(t.pureLinkBegin), [
    'http://jgestures.codeplex.com', '[jgestures.codeplex.com](http://jgestures.codeplex.com)',
    'http://foo.foo barbar foo', '[foo.foo](http://foo.foo) barbar foo',
    '[foo](https://foo.com)', '[foo](https://foo.com)',
    'foo', 'foo'
]);

suite(matchToHTML(t.pureLinkEnd), [
    'Audio: https://github.com/ofmlabs', 'Audio: https://github.com/ofmlabs',
    'HTML-HTML_: https://foo-fo_o.com, http://bar.com', 'HTML-HTML_: https://foo-fo_o.com, http://bar.com',
    'foo', 'foo'
]);

suite(matchToHTML(t.paragraphs), [
    'foo', '<p>foo</p>',
    'foo\nbar', '<p>foo</p><p>bar</p>',
    'foo\n\nbar', '<p>foo</p><p>bar</p>'
]);

function matchToHTML(o) {
    return function(t) {
        return o.match(t, o.toHTML);
    };
}
