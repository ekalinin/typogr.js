 /*!
  * typographer
  * Copyright(c) 2011 Eugene Kalinin
  * MIT Licensed
  */

var Typo = require('../typographer')
  , tp = new Typo()
  , assert = require('assert');

module.exports = {
  'amp tests': function(){
    ['One & two', 'One &amp; two', 'One &#38; two'].forEach( function (val) {
      assert.equal(tp.amp(val), 'One <span class="amp">&amp;</span> two');
    });
    assert.equal(tp.amp('One&nbsp;&amp;&nbsp;two'),
                'One&nbsp;<span class="amp">&amp;</span>&nbsp;two');
    // It won't mess up & that are already wrapped, in entities or URLs
    assert.equal(tp.amp('One <span class="amp">&amp;</span> two'),
                'One <span class="amp">&amp;</span> two');
    assert.equal(tp.amp('&ldquo;this&rdquo; & <a href="/?that&amp;test">that</a>'),
                '&ldquo;this&rdquo; <span class="amp">&amp;</span> <a href="/?that&amp;test">that</a>');
    // It should ignore standalone amps that are in attributes
    assert.equal(tp.amp('<link href="xyz.html" title="One & Two">xyz</link>'),
                '<link href="xyz.html" title="One & Two">xyz</link>');
  }
};
