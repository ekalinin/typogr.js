typogr.js
=========

**typogr.js** provides a set of functions which automatically
apply various transformations to plain text in order to yield
typographically-improved HTML.

**typogr.js** is inspired by these awesome packages:

* [django-typogrify](https://github.com/chrisdrackett/django-typogrify)
* [smartypants](http://web.chad.org/projects/smartypants.py/)
* [underscore](https://github.com/documentcloud/underscore)

Installation
------------

It's recommended to install via [npm](https://github.com/isaacs/npm/):

    npm install -g typogr


Usage
=====

**typogr.js** has no external dependencies and can be used both on
the server and in the browser.

Simple
------

    // Only for server side
    var typogr = require('typogr');

    typogr.typogrify('<h1>"Pretty header ...</h1>');
    '<h1><span class="dquo">&#8220;</span>Pretty header&nbsp;&#8230;</h1>'

OOP-style
---------

    // Only for server side
    var typogr = require('typogr');

    typogr('<h1>"Pretty header ...</h1>').typogrify();
    '<h1><span class="dquo">&#8220;</span>Pretty header&nbsp;&#8230;</h1>'

Chains
------

    // Only for server side
    var typogr = require('typogr');

    typogr('<h1>"Pretty header ...</h1>').chain().quotes().value();
    '<h1><span class="dquo">"</span>Pretty header ...</h1>'

    typogr('<h1>"Pretty header ...</h1>').chain().quotes().smartypants().value();
    '<h1><span class="dquo">&#8220;</span>Pretty header &#8230;</h1>'


API
===

amp
---

Wraps ampersands in HTML with <span class="amp"> so they can be
styled with CSS. Ampersands are also normalized to &amp;. Requires
ampersands to have whitespace or an &nbsp; on both sides. Will not
change any ampersand which has already been wrapped in this fashion.

quotes
------

Wraps initial quotes in <span class="dquo"> for double quotes or
<span class="quo"> for single quotes. Works inside these block
elements:

* h1, h2, h3, h4, h5, h6
* p
* li
* dt
* dd

Also accounts for potential opening inline elements: a, em,
strong, span, b, i.

smartypants
-----------

* Straight quotes ( " and ' '") into “curly” quote HTML entities (&lsquo; | &rsquo; | &ldquo; | &rdquo;)
* Backticks-style quotes (``like this''') into “curly” quote HTML entities (&lsquo; | &rsquo; | &ldquo; | &rdquo;)
* Dashes (“--” and “---”) into n-dash and m-dash entities (&ndash; | &mdash;)
* Three consecutive dots (“...”) into an ellipsis entity (&hellip;)

widont
------

Based on Shaun Inman's PHP utility of the same name, replaces the
space between the last two words in a string with &nbsp; to avoid
a final line of text with only one word.

Works inside these block elements:

* h1, h2, h3, h4, h5, h6
* p
* li
* dt
* dd

Also accounts for potential closing inline elements: a, em,
strong, span, b, i.

ord
---

Wraps number suffix's in <span class="ord"></span> so they can be styled.


typogrify
---------

Applies all of the following filters, in order:

* amp
* widont
* smartypants
* quotes
* ord

License
=======

See [LICENSE](https://github.com/ekalinin/typogr.js/blob/master/LICENSE)
file.
