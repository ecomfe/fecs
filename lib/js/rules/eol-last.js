/**
 * @file Require file to end with single newline.
 * @author Nodeca Team <https://github.com/nodeca>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    var disallowMultiBlankLine = context.options[0] !== true;
    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        Program: function checkBadEOF(node) {
            // Get the whole source code, not for node only.
            var src = context.getSource();
            var location = {column: 1};

            if (src[src.length - 1] !== '\n') {
                // file is not newline-terminated
                location.line = src.split(/\n/g).length;
                context.report(node, location, 'Newline required at end of file but not found.');
            }
            else if (disallowMultiBlankLine && /\n\s*\n$/.test(src)) {
                // last line is empty
                location.line = src.split(/\n/g).length - 1;
                context.report(node, location, 'Unexpected blank line at end of file.');
            }
        }

    };

};


module.exports.schema = [
    {
        type: 'boolean'
    }
];


