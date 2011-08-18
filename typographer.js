 /*!
  * typographer.js
  * Copyright(c) 2011 Eugene Kalinin
  * MIT Licensed
  */

(function (root) {

  // Current version
  var version = '0.2.1';

  /** Main typography object */
  var Typographer = function () {};

  // export objects
  var exporter = {
    Typographer:    Typographer,
    version:        version
  };

  // Export the typographer object. In server-side for `require()` API.
  // If we're not in CommonJS, add `typographer` to the global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exporter;
  } else {
    root.typographer = exporter;
  }

  // Typographer functions
  // ---------------------

  /**
   * Wraps apersands in HTML with ``<span class="amp">`` so they can be
   * styled with CSS. Apersands are also normalized to ``&amp;``. Requires 
   * ampersands to have whitespace or an ``&nbsp;`` on both sides.
   *
   */
  Typographer.prototype.amp = function(text) {
    var re_amp = /(\s|&nbsp;)(&|&amp;|&\#38;)(\s|&nbsp;)/g
                //(    $1   )(     $2       )(   $3    )
      , re_intra_tag = /(<[^<]*>)?([^<]*)(<\/[^<]*>)?/g;
                      //( prefix) ( txt )(  suffix )
    if( !text ) {
      return;
    }
    return text.replace(re_intra_tag, function (str, prefix, text, suffix) {
      var prefix = prefix || ''
        , suffix = suffix || ''
        , text = text.replace(re_amp, '$1<span class="amp">&amp;</span>$3');

      return prefix + text + suffix;
    })
  };

  /**
   * Wraps date suffix in <span class="ord"> so they can be styled with CSS.
   *
   */
  Typographer.prototype.ord = function(text) {
    var re_suffix = /(\d+)(st|nd|rd|th)/g;
                   //  $1        $2
    if( !text ) {
      return;
    }
    return text.replace(re_suffix, '$1<span class="ord">$2</span>');
  };

  /**
   * Wraps initial quotes in ``class="dquo"`` for double quotes or ``class="quo"``
   * for single quotes. Works in these block tags ``(h1-h6, p, li, dt, dd)``
   * and also accounts for potential opening inline elements ``a, em, strong, span, b, i``
   *
   */
  Typographer.prototype.quotes = function(text) {
    var re_quote = new RegExp(''+
            '(<[p|h[1-6]|li|dt|dd][^>]*>|^)'+         // start with an opening
                                                      // p, h1-6, li, dd, dt
                                                      // or the start of the string
            '\\s*'+                                   // optional white space!
            '(<[a|em|span|strong|i|b][^>]*>\\s*)*'+   // optional opening inline tags,
                                                      // with more optional white space for each.
            '("|&ldquo;|&#8220;)|'+                   // Find me a quote! (only need to find
            '(\'|&lsquo;|&#8216;\')'                  // the left quotes and the primes)
          , 'i');

    if( !text ) {
      return;
    }
    return text.replace(re_quote, function (matched_str, header, inline, dquo, squo) {
      var classname = dquo ? "dquo" : "quo"
        , quote = dquo ? dquo : squo;

      return [matched_str.slice(0, matched_str.lastIndexOf(quote)),   // all before quote
        '<span class="', classname, '">', quote, '</span>'].join('');
    })
  };

  /**
   * Replaces the space between the last two words in a string with ``&nbsp;``
   * Works in these block tags ``(h1-h6, p, li, dd, dt)`` and also accounts for
   * potential closing inline elements ``a, em, strong, span, b, i``
   *
   */
  Typographer.prototype.widont = function(text) {
    var re_widont = new RegExp(''+
            '((?:</?(?:a|em|span|strong|i|b)[^>]*>)|'+  // must be proceeded by an approved
                '[^<>\\s])'+                      // inline opening or closing tag or
                                                  // a nontag/nonspace
            '\\s+'+                               // the space to replace
            '([^<>\\s]+'+                         // must be flollowed by non-tag
                                                  // non-space characters
            '\\s*'+                               // optional white space!
            '(</(a|em|span|strong|i|b)>\\s*)*'+   // optional closing inline tags with
                                                  // optional white space after each
            '((</(p|h[1-6]|li|dt|dd)>)|$))'       // end with a closing p, h1-6, li or
                                                  // the end of the string
            , 'gi');
    return text.replace(re_widont, '$1&nbsp;$2');
  };

  // SmartyPants functions
  // ---------------------

  /**
   * Translates plain ASCII punctuation characters into 
   * "smart" typographic punctuation HTML entities.
   */
  Typographer.prototype.smartypants = function(text) {
    var self = this
      , tokens = this.tokenize(text)
      , result = []
      , re_skip_tags = /<(\/)?(pre|code|kbd|script|math)[^>]*>/i
      , skipped_tag_stack = []
      , skipped_tag = ''
      , skip_match = ''
      , in_pre = false
        // This is a cheat, used to get some context for one-character
        // tokens that consist of just a quote char. What we do is remember
        // the last character of the previous text token, to use as context
        // to curl single-character quote tokens correctly.
      , prev_token_last_char = ''
      , last_char
        // currentV token
      , t;

    tokens.forEach( function (token) {
      if (token.type === 'tag') {
        // Don't mess with quotes inside some tags.
        // This does not handle self <closing/> tags!
        result.push(token.txt);

        // is it a skipped tag ?
        if ( (skip_match = re_skip_tags.exec(token.txt)) != null  ) {
          skipped_tag = skip_match[2].toLowerCase();

          // closing tag
          if ( skip_match[1] ) {
            if ( skipped_tag_stack.length > 0 ) {
              if ( skipped_tag === skipped_tag_stack[-1] ) {
                skipped_tag_stack.pop();
              }
            }
            if (skipped_tag_stack.length === 0) {
              in_pre = false;
            }
          }
          // opening tag
          else {
            skipped_tag_stack.push(skipped_tag);
            in_pre = true;
          }
        }
      } else {
        t = token.txt;
        // Remember last char of this token before processing
        last_char = t.slice(-1);

        if ( !in_pre ) {
          t = self.smartEscapes(t);
          t = self.smartDashes(t);
          t = self.smartEllipses(t);
          // backticks need to be processed before quotes
          t = self.smartBackticks(t);
          // quotes
          switch(t) {
            case "'": // Special case: single-character ' token
              if (/\S/.test(prev_token_last_char)) {  t = '&#8217;'; }
                                              else {  t = '&#8216;'; }
              break;
            case '"': // Special case: single-character " token
              if (/\S/.test(prev_token_last_char)) {  t = '&#8221;'; }
                                              else {  t = '&#8220;'; }
              break;
            default:  // Normal case
              t = self.smartQuotes(t);
          }
        }

        prev_token_last_char = last_char;
        result.push(t);
      }
    });

    return result.join(' ');
  };

  /**
   * Returns an array of the tokens comprising the input string.
   * Each token is either a tag (possibly with nested, tags contained
   * therein, such as <a href="<MTFoo>">, or a run of text between tags.
   * Each element of the array is an object with properties 'type' and 'txt';
   * Values for 'type': 'tag' or 'text'; 'txt' is the actual value.
   *
   */
  Typographer.prototype.tokenize = function(text) {
    var tokens = []
      , lastIndex = 0
      , re_tag = /([^<]*)(<[^>]*>)/gi
      , curr_token;

    while ( (curr_token = re_tag.exec(text)) != null ) {
      var pre_text = curr_token[1]
        , tag_text = curr_token[2];

      if (pre_text) {
        tokens.push({ type: 'text', txt: pre_text });
      }
      tokens.push({ type: 'tag', txt: tag_text });
      lastIndex = re_tag.lastIndex;
    }

    if (re_tag.lastIndex <= text.length) {
        tokens.push({ type: 'text', txt: text.slice(lastIndex) });
    }

    return tokens;
  };

  /**
   * Returns input string, with after processing the following backslash
   * escape sequences. This is useful if you want to force a "dumb"
   * quote or other character to appear.
   *
   */
  Typographer.prototype.smartEscapes = function(text) {
    return text.replace(/\\"/g,   '&#34;')
               .replace(/\\'/g,   '&#39;')
               .replace(/\\-/g,   '&#45;')
               .replace(/\\\./g,  '&#46;')
               .replace(/\\\\/g,  '&#92;')
               .replace(/\\`/g,   '&#96;');
  };

  /**
   * Returns input text, with each instance of "--"
   * translated to an em-dash HTML entity.
   *
   */
  Typographer.prototype.smartDashes = function(text) {
    return text.replace(/---/g, '&#8211;')    // en  (yes, backwards)
               .replace(/--/g,  '&#8212;');   // em  (yes, backwards)
  };

  /**
   * Returns input string, with each instance of "..."
   * translated to an ellipsis HTML entity.
   *
   */
  Typographer.prototype.smartEllipses = function(text) {
    return text.replace(/\.\.\./g,    '&#8230;')
               .replace(/\. \. \./g,  '&#8230;');
  };

  /**
   * Returns input string, with ``backticks'' -style double quotes
   * translated into HTML curly quote entities.
   *
   */
  Typographer.prototype.smartBackticks = function(text) {
    return text.replace(/``/g,  '&#8220;')
               .replace(/''/g,  '&#8221;');
  };


  /**
   * Returns input string, with "educated" curly quote
   * HTML entities.
   *
   */
  Typographer.prototype.smartQuotes = function(text) {
    var punct_cls     = '[!"#\$\%\'()*+,-.\/:;<=>?\@\[\\\]\^_`{|}~]'
      , re_punct_str  = '(?=%s\\B)'.replace('%s', punct_cls)
      , close_cls = '[^\ \t\r\n\[\{\(\-]'
      , dec_dashes = '&#8211;|&#8212;'
      , re_opening_single_quotes = new RegExp(''+
          '('+
            '\s           |'+     // a whitespace char, or
            '&nbsp;       |'+     // a non-breaking space entity, or
            '--           |'+     // dashes, or
            '&[mn]dash;   |'+     // named dash entities
            dec_dashes + '|'+     // or decimal entities
            '&\#x201[34];'+       // or hex
          ')'+
          '\''+                   // the quote
          '(?=\w)', 'g')          // followed by a word character
      , re_closing_single_quotes = new RegExp (''+
          '('+close_cls+')'+
          '\''+                       //                      *
          '(?!\s | s\b | \d)' , 'g')  // ??? may be: '(?!\s | \s\b | \d)'
      , re_closing_single_quotes2 = new RegExp (''+
          '('+close_cls+')'+
          '\''+                   //                      *
          '(?!\s | s\b)', 'g')    // ??? may be: '(?!\s | \s\b)'
      , re_opening_double_quotes = new RegExp(''+
          '('+
            '\s           |'+     // a whitespace char, or
            '&nbsp;       |'+     // a non-breaking space entity, or
            '--           |'+     // dashes, or
            '&[mn]dash;   |'+     // named dash entities
            dec_dashes + '|'+     // or decimal entities
            '&\#x201[34];'+       // or hex
          ')'+
          '"'+                    // the quote
          '(?=\w)', 'g')          // followed by a word character
      , re_closing_double_quotes = new RegExp (''+
          // '('+close_cls+')?'+
          '"(?=\s)' , 'g')
      , re_closing_double_quotes2 = new RegExp (''+
          '('+close_cls+')"', 'g');

    return text
        // Special case if the very first character is a quote
        // followed by punctuation at a non-word-break.
        // Close the quotes by brute force:
        .replace(new RegExp("^'%s".replace('%s', re_punct_str), 'g'), '&#8217;')
        .replace(new RegExp('^"%s'.replace('%s', re_punct_str), 'g'), '&#8221;')

        // Special case for double sets of quotes, e.g.:
        //  <p>He said, "'Quoted' words in a larger quote."</p>
        .replace(/"'(?=\w)/g, '&#8220;&#8216;')
        .replace(/'"(?=\w)/g, '&#8216;&#8220;')

        // Special case for decade abbreviations (the '80s):
        .replace(/\b'(?=\d{2}s)/g, '&#8217;')

        // Opening single quotes
        .replace(re_opening_single_quotes, '$1&#8216;')
        // Closing single quotes
        .replace(re_closing_single_quotes, '$1&#8217;')
        .replace(re_closing_single_quotes2,'$1&#8217;$2')
        // Any remaining single quotes should be opening ones
        .replace("'", '&#8216;')

        // Opening double quotes
        .replace(re_opening_double_quotes, '$1&#8220;')
        // Closing double quotes
        .replace(re_closing_double_quotes, '&#8221;')
        .replace(re_closing_double_quotes2,'$1&#8221;')
        // Any remaining quotes should be opening ones.
        .replace('"', '&#8220;');
  };

}(this));
