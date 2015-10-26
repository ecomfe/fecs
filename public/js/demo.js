/**
 * @file api js
 * @author cgzero(cgzero@cgzero.com)
 * @date 2015-10-15
 */
(function () {

    /**
     * 代码检测、格式化地址
     *
     * @const
     * @type {Object}
     */
    var URL = {
        // 检测js地址
        CHECK_JS: '/check/js/baidu',
        // 检测css地址
        CHECK_CSS: '/check/css/baidu',
        // 检测html地址
        CHECK_HTML: '/check/html/baidu',
        // 检测less地址
        CHECK_LESS: '/check/less/baidu',
        // 格式化js地址
        FORMAT_JS: '/format/js',
        // 格式化css地址
        FORMAT_CSS: '/format/css',
        // 格式化html地址
        FORMAT_HTML: '/format/html',
        // 格式化less地址
        FORMAT_LESS: '/format/less'
    };

    /**
     * 模板常量
     *
     * @const
     * @type {Object}
     */
    var TPL = {
        // fecs检查通过的信息
        CONSOLE_OK: '<div>fecs <span class="info">INFO</span> Congratulations! Everything is OK!</div>',
        // fecs检查出错的信息
        CONSOLE_WRAN: '<div>fecs ${serverity} → line ${line}, col ${col}: ${msg}</div>',
        // 代码检查时，每种类型错误所对应的模板
        SERVERITY: {
            1: '<span class="warn">&nbsp;WARN</span>',
            2: '<span class="err">ERROR</span>'
        }
    };

    /**
     * 初始化的代码片段
     *
     * @const
     * @type {Object}
     */
    var CODE = {
        // js 初始化代码
        CODE_JS: [
            '/**',
            ' * @file FECS test file',
            ' * @author cgzero(cgzero@cgzero.com)',
            ' */',
            '',
            '/**',
            ' * say Hello',
            ' */',
            'function sayHello() {',
            '    alert(\'Hello FECS\');',
            '}',
            '',
            'sayHello();',
            ''
        ],
        // css 初始化代码
        CODE_CSS: [
            'body {',
            '    margin: 0;',
            '    padding: 0;',
            '}',
            ''
        ],
        // html 初始化代码
        CODE_HTML: [
            '<!DOCTYPE html>',
            '<html lang="zh-CN">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <title>Hello FECS</title>',
            '    <meta http-equiv="X-UA-Compatible" content="IE=Edge">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1">',
            '</head>',
            '<body>',
            '    Hello FECS',
            '</body>',
            '</html>'
        ],
        // less 初始化代码
        CODE_LESS: [
            '@zero: 0;',
            '',
            'body {',
            '    margin: $zero;',
            '    padding: $zero;',
            '}',
            ''
        ]
    };

    /**
     * 各种文字提示信息
     *
     * @const
     * @type {Object}
     */
    var MSG = {
        // 检查错误时的提示信息
        CHECK_ERR: '服务器貌似出错了，无法检查代码:(',
        // 格式化错误时的提示信息
        FORMAT_ERR: '服务器貌似出错了，无法格式化代码:('
    };

    /**
     * 动态验证的延迟时间
     *
     * @const
     * @type {string}
     */
    var CHECK_DELAY_TIME = 500;

    /**
     * ace编辑器
     *
     * @type {Object}
     */
    var ace = window.ace;

    /**
     * 为checkCode增加防抖功能
     *
     * @type {Function}
     */
    var checkCodeDebounce = debounce(CHECK_DELAY_TIME, checkCode);

    /**
     * 存放编辑器实例的列表
     *
     * @type {Object}
     */
    var editorMap = {};

    /**
     * 字符串格式化
     *
     * @inner
     * @param {string} tpl 模板
     * @param {Object} data 传入变量
     * @example
     *     stringFormat('你好，${foo}', {
     *         foo: '世界'
     *     });
     * @return {string} 格式化后的字符串
     */
    function stringFormat(tpl, data) {
        return tpl.replace(
            /\$\{([-a-z0-9_]+)\}/ig,
            function (all, name) {
                return data[name] || '';
            }
        );
    }

    /**
     * 对指定的函数进行包装，返回一个在指定的时间内一次的函数
     *
     * @inner
     * @param {number} wait 时间范围
     * @param {Function} fn 待包装函数
     * @return {Function} 包装后的函数
     */
    function debounce(wait, fn) {
        var timer;
        return function () {
            var ctx = this;
            var args = arguments;

            clearTimeout(timer);

            timer = setTimeout(
                function () {
                    fn.apply(ctx, args);
                },
                wait
            );
        };
    }

    /**
     * 初始化ACE编辑器
     *
     * @inner
     * @param {string} type 代码类型
     */
    function initAceEditor(type) {
        var codeTxt = '';
        var url = '';

        switch (type) {
            case 'javascript':
                codeTxt = CODE.CODE_JS.join('\n');
                url = URL.CHECK_JS;
                break;
            case 'css':
                codeTxt = CODE.CODE_CSS.join('\n');
                url = URL.CHECK_CSS;
                break;
            case 'html':
                codeTxt = CODE.CODE_HTML.join('\n');
                url = URL.CHECK_HTML;
                break;
            case 'less':
                codeTxt = CODE.CODE_LESS.join('\n');
                url = URL.CHECK_LESS;
                break;
        }

        var editor = ace.edit(type + '-editor');
        editor.$blockScrolling = Infinity;
        editor.setTheme('ace/theme/monokai');
        editor.getSession().setUseWorker(false);
        editor.getSession().setMode('ace/mode/' + type);
        editor.getSession().setValue(codeTxt);
        editor.setOption('wrap', false);
        checkCode(editor.getSession().getValue(), type, url);
        editor.on('change', function (evt) {
            checkCodeDebounce(editor.getValue(), type, url);
        });

        editorMap[type] = editor;
    }

    /**
     * 初始化编辑器事件
     *
     * @inner
     */
    function initEditorEvent() {
        $('.nav-item').on('click', function () {
            var self = $(this);

            $('.nav-item').removeClass('cur');
            self.addClass('cur');

            var dataFor = self.attr('data-for');

            $('.demo-editor').hide();
            $('.demo-console').hide();
            $('#' + dataFor + '-editor').show();
            $('#' + dataFor + '-console').show();
        });

        $('.format-btn').on('click', function (event) {
            var type = $('.nav-item.cur').attr('data-for');
            var currEditer = editorMap[type];
            var code = currEditer.getSession().getValue();
            var url;

            switch (type) {
                case 'javascript':
                    url = URL.FORMAT_JS;
                    break;
                case 'css':
                    url = URL.FORMAT_CSS;
                    break;
                case 'html':
                    url = URL.FORMAT_HTML;
                    break;
                case 'less':
                    url = URL.FORMAT_LESS;
                    break;
            }

            formatCode(code, type, url, function (data) {
                currEditer.getSession().setValue(data.code);
            });
        });

        var resizeEditor = function () {
            if ($('.demo-editor-wrap').hasClass('full')) {
                $('.demo-editor').height($(window).height() - 150);
            }
            else {
                $('.demo-editor').height(500);
            }

            $.each(editorMap, function (key, editor) {
                editor.resize();
            });
        };

        $('.full-screen-btn').on('click', function () {
            var self = $(this);
            if (!self.hasClass('full')) {
                $('.demo-editor-wrap').addClass('full');
                self.addClass('full');
                resizeEditor();
            }
            else {
                $('.demo-editor-wrap').removeClass('full');
                self.removeClass('full');
                resizeEditor();
            }
        });

        $(window).resize(function(event) {
            resizeEditor();
        });
    }

    /**
     * 初始化编辑器
     *
     * @inner
     */
    function initEditor() {
        initAceEditor('javascript');
        initAceEditor('css');
        initAceEditor('html');
        initAceEditor('less');
        initEditorEvent();
    }

    /**
     * 展示代码验证结果
     *
     * @inner
     * @param {Object} data json返回数据
     * @param {string} type 代码类型
     */
    function showConsole(data, type) {
        var consoleTpl = '';
        if (!data.length) {
            consoleTpl = TPL.CONSOLE_OK;
        }
        else {
            $.each(data, function (i, item) {
                consoleTpl += stringFormat(TPL.CONSOLE_WRAN, {
                    serverity: TPL.SERVERITY[item.severity],
                    line: item.line,
                    col: item.colum,
                    msg: item.message
                });
            });
        }

        $('#' + type + '-console').html(consoleTpl);
    }

    /**
     * 验证代码
     *
     * @inner
     * @param {string} code 代码片段
     * @param {string} type 代码类型
     * @param {string} url 请求路径
     */
    function checkCode(code, type, url) {
        var params = {
            code: code
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json'
        })
        .then(
            function (data) {
                showConsole(data, type);
            },
            function () {
                alert(MSG.CHECK_ERR);
            }
        );
    }

    /**
     * 格式化代码
     *
     * @inner
     * @param {string} code 代码片段
     * @param {string} type 代码类型
     * @param {string} url 请求路径
     * @param {Function} callback 回调函数
     */
    function formatCode(code, type, url, callback) {
        var params = {
            code: code
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json'
        })
        .then(
            function (data) {
                if (callback) {
                    callback(data);
                }
            },
            function () {
                alert(MSG.FORMAT_ERR);
            }
        );
    }

    /**
     * 初始化
     *
     * @inner
     */
    function init() {
        initEditor();
    }

    init();
})();
