/**
 * @file api js
 * @author cgzero(cgzero@cgzero.com)
 * @date 2015-10-15
 */
(function () {

    /**
     * 验证js代码的地址
     *
     * @const
     * @type {string}
     */
    var URL_CHECK_JS = '/check/js/baidu';

    /**
     * 验证css代码的地址
     *
     * @const
     * @type {string}
     */
    var URL_CHECK_CSS= '/check/css/baidu';

    /**
     * 验证html代码的地址
     *
     * @const
     * @type {string}
     */
    var URL_CHECK_HTML = '/check/html/baidu';

    /**
     * 验证less代码的地址
     *
     * @const
     * @type {string}
     */
    var URL_CHECK_LESS = '/check/less/baidu';

    var SERVERITY = {
        1: '<span class="warn">&nbsp;WARN</span>',
        2: '<span class="err">ERROR</span>'
    };

    /**
     * fecs检查通过的信息
     *
     * @const
     * @type {string}
     */
    var TPL_CONSOLE_OK = '<div>fecs <span class="info">INFO</span> Congratulations! Everything is OK!</div>';

    /**
     * fecs检查出错的信息
     *
     * @const
     * @type {string}
     */
    var TPL_CONSOLE_WRAN = '<div>fecs ${serverity} → line ${line}, col ${col}: ${msg}</div>';

    /**
     * js 初始化代码
     *
     * @const
     * @type {string}
     */
    var CODE_JS = [
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
    ];

    /**
     * css 初始化代码
     *
     * @const
     * @type {string}
     */
    var CODE_CSS = [
        'body {',
        '    margin: 0;',
        '    padding: 0;',
        '}'
    ];

    /**
     * html 初始化代码
     *
     * @const
     * @type {string}
     */
    var CODE_HTML = [
        '<!DOCTYPE html>',
        '<html lang="zh-CN">',
        '<head>',
        '    <meta charset="UTF-8"/>',
        '    <title>Hello FECS</title>',
        '    <meta name="viewport" content="width=device-width, initial-scale=1">',
        '</head>',
        '<body>Hello FECS</body>',
        '</html>'
    ];

    /**
     * less 初始化代码
     *
     * @const
     * @type {string}
     */
    var CODE_LESS = [
        '@zero: 0;',
        '',
        'body {',
        '    margin: $zero;',
        '    padding: $zero;',
        '}'
    ];

    /**
     * 检查错误时的提示信息
     *
     * @const
     * @type {string}
     */
    var MSG_CHECK_ERR = '服务器貌似出错了，无法检查代码:(';

    /**
     * 动态验证的延迟时间
     *
     * @const
     * @type {string}
     */
    var CHECK_DELAY_TIME = 500;

    /**
     * 为checkCode增加防抖功能
     *
     * @type {Function}
     */
    var checkCodeDebounce = debounce(CHECK_DELAY_TIME, checkCode);

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
                codeTxt = CODE_JS.join('\n');
                url = URL_CHECK_JS;
                break;
            case 'css':
                codeTxt = CODE_CSS.join('\n');
                url = URL_CHECK_CSS;
                break;
            case 'html':
                codeTxt = CODE_HTML.join('\n');
                url = URL_CHECK_HTML;
                break;
            case 'less':
                codeTxt = CODE_LESS.join('\n');
                url = URL_CHECK_LESS;
                break;
        }

        var editor = ace.edit(type + '-editor');
        editor.$blockScrolling = Infinity;
        editor.setTheme('ace/theme/monokai');
        editor.getSession().setUseWorker(false);
        editor.getSession().setMode('ace/mode/' + type);
        editor.getSession().setValue(codeTxt);

        editor.setOption("wrap",false);
        checkCode(editor.getSession().getValue(), type, url);
        editor.on('change', function (evt) {
            checkCodeDebounce(editor.getValue(), type, url);
        });

        return editor;
    }

    function initEditor() {
        $('.nav-item').on('click', function() {
            var self = $(this);

            $('.nav-item').removeClass('cur');
            self.addClass('cur');

            var dataFor = self.attr('data-for');

            $('.demo-editor').hide();
            $('.demo-console').hide();
            $('#' + dataFor + '-editor').show();
            $('#' + dataFor + '-console').show();
        });

        initAceEditor('javascript');
        initAceEditor('css');
        initAceEditor('html');
        initAceEditor('less');
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
            consoleTpl = TPL_CONSOLE_OK;
        }
        else {
            $.each(data, function(i, item) {
                console.log(item);
                consoleTpl += stringFormat(TPL_CONSOLE_WRAN, {
                    serverity: SERVERITY[item.severity],
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
            cache: false,
            dataType: 'json'
        })
        .then(
            function (data) {
                showConsole(data, type);
            },
            function () {
                alert(MSG_CHECK_ERR);
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
