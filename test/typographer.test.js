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
  },
  'ord tests': function(){
    assert.equal(tp.ord('2nd'), '2<span class="ord">nd</span>');
    assert.equal(tp.ord('10th'), '10<span class="ord">th</span>');
    assert.equal(tp.ord('37th'), '37<span class="ord">th</span>');
  },
  'quotes tests': function(){
    assert.equal(tp.quotes('"With primes"'), '<span class="dquo">"</span>With primes"');
    assert.equal(tp.quotes("'With single primes'"), '<span class="quo">\'</span>With single primes\'');
    assert.equal(tp.quotes('<a href="#">"With primes and a link"</a>'),
                '<a href="#"><span class="dquo">"</span>With primes and a link"</a>');
    assert.equal(tp.quotes('&#8220;With smartypanted quotes&#8221;'),
                '<span class="dquo">&#8220;</span>With smartypanted quotes&#8221;');
    assert.equal(tp.quotes('<h1> <strong>&lsquo;With</strong> single primes ...</h1>'),
                '<h1> <strong><span class="quo">&lsquo;</span>With</strong> single primes ...</h1>');
  },
};
