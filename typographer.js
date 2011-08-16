 /*!
  * typographer.js
  * Copyright(c) 2011 Eugene Kalinin
  * MIT Licensed
  */

(function (root) {

  /**
   * Main typography object
   *
   */
  var Typographer = function (lang) {

    // Default language for typography
    this.lang = lang || 'en';
  };

  // Current version.
  Typographer.version = '0.1.0';

  // Export the typographer object. In server-side for `require()` API.
  // If we're not in CommonJS, add `typographer` to the global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Typographer;
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode
    root['Typographer'] = Typographer;
  }

  // Main typographer functions
  // --------------------------

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
    if( !text ) {
      return;
    }
    return text.replace(re_suffix, '$1<span class="ord">$2</span>');
  };
}(this));
