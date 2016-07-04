[![Build Status](https://travis-ci.org/ekalinin/typogr.js.svg?branch=master)](https://travis-ci.org/ekalinin/typogr.js)

Table of Contents
=================

  * [typogr.js](#typogrjs)
    * [Installation](#installation)
  * [Usage](#usage)
    * [Simple on the server](#simple-on-the-server)
    * [Simple in the browser](#simple-in-the-browser)
    * [OOP-style](#oop-style)
    * [Chains](#chains)
  * [API](#api)
    * [amp](#amp)
    * [initQuotes](#initquotes)
    * [smartypants](#smartypants)
    * [widont](#widont)
    * [caps](#caps)
    * [ord](#ord)
    * [typogrify](#typogrify)
  * [CLI](#cli)
  * [License](#license)


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

Simple on the server
--------------------

```javascript
// Only for server side
var typogr = require('typogr');

typogr.typogrify('<h1>"Pretty header ...</h1>');
'<h1><span class="dquo">&#8220;</span>Pretty header&nbsp;&#8230;</h1>'
```

Simple in the browser
---------------------

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
<script src="https://cdn.rawgit.com/ekalinin/typogr.js/0.6.6/typogr.min.js"></script>
<script>
$(document).ready(function() {
    $('#res').html(typogr.typogrify($('#src')));
})
</script>
```


OOP-style
---------

```javascript
// Only for server side
var typogr = require('typogr');

typogr('<h1>"Pretty header ...</h1>').typogrify();
'<h1><span class="dquo">&#8220;</span>Pretty header&nbsp;&#8230;</h1>'
```

Chains
------

```javascript
// Only for server side
var typogr = require('typogr');

typogr('<h1>"Pretty header ...</h1>').chain().initQuotes().value();
'<h1><span class="dquo">"</span>Pretty header ...</h1>'

typogr('<h1>"Pretty header ...</h1>').chain().initQuotes().smartypants().value();
'<h1><span class="dquo">&#8220;</span>Pretty header &#8230;</h1>'
```


API
===

amp
---

Wraps ampersands in HTML with `<span class="amp">` so they can be
styled with CSS. Ampersands are also normalized to `&amp;`. Requires
ampersands to have whitespace or an `&nbsp;` on both sides. Will not
change any ampersand which has already been wrapped in this fashion.

initQuotes
------

Wraps initial quotes in `<span class="dquo">` for double quotes or
`<span class="quo">` for single quotes. Works inside these block
elements:

* `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
* `p`
* `li`
* `dt`
* `dd`

Also accounts for potential opening inline elements: `a`, `em`,
`strong`, `span`, `b`, `i`.

smartypants
-----------

* Straight quotes ( " and ' '") into “curly” quote HTML entities (&lsquo; | &rsquo; | &ldquo; | &rdquo;)
* Backticks-style quotes (``like this''') into “curly” quote HTML entities (&lsquo; | &rsquo; | &ldquo; | &rdquo;)
* Dashes (“--” and “---”) into n-dash and m-dash entities (&ndash; | &mdash;)
* Three consecutive dots (“...”) into an ellipsis entity (&hellip;)

widont
------

Based on Shaun Inman's PHP utility of the same name, replaces the
space between the last two words in a string with `&nbsp;` to avoid
a final line of text with only one word.

Works inside these block elements:

* `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
* `p`
* `li`
* `dt`
* `dd`

Also accounts for potential closing inline elements: `a`, `em`,
`strong`, `span`, `b`, `i`.

caps
----

Wraps multiple capital letters in `<span class="caps"></span>` so they can be styled.

ord
---

Wraps number suffix's in `<span class="ord"></span>` so they can be styled.


typogrify
---------

Applies all of the following filters, in order:

* amp
* widont
* smartypants
* caps
* initQuotes
* ord


CLI
===

A command line interface can be used to typogrify html files.

    % typogr --help

      Usage: typogr [options] [input] [output]

      Options:

        -h, --help     output usage information
        -V, --version  output the version number
        -i, --inplace  Use single path as both input and output
        -f, --force    Do not prompt to verify file overwrites

      reads input from stdin, individual files, directories, or globs
      writes ouput to stdout, individual files, or directories

      Examples:

        $ typogr inputFile.html outputFile.html
        $ typogr < inputFile.html > outputFile.html
        $ typogr -i singleFile.html
        $ typogr inputDirectory outputDirectory
        $ typogr inputDirectory/*.html outputDirectory


License
=======

See [LICENSE](https://github.com/ekalinin/typogr.js/blob/master/LICENSE)
file.
