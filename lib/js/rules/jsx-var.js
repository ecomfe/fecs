/**
 * @file Detect variables in jsx
 * @author chris<wfsr@foxmail.com>
 */

/**
 * SVG 标签
 *
 * @const
 * @type {Array}
 */
const SVG_TAGS = [
    'a',
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'hkern',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'missing-glyph',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'script',
    'set',
    'stop',
    'style',
    'svg',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tref',
    'tspan',
    'use',
    'view',
    'vkern'
];

/**
 * HTML 标签
 *
 * @const
 * @type {Array}
 */
const HTML_TAGS = [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'b',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'html',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'keygen',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'math',
    'menu',
    'menuitem',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'output',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    'rb',
    'rp',
    'rt',
    'rtc',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr'
];

/**
 * SVG + HTML 标签
 *
 * @const
 * @type {Object}
 */
const TAGS = (function () {
    var tags = {};

    SVG_TAGS.forEach(function (name) {
        tags[name] = true;
    });

    HTML_TAGS.forEach(function (name) {
        tags[name] = true;
    });

    return {
        has: function (name) {
            return !!tags[name];
        }
    };
})();

/**
 * Search a particular variable in a list (from eslint-plugin-react)
 *
 * @param {Array} variables The variables list.
 * @param {Array} name The name of the variable to search.
 * @return {boolean} True if the variable was found, false if not.
 */
function findVariable(variables, name) {

    for (var i = 0, len = variables.length; i < len; i++) {
        if (variables[i].name === name) {
            return true;
        }
    }

    return false;
}

/**
 * List all variable in a given scope (from eslint-plugin-react)
 *
 * @param {Object} context The current rule context.
 * @param {Array} name The name of the variable to search.
 * @return {boolean} True if the variable was found, false if not.
 */
function variablesInScope(context) {
    var scope = context.getScope();
    var variables = scope.variables;

    while (scope.type !== 'global') {
        scope = scope.upper;
        variables = scope.variables.concat(variables);
    }

    var childScope = scope.childScopes[0];
    while (childScope) {
        if (childScope.variables.length) {
            childScope.variables.concat(variables);
        }

        childScope = childScope.childScopes[0];
    }

    return variables;
}

module.exports = function (context) {
    const options = context.options[0] || {};
    const id = options.pragma || 'React';

    return {

        JSXElement: function () {
            context.markVariableAsUsed(id);
        },

        JSXOpeningElement: function (node) {
            var name = node.name;
            while (name.type === 'JSXMemberExpression') {
                name = name.object;
            }

            if (name.type === 'JSXNamespacedName') {
                name = name.namespace;
            }

            if (TAGS.has(name.name)) {
                return;
            }

            const variables = variablesInScope(context);

            if (findVariable(variables, name.name)) {
                context.markVariableAsUsed(name.name);
            }
            else {
                context.report(
                    name,
                    '`{{name}}` is not defined',
                    {name: name.name}
                );
            }

        },

        JSXAttribute: function (attr) {
            if (attr.value == null) {
                context.markVariableAsUsed(attr.name.name);
            }
        }
    };
};

module.exports.schema = [
    {
        type: 'object',
        properties: {
            pragma: {
                type: 'string'
            }
        },
        additionalProperties: false
    }
];
