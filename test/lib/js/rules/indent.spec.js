/**
 * @file Check indent.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/indent');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

/**
 * Create error message object for failure cases
 *
 * @param {string} indentType indent type of string or tab
 * @param {Array} errors error info
 * @return {Object} return the error messages collection
 */
function expectedErrors(indentType, errors) {
    if (Array.isArray(indentType)) {
        errors = indentType;
        indentType = 'space';
    }

    if (!errors[0].length) {
        errors = [errors];
    }

    return errors.map(function (err) {
        return {
            message: 'Bad indentation (' + err[2] + ' instead ' + err[1] + ').',
            type: err[3] || 'Program',
            line: err[0]
        };
    });
}

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('indent', rule, {

    valid: [
        'var foo = []',
        'var foo = [\n]',
        'var foo = [1, 2, 3, 4]',
        'var foo = [1,\n    2, 3, 4]',
        'var foo = [1, 2, 3,\n    4]',
        'var foo = [1, \n    2, \n    3, \n    4]',
        'var foo = [\n    1, 2, 3, 4\n]',
        '// html\nvar foo = [\n    1, \n        2, \n    3, \n    4]',
        {
            code: [
                '  bridge.callHandler(',
                '    \'getAppVersion\', \'test23\', function(responseData) {',
                '      window.ah.mobileAppVersion = responseData;',
                '    }',
                '  );'
            ].join('\n'),
            options: ['space', 2, 2]
        },
        {
            code: [
                'bridge.callHandler(',
                '  \'getAppVersion\', \'test23\', function(responseData) {',
                '    window.ah.mobileAppVersion = responseData;',
                '  }',
                ');'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'bridge.callHandler(',
                '  \'getAppVersion\',',
                '  null,',
                '  function responseCallback(responseData) {',
                '    window.ah.mobileAppVersion = responseData;',
                '  }',
                ');'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'bridge.callHandler(',
                '    \'getAppVersion\',',
                '    null,',
                '    function responseCallback(responseData) {',
                '        window.ah.mobileAppVersion = responseData;',
                '    });'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'function doStuff(keys) {',
                '    _.forEach(',
                '        keys,',
                '        key => {',
                '            doSomething(key);',
                '        }',
                '   );',
                '}'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'example(',
                '    function () {',
                '        console.log(\'example\');',
                '    }',
                ');'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'let foo = somethingList',
                '    .filter(x => {',
                '        return x;',
                '    })',
                '    .map(x => {',
                '        return 100 * x;',
                '    });'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'require(\'http\').request({hostname: \'localhost\', port: 80}, function(res) {',
                '  res.end();',
                '});'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'function test() {',
                '  return client.signUp(email, PASSWORD, { preVerified: true })',
                '    .then(function (result) {',
                '      // hi',
                '    })',
                '    .then(function () {',
                '      return FunctionalHelpers.clearBrowserState(self, {',
                '        contentServer: true,',
                '        contentServer1: true',
                '      });',
                '    });',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'function test() {',
                '    return client.signUp(email, PASSWORD, { preVerified: true })',
                '        .then(',
                '            function (result) {',
                '                var x = 1;',
                '                var y = 1;',
                '            }, ',
                '            function(err){',
                '                var o = 1 - 2;',
                '                var y = 1 - 2;',
                '                return true;',
                '            }',
                '        );',
                '}'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                '// hi'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var Command = function() {',
                '  var fileList = [],',
                '      files = []',
                '',
                '  files.concat(fileList)',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                '  '
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'if(data) {',
                '  console.log(\'hi\');',
                '  b = true;',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'foo = () => {',
                '  console.log(\'hi\');',
                '  return true;',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'function test(data) {',
                '  console.log(\'hi\');',
                '  return true;',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var test = function(data) {',
                '  console.log(\'hi\');',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'arr.forEach(function(data) {',
                '  otherdata.forEach(function(zero) {',
                '    console.log(\'hi\');',
                '  });',
                '});'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'a = [',
                '    3',
                ']'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                '[',
                '  [\'gzip\', \'gunzip\'],',
                '  [\'gzip\', \'unzip\'],',
                '  [\'deflate\', \'inflate\'],',
                '  [\'deflateRaw\', \'inflateRaw\'],',
                '].forEach(function(method) {',
                '  console.log(method);',
                '});'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'test(123, {',
                '    bye: {',
                '        hi: [1,',
                '            {',
                '                b: 2',
                '            }',
                '        ]',
                '    }',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var xyz = 2,',
                '    lmn = [',
                '        {',
                '            a: 1',
                '        }',
                '    ];'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'lmn = [{',
                '    a: 1',
                '},',
                '{',
                '    b: 2',
                '},',
                '{',
                '    x: 2',
                '}];'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'abc({',
                '    test: [',
                '        [',
                '            c,',
                '            xyz,',
                '            2',
                '        ].join(\',\')',
                '    ]',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'abc = {',
                '  test: [',
                '    [',
                '      c,',
                '      xyz,',
                '      2',
                '    ]',
                '  ]',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'abc(',
                '  {',
                '    a: 1,',
                '    b: 2',
                '  }',
                ');'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'abc({',
                '    a: 1,',
                '    b: 2',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var abc = ',
                '  [',
                '    c,',
                '    xyz,',
                '    {',
                '      a: 1,',
                '      b: 2',
                '    }',
                '  ];'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var abc = [',
                '  c,',
                '  xyz,',
                '  {',
                '    a: 1,',
                '    b: 2',
                '  }',
                '];'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var abc = 5,',
                '    c = 2,',
                '    xyz = ',
                '    {',
                '      a: 1,',
                '      b: 2',
                '    };'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var abc = ',
                '    {',
                '      a: 1,',
                '      b: 2',
                '    };'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var a = new abc({',
                '        a: 1,',
                '        b: 2',
                '    }),',
                '    b = 2;'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var a = 2,',
                '  c = {',
                '    a: 1,',
                '    b: 2',
                '  },',
                '  b = 2;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var x = 2,',
                '    y = {',
                '      a: 1,',
                '      b: 2',
                '    },',
                '    b = 2;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var e = {',
                '      a: 1,',
                '      b: 2',
                '},',
                '      b = 2;'
            ].join('\n'),
            options: ['space', 6]
        },
        {
            code: [
                'var a = {',
                '  a: 1,',
                '  b: 2',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'function test() {',
                '  if (true || ',
                '            false){',
                '    console.log(val);',
                '  }',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'for (var val in obj)',
                '  if (true)',
                '    console.log(val);'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'if(true)',
                '  if (true)',
                '    if (true)',
                '      console.log(val);'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'function hi(){     var a = 1;',
                '  y++;                   x++;',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'for(;length > index; index++)if(NO_HOLES || index in self){',
                '  x++;',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'function test(){',
                '  switch(length){',
                '    case 1: return function(a){',
                '      return fn.call(that, a);',
                '    };',
                '  }',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var geometry = 2,',
                'rotate = 2;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var geometry,',
                '    rotate;'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var geometry,',
                '\trotate;'
            ].join('\n'),
            options: ['tab', 1]
        },
        {
            code: [
                'var geometry,',
                '  rotate;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var geometry,',
                '    rotate;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'let geometry,',
                '    rotate;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'const geometry = 2,',
                '    rotate = 3;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,',
                '  height, rotate;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'if (1 < 2){',
                '//hi sd ',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'while (1 < 2){',
                '  //hi sd ',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'while (1 < 2) console.log(\'hi\');'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                '[a, b, c].forEach((index) => {',
                '    index;',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                '[a, b, c].forEach(function(index){',
                '    return index;',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                '[a, b, c].forEach((index) => {',
                '    index;',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                '[a, b, c].forEach(function(index){',
                '    return index;',
                '});'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'switch (x) {',
                '    case \'foo\':',
                '        a();',
                '        break;',
                '    case \'bar\':',
                '        switch (y) {',
                '            case \'1\':',
                '                break;',
                '            case \'2\':',
                '                a = 6;',
                '                break;',
                '        }',
                '    case \'test\':',
                '        break;',
                '}'
            ].join('\n'),
            options: ['space', 4, 0, true]
        },
        {
            code: [
                'switch (a) {',
                'case \'foo\':',
                '    a();',
                '    break;',
                'case \'bar\':',
                '    switch(x){',
                '    case \'1\':',
                '        break;',
                '    case \'2\':',
                '        a = 6;',
                '        break;',
                '    }',
                '}'
            ].join('\n'),
            options: ['space', 4, 0, false]
        },
        {
            code: [
                'switch (a) {',
                'case \'foo\':',
                '    a();',
                '    break;',
                'case \'bar\':',
                '    if(x){',
                '        a = 2;',
                '    }',
                '    else{',
                '        a = 6;',
                '    }',
                '}'
            ].join('\n'),
            options: ['space', 4, 0, false]
        },
        {
            code: [
                'switch (a) {',
                'case \'foo\':',
                '    a();',
                '    break;',
                'case \'bar\':',
                '    if(x){',
                '        a = 2;',
                '    }',
                '    else',
                '        a = 6;',
                '}'
            ].join('\n'),
            options: ['space', 4, 0, false]
        },
        {
            code: [
                'switch (a) {',
                'case \'foo\':',
                '    a();',
                '    break;',
                'case \'bar\':',
                '    a(); break;',
                'case \'baz\':',
                '    a(); break;',
                '}'
            ].join('\n'),
            options: ['space', 4, 0, false]
        },
        {
            code: 'switch (0) {\n}'
        },
        {
            code: [
                'function foo() {',
                '    var a = \'a\';',
                '    switch(a) {',
                '    case \'a\':',
                '        return \'A\';',
                '    case \'b\':',
                '        return \'B\';',
                '    }',
                '}',
                'foo();'
            ].join('\n'),
            options: ['space', 4, 0, false]
        },
        {
            code: [
                'switch(value){',
                '    case \'1\':',
                '    case \'2\':',
                '        a();',
                '        break;',
                '    default:',
                '        a();',
                '        break;',
                '}',
                'switch(value){',
                '    case \'1\':',
                '        a();',
                '        break;',
                '    case \'2\':',
                '        break;',
                '    default:',
                '        break;',
                '}'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'try {',
                '\t\tvar obj = {foo: 1, bar: 2};',
                '}',
                'catch (e) {',
                '\t\tconsole.log(foo.foo + foo.bar);',
                '}'
            ].join('\n'),
            options: ['tab', 2]
        },
        {
            code: [
                'if (a) {',
                '    (1 + 2 + 3);', // no error on this line
                '}'
            ].join('\n')
        },
        {
            code: 'switch(value){ default: a(); break; }'
        },
        {
            code: 'import {addons} from \'react/addons\'\nimport React from \'react\'',
            options: ['space', 2]
        },
        {
            code: [
                'var a = 1,',
                '    b = 2,',
                '    c = 3;'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var a = 1',
                '   ,b = 2',
                '   ,c = 3;'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: 'while (1 < 2) console.log(\'hi\')',
            options: ['space', 2]
        },
        {
            code: [
                'function salutation () {',
                '  switch (1) {',
                '    case 0: return console.log(\'hi\')',
                '    case 1: return console.log(\'hey\')',
                '  }',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var items = [',
                '  {',
                '    foo: \'bar\'',
                '  }',
                '];'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'const a = 1,',
                '      b = 2;',
                'const items1 = [',
                '  {',
                '    foo: \'bar\'',
                '  }',
                '];',
                'const items2 = Items(',
                '  {',
                '    foo: \'bar\'',
                '  }',
                ');'
            ].join('\n'),
            options: ['space', 2]

        },
        {
            code: [
                'const geometry = 2,',
                '      rotate = 3;',
                'var a = 1,',
                '  b = 2;',
                'let light = true,',
                '    shadow = false;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'const abc = 5,',
                '      c = 2,',
                '      xyz = ',
                '      {',
                '        a: 1,',
                '        b: 2',
                '      };',
                'let abc = 5,',
                '  c = 2,',
                '  xyz = ',
                '  {',
                '    a: 1,',
                '    b: 2',
                '  };',
                'var abc = 5,',
                '    c = 2,',
                '    xyz = ',
                '    {',
                '      a: 1,',
                '      b: 2',
                '    };'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'module.exports =',
                '{',
                '  \'Unit tests\':',
                '  {',
                '    rootPath: \'./\',',
                '    environment: \'node\',',
                '    tests:',
                '    [',
                '      \'test/test-*.js\'',
                '    ],',
                '    sources:',
                '    [',
                '      \'*.js\',',
                '      \'test/**.js\'',
                '    ]',
                '  }',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var path     = require(\'path\')',
                '  , crypto   = require(\'crypto\')',
                '  ;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var a = 1',
                '   ,b = 2',
                '   ;'
            ].join('\n')
        },
        {
            code: [
                'export function create (some,',
                '                        argument) {',
                '  return Object.create({',
                '    a: some,',
                '    b: argument',
                '  });',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'export function create (id, xfilter, rawType,',
                '                        width=defaultWidth, height=defaultHeight,',
                '                        footerHeight=defaultFooterHeight,',
                '                        padding=defaultPadding) {',
                '  // ... function body, indented two spaces',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var obj = {',
                '  foo: function () {',
                '    return new p()',
                '      .then(function (ok) {',
                '        return ok;',
                '      }, function () {',
                '        // ignore things',
                '      });',
                '  }',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'a.b()',
                '  .c(function(){',
                '    var a;',
                '  }).d.e;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'const YO = \'bah\',',
                '      TE = \'mah\'',
                '',
                'var res,',
                '    a = 5,',
                '    b = 4'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'const YO = \'bah\',',
                '      TE = \'mah\'',
                '',
                'var res,',
                '    a = 5,',
                '    b = 4',
                '',
                'if (YO) console.log(TE)'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var foo = \'foo\',',
                '  bar = \'bar\',',
                '  baz = function() {',
                '      ',
                '  }',
                '',
                'function hello () {',
                '    ',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var obj = {',
                '  send: function () {',
                '    return P.resolve({',
                '      type: \'POST\'',
                '    })',
                '    .then(function () {',
                '      return true;',
                '    }, function () {',
                '      return false;',
                '    });',
                '  }',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'const someOtherFunction = argument => {',
                '        console.log(argument);',
                '    },',
                '    someOtherValue = \'someOtherValue\';'
            ].join('\n')
        },
        {
            code: [
                '[',
                '  \'a\',',
                '  \'b\'',
                '].sort().should.deepEqual([',
                '  \'x\',',
                '  \'y\'',
                ']);'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var a = 1,',
                '    B = class {',
                '      constructor(){}',
                '      a(){}',
                '      get b(){}',
                '    };'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'var a = 1,',
                '    B = ',
                '    class {',
                '      constructor(){}',
                '      a(){}',
                '      get b(){}',
                '    },',
                '    c = 3;'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'class A{',
                '    constructor(){}',
                '    a(){}',
                '    get b(){}',
                '}'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var A = class {',
                '    constructor(){}',
                '    a(){}',
                '    get b(){}',
                '}'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var a = {',
                '  some: 1',
                ', name: 2',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'a.c = {',
                '    aa: function() {',
                '        \'test1\';',
                '        return \'aa\';',
                '    },',
                '    bb: function() {',
                '        return this.bb();',
                '    }',
                '};'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var a =',
                '{',
                '    actions:',
                '    [',
                '        {',
                '            name: \'compile\'',
                '        }',
                '    ]',
                '};'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var a =',
                '[',
                '    {',
                '        name: \'compile\'',
                '    }',
                '];'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'const func = function (opts) {',
                '    return Promise.resolve()',
                '        .then(() => {',
                '            [',
                '                \'ONE\', \'TWO\'',
                '            ].forEach(command => {doSomething();});',
                '        });',
                '};'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var haveFun = function () {',
                '    SillyFunction(',
                '        {',
                '            value: true,',
                '        },',
                '        {',
                '            _id: true,',
                '        }',
                '    );',
                '};'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'var haveFun = function () {',
                '    new SillyFunction(',
                '        {',
                '            value: true,',
                '        },',
                '        {',
                '            _id: true,',
                '        }',
                '    );',
                '};'
            ].join('\n'),
            options: ['space', 4]
        },
        {
            code: [
                'let object1 = {',
                '  doThing() {',
                '    return _.chain([])',
                '      .map(v => (',
                '        {',
                '          value: true,',
                '        }',
                '      ))',
                '      .value();',
                '  }',
                '};'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'class Foo',
                '  extends Bar {',
                '  baz() {}',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        {
            code: [
                'class Foo extends',
                '  Bar {',
                '  baz() {}',
                '}'
            ].join('\n'),
            options: ['space', 2]
        },
        [
            'promise',
            '    .then(success, fail)',
            '    .then(success, fail)',
            '    .then(success, fail)',
            '    .end()'
        ].join('\n'),
        [
            'how',
            '    .to',
            '    .doing',
            '    .something();'
        ].join('\n'),
        [
            'how',
            '    .to()',
            '    .doing()',
            '    .something();'
        ].join('\n'),
        'how.to.doing.something();',
        'how.to().doing().something();',
        [
            '([',
            '    "<dl>",',
            '    "<dt>",',
            '    "hello, ",',
            '    "</dt>",',
            '    "<dd>",',
            '    "<p>",',
            '    "world!",',
            '    "</p>",',
            '    "</dd>",',
            '    "</dl>"',
            '])'
        ].join('\n'),
        [
            '([',
            '    "<dl>",',
            '        "<dt>",',
            '            "hello, ",',
            '        "</dt>",',
            '        "<dd>",',
            '            "<p>",',
            '                "world!",',
            '            "</p>",',
            '        "</dd>",',
            '    "</dl>"',
            '])'
        ].join('\n'),
        [
            'var total = validTypes.reduce(',
            '    function (total, type) {',
            '        total += types[type] | 0;',
            '        return total;',
            '    },',
            '    0',
            ');'
        ].join('\n')
    ],

    invalid: [
        {
            code: '  var foo;',
            errors: [
                {message: 'Bad indentation (2 instead 0).', type: 'VariableDeclaration', line: 1}
            ]
        },
        {
            code: 'var foo = [\n    ]',
            errors: [
                {message: 'Bad indentation (4 instead 0).', type: 'ArrayExpression', line: 2}
            ]
        },
        {
            code: 'var foo = [\n1, \n    2, \n    3, \n    4]',
            errors: [
                {message: 'Bad indentation (0 instead 4).', type: 'Literal', line: 2}
            ]
        },
        {
            code: 'var foo = [\n1    , \n    2, \n    3, \n    4]',
            errors: [
                {message: 'Bad indentation (0 instead 4).', type: 'Literal', line: 2}
            ]
        },
        {
            code: 'var foo = [\n    1, \n2, \n    3, \n    4]',
            errors: [
                {message: 'Bad indentation (0 instead 4).', type: 'Literal', line: 3}
            ]
        },
        {
            code: 'a\n    .b\n  .c();',
            errors: [
                {message: 'Bad indentation (2 instead 0 or 4).', type: 'Identifier', line: 3}
            ]
        },
        {
            code: 'a\n    .b\n  .c\n    .d();',
            errors: [
                {message: 'Bad indentation (2 instead 4).', type: 'Identifier', line: 3}
            ]
        },
        {
            code: [
                'var html = [',
                '    "<dl>",',
                '        "<dt>",',
                '                "hello, ",',
                '        "</dt>",',
                '        "<dd>",',
                '            "<p>",',
                '                "world!",',
                '            "</p>",',
                '        "</dd>",',
                '    "</dl>"',
                '].join(\'\\n\')'
            ].join('\n'),
            errors: [
                {message: 'Bad indentation (16 instead one of [4, 8, 12]).', type: 'Literal', line: 4}
            ]
        },
        {
            code: [
                'var a = b;',
                'if (a) {',
                '\tb();',
                '}'
            ].join('\n'),
            options: ['space', 2],
            errors: [
                {message: 'Expected space but saw tab.', type: 'ExpressionStatement'}
            ]
        },
        {
            code: [
                ' if (a) {',
                '   if (b) {',
                ' \tb();',
                '   }',
                ' }'
            ].join('\n'),
            options: ['space', 2, 1],
            errors: [
                {message: 'Expected space but saw tab.', type: 'ExpressionStatement', line: 3},
                {message: 'Bad indentation (3 instead 5).', type: 'ExpressionStatement', line: 3}
            ]
        },
        {
            code: [
                'var a = b;',
                'if (a) {',
                'b();',
                '}'
            ].join('\n'),
            options: ['space', 2],
            errors: expectedErrors([
                [3, 2, 0, 'ExpressionStatement']
            ])
        },
        {
            code: [
                'if (array.some(function(){',
                '  return true;',
                '})) {',
                'a++; // ->',
                '  b++;',
                '    c++; // <-',
                '}'
            ].join('\n'),
            options: ['space', 2],
            errors: expectedErrors([
                [4, 2, 0, 'ExpressionStatement'],
                [6, 2, 4, 'ExpressionStatement']
            ])
        }
    ]
});
