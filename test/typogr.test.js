 /*!
  * typographer
  * Copyright(c) 2011 Eugene Kalinin
  * MIT Licensed
  */

var tp = require('../typogr')
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
    assert.equal(tp.initQuotes('"With primes"'), '<span class="dquo">"</span>With primes"');
    assert.equal(tp.initQuotes("'With single primes'"), '<span class="quo">\'</span>With single primes\'');
    assert.equal(tp.initQuotes('<a href="#">"With primes and a link"</a>'),
                '<a href="#"><span class="dquo">"</span>With primes and a link"</a>');
    assert.equal(tp.initQuotes('&#8220;With smartypanted quotes&#8221;'),
                '<span class="dquo">&#8220;</span>With smartypanted quotes&#8221;');
    assert.equal(tp.initQuotes('<h1> <strong>&lsquo;With</strong> single primes ...</h1>'),
                '<h1> <strong><span class="quo">&lsquo;</span>With</strong> single primes ...</h1>');
    assert.equal(tp.initQuotes('<h2> &#8220;Jayhawks&#8221; & KU fans ... </h2>'),
                           '<h2> <span class="dquo">&#8220;</span>Jayhawks&#8221; & KU fans ... </h2>');
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
  'caps tests': function(){
    assert.equal(tp.caps('A message from KU'),
                'A message from <span class="caps">KU</span>');
    // Uses the smartypants tokenizer to not screw with HTML or with tags it shouldn't.
    assert.equal(tp.caps('<PRE>CAPS</pre> more CAPS'),
                '<PRE>CAPS</pre> more <span class="caps">CAPS</span>');
    assert.equal(tp.caps('A message from 2KU2 with digits'),
                'A message from <span class="caps">2KU2</span> with digits');
    assert.equal(tp.caps('Dotted caps followed by spaces should never include them in the wrap D.O.T.   like so.'),
                'Dotted caps followed by spaces should never include them in the wrap <span class="caps">D.O.T.</span>  like so.');
    // All caps with with apostrophes in them shouldn't break. Only handles dump apostrophes though.
    assert.equal(tp.caps("JIMMY'S"),
                '<span class="caps">JIMMY\'S</span>');
    assert.equal(tp.caps("<i>D.O.T.</i>HE34T<b>RFID</b>"),
                '<i><span class="caps">D.O.T.</span></i><span class="caps">HE34T</span><b><span class="caps">RFID</span></b>');
  },
  'tokenize': function(){
    assert.eql( tp.tokenize('<h1>test header</h1>'+
                    '<p>some <b>other</b> text</p> '+
                    'and appendix ...'),
              [ { type: 'tag', txt: '<h1>' },
                { type: 'text', txt: 'test header' },
                { type: 'tag', txt: '</h1>' },
                { type: 'tag', txt: '<p>' },
                { type: 'text', txt: 'some ' },
                { type: 'tag', txt: '<b>' },
                { type: 'text', txt: 'other' },
                { type: 'tag', txt: '</b>' },
                { type: 'text', txt: ' text' },
                { type: 'tag', txt: '</p>' },
                { type: 'text', txt: ' and appendix ...' } ]
    );
  },
  'smartEscapes': function(){
    assert.eql( tp.smartEscapes( '\\" : \\\' : \\- : \\. : \\\\ : \\`'),
                         '&#34; : &#39; : &#45; : &#46; : &#92; : &#96;');
  },
  'smartDashes': function(){
    assert.eql( tp.smartDashes( '-- : --- : -- : ---'),
                  '&#8211; : &#8212; : &#8211; : &#8212;');
  },
  'smartEllipses': function(){
    assert.eql( tp.smartEllipses( '. ... : . . . .'),
                                '. &#8230; : &#8230; .');
  },
  'smartBackticks': function(){
    assert.eql( tp.smartBackticks( "``Isn't this fun?''"),
                           "&#8220;Isn't this fun?&#8221;");
  },
  'smartQuotes': function(){
    assert.eql( tp.smartQuotes( '"Isn\'t this fun?"'),
                           '&#8220;Isn&#8217;t this fun?&#8221;');
  },
  'smartypants': function(){
    assert.eql( tp.smartypants( 'The "Green" man'),
                           'The &#8220;Green&#8221; man');
  },
  'typogrify': function(){
    assert.eql( tp.typogrify(
        '<h2>"Jayhawks" & KU fans act extremely obnoxiously</h2>'),
        '<h2><span class="dquo">&#8220;</span>Jayhawks&#8221; <span class="amp">&amp;</span> <span class=\"caps\">KU</span> fans act extremely&nbsp;obnoxiously</h2>');
    assert.equal( tp('<h2>"Jayhawks" & KU fans act extremely obnoxiously</h2>').typogrify(),
        '<h2><span class="dquo">&#8220;</span>Jayhawks&#8221; <span class="amp">&amp;</span> <span class=\"caps\">KU</span> fans act extremely&nbsp;obnoxiously</h2>');
    assert.equal( tp('<h2>"Jayhawks" & KU fans act extremely obnoxiously</h2>').chain().typogrify().value(),
        '<h2><span class="dquo">&#8220;</span>Jayhawks&#8221; <span class="amp">&amp;</span> <span class=\"caps\">KU</span> fans act extremely&nbsp;obnoxiously</h2>');
    assert.eql( tp.typogrify({
          html: function () {
            return '<h2>"Jayhawks" & KU fans act extremely obnoxiously</h2>';
          },
          selector: '#some-test',
          jquery: '1.6.3-test'
        }),
        '<h2><span class="dquo">&#8220;</span>Jayhawks&#8221; <span class="amp">&amp;</span> <span class=\"caps\">KU</span> fans act extremely&nbsp;obnoxiously</h2>');
  },
};
