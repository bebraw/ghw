var assert = require('assert');

var ghw = require('../');


ghw.transform('## demo', ghw.transformers, function(ctx) {
    assert.equal(ctx.data, '<h2 id="demo">demo</h2>');
});
