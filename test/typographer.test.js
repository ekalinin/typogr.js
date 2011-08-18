 /*!
  * typographer
  * Copyright(c) 2011 Eugene Kalinin
  * MIT Licensed
  */

var typo = require('../typographer')
  , tp = new typo.Typographer()
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
  'widont tests': function(){
    assert.equal(tp.widont('A very simple test'), 'A very simple&nbsp;test');
    // Single word items shouldn't be changed
    assert.equal(tp.widont('Test'), 'Test');
    assert.equal(tp.widont(' Test'), ' Test');
    assert.equal(tp.widont('<ul><li>Test</p></li><ul>'), '<ul><li>Test</p></li><ul>');
    assert.equal(tp.widont('<ul><li> Test</p></li><ul>'), '<ul><li> Test</p></li><ul>');
    assert.equal(tp.widont('<p>In a couple of paragraphs</p><p>paragraph two</p>'),
                           '<p>In a couple of&nbsp;paragraphs</p><p>paragraph&nbsp;two</p>');
    assert.equal(tp.widont('<h1><a href="#">In a link inside a heading</i> </a></h1>'),
                           '<h1><a href="#">In a link inside a&nbsp;heading</i> </a></h1>');
    assert.equal(tp.widont('<h1><a href="#">In a link</a> followed by other text</h1>'),
                           '<h1><a href="#">In a link</a> followed by other&nbsp;text</h1>');
    // Empty HTMLs shouldn't error
    assert.equal(tp.widont('<h1><a href="#"></a></h1>'), '<h1><a href="#"></a></h1>');
    assert.equal(tp.widont('<div>Divs get no love!</div>'), '<div>Divs get no love!</div>');
    assert.equal(tp.widont('<pre>Neither do PREs</pre>'), '<pre>Neither do PREs</pre>');
    assert.equal(tp.widont('<div><p>But divs with paragraphs do!</p></div>'),
                           '<div><p>But divs with paragraphs&nbsp;do!</p></div>');
  },
};
