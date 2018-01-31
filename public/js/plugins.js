/**
 * @file api js
 * @author cgzero(cgzero@cgzero.com)
 * @date 2016-07-06
 */

/* globals echarts */
(function () {

    var FONT = 'Helvetica Neue';

    // 当前设备
    var currDevice;

    var deviceSizeMap = {
        pc: {
            rootSize: 100,
            firstSize: 70,
            secondSize: 40,
            itemPadding: 8,
            firstDistance: 160,
            secondDistance: 120,
            fontSize: 14,
            lineHeight: 30,
            fontPadding: 30
        },
        pad: {
            rootSize: 80,
            firstSize: 56,
            secondSize: 32,
            itemPadding: 6,
            firstDistance: 128,
            secondDistance: 96,
            fontSize: 14,
            lineHeight: 30,
            fontPadding: 30
        },
        note: {
            rootSize: 60,
            firstSize: 42,
            secondSize: 24,
            itemPadding: 4,
            firstDistance: 96,
            secondDistance: 72,
            fontSize: 13,
            lineHeight: 25,
            fontPadding: 25
        },
        phone: {
            rootSize: 40,
            firstSize: 28,
            secondSize: 16,
            itemPadding: 3,
            firstDistance: 64,
            secondDistance: 48,
            fontSize: 11,
            lineHeight: 20,
            fontPadding: 20
        }
    };

    var menu = {
        name: 'FECS',
        image: '/img/fecs.png',
        // 一级子菜单
        children: [
            {
                name: 'VIM',
                image: '/img/vim.png',
                link: 'https://github.com/hushicai/fecs.vim'
            },
            {
                name: 'WebStorm',
                image: '/img/webstorm.png',
                link: 'https://github.com/leeight/Baidu-FE-Code-Style#webstorm'
            },
            {
                name: 'Eclipse',
                image: '/img/eclipse.png',
                link: 'https://github.com/ecomfe/fecs-eclipse'
            },
            {
                name: 'Sublime Tex',
                image: '/img/sublime.png',
                children: [
                    {
                        name: 'Sublime Tex',
                        text: 'Baidu FE Code Style',
                        link: 'https://github.com/leeight/Baidu-FE-Code-Style'
                    },
                    {
                        name: 'Sublime Tex',
                        text: 'Sublime Helper',
                        link: 'https://github.com/baidu-lbs-opn-fe/Sublime-fecsHelper'
                    },
                    {
                        name: 'Sublime Tex',
                        text: 'SublimeLinter-contrib-fecs',
                        link: 'https://github.com/robbenmu/SublimeLinter-contrib-fecs'
                    }
                ]
            },
            {
                name: 'Visual Studio Code',
                image: '/img/vscode.png',
                children: [
                    {
                        name: 'Visual Studio Code',
                        text: 'fecs-visual-studio-code',
                        link: 'https://github.com/21paradox/fecs-visual-studio-code'
                    },
                    {
                        name: 'Visual Studio Code',
                        text: 'vscode-fecs(中文)',
                        link: 'https://github.com/MarxJiao/VScode-fecs'
                    },
                    {
                        name: 'Visual Studio Code',
                        text: 'vscode-fecs-plugin(中文)',
                        link: 'https://github.com/l5oo00/vscode-fecs-plugin'
                    }
                ]
            },
            {
                name: 'Atom',
                image: '/img/atom.png',
                link: 'https://github.com/8427003/atom-fecs'
            },
            {
                name: 'Grunt',
                image: '/img/grunt.png',
                link: 'https://github.com/ecomfe/fecs-grunt'
            },
            {
                name: 'Gulp',
                image: '/img/gulp.png',
                link: 'https://github.com/ecomfe/fecs-gulp'
            },
            {
                name: 'Git Hook',
                image: '/img/git.png',
                link: 'https://github.com/cxtom/fecs-git-hooks'
            }
        ]
    };

    var ctx = document.createElement('canvas').getContext('2d');
    var graphic = echarts.graphic;
    var zr;


    var drawDebounce = debounce(500, draw);

    init();

    function init() {
        window.onresize = function () {
            zr && zr.dispose();
            zr = null;
            drawDebounce();
        };

        draw();
    }

    function getDevice() {
        var browserWidth = parseInt(document.body.clientWidth, 10);

        if (browserWidth > 800) {
            currDevice = 'pc';
        }
        else if (browserWidth > 700) {
            currDevice = 'pad';
        }
        else if (browserWidth > 420) {
            currDevice = 'note';
        }
        else {
            currDevice = 'phone';
        }
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

    function draw() {
        zr = echarts.init(document.getElementById('plugins')).getZr();
        getDevice();

        var root = new graphic.Group({
            position: [
                zr.getWidth() / 2,
                zr.getHeight() / 2
            ]
        });
        zr.add(root);

        var gFecs = drawMenuItem(menu, deviceSizeMap[currDevice].rootSize, 20);
        root.add(gFecs);
        gFecs.scale = [
            0,
            0
        ];
        gFecs.animateTo({
            scale: [
                1,
                1
            ]
        }, 1000, 600, 'elasticOut');
        gFecs.silent = true;
        // Adjust image position
        gFecs.childAt(1).position[1] = 2;

        drawLevel(menu, root, 0, Math.PI * 2, deviceSizeMap[currDevice].firstDistance, deviceSizeMap[currDevice].firstSize);

        var pause = false;

        function doRotate(frameTime) {
            if (pause) {
                return;
            }

            root.rotation += root.speed * frameTime / 1000;
            root.dirty();
        }

        root.speed = 6;
        root.animateTo({
            speed: 0.1
        }, 1800);
        root.on('mouseover', function () {
            pause = true;
        }).on('mouseout', function () {
            pause = false;
        });

        zr.animation.on('frame', doRotate);
    }

    function drawLevel(parentMenu, parentNode, startRadian, endRadian, layerRadius, itemSize) {
        var isCircle = (endRadian - startRadian) >= Math.PI * 2;
        var radianStep = (endRadian - startRadian) / (parentMenu.children.length - (isCircle ? 0 : 1));

        parentMenu.children.forEach(function (childItem, idx) {
            var radian = radianStep * idx + startRadian;
            var position = [
                Math.cos(radian) * layerRadius,
                Math.sin(radian) * layerRadius
            ];

            var connector;
            var sector = drawMenuSector(0, layerRadius + itemSize, radian - radianStep / 2, radian + radianStep / 2);
            if (isCircle) {
                connector = sector;
            }
            else {
                connector = drawConnectLine(0, 0, 0, 0, layerRadius);
                // This sector is for better hover feeling
                sector.invisible = true;
                parentNode.add(sector);
            }

            var itemGroup = new graphic.Group();

            itemGroup.add(drawMenuItem(childItem, itemSize));
            itemGroup.scale = [
                0,
                0
            ];
            itemGroup.animate().when(1000, {
                position: position,
                scale: [
                    1,
                    1
                ]
            }).delay(idx / parentMenu.children.length * 400).during(function () {
                if (!isCircle) {
                    connector.setShape({
                        x2: itemGroup.position[0],
                        y2: itemGroup.position[1]
                    });
                }

            }).start('elasticOut');

            if (childItem.children && childItem.children.length) {
                var hideTimeout;
                var showSecondLevel = function () {
                    clearTimeout(hideTimeout);
                    if (childItem.children[0].$group) {
                        return;
                    }

                    removeSubmenu();
                    drawLevel(childItem, itemGroup, radian - radianStep / 1.3, radian + radianStep / 1.3, deviceSizeMap[currDevice].secondDistance, deviceSizeMap[currDevice].secondSize);
                };

                connector.on('mouseover', showSecondLevel).on('mouseout', function () {
                    clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(removeSelfSubmenu, 1000);
                });
            }
            else if (childItem.link) {
                var openLink = function () {
                    removeSubmenu();
                    window.open(childItem.link);
                };
                connector.on('click', openLink);
                itemGroup.childAt(0).on('click', openLink);
            }

            parentNode.add(connector);
            parentNode.add(itemGroup);

            itemGroup.on('mouseover', function () {
                connector.trigger('mouseover');
            }).on('mouseout', function () {
                connector.trigger('mouseout');
            });

            childItem.connector = connector;
            childItem.$group = itemGroup;

            function removeSelfSubmenu() {
                removeChildSubmenu(childItem);
            }
        });

        var removeChildSubmenu = function (childItem) {
            if (childItem.children) {
                childItem.children.forEach(function (grandChildItem) {
                    if (grandChildItem.$group) {
                        childItem.$group.remove(grandChildItem.$group);
                        childItem.$group.remove(grandChildItem.connector);
                        grandChildItem.$group = grandChildItem.connector = null;
                    }

                });
            }

        };

        var removeSubmenu = function () {
            parentMenu.children.forEach(function (childItem) {
                removeChildSubmenu(childItem);
            });
        };
    }

    function drawMenuItem(menuItem, itemSize, z) {
        var group = new graphic.Group({
            afterUpdate: function () {
                var m = this.transform;
                if (m) {
                    // Ignore rotation
                    var sx = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
                    m[0] = m[3] = sx;
                    m[1] = m[2] = 0;
                }

            }
        });

        var bgStyle = {
            fill: 'rgba(255, 255, 255, 0.95)',
            shadowBlur: 5,
            shadowOffsetY: 4,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
        };

        if (menuItem.text) {
            bgStyle.textFill = '#fff';
            bgStyle.fill = 'rgba(255, 255, 255, 0.5)';
            bgStyle.shadowBlur = 3;
            bgStyle.shadowOffsetY = 2;
            bgStyle.text = menuItem.text;

            var font = deviceSizeMap[currDevice].fontSize + 'px ' + FONT;

            bgStyle.font = font;
            ctx.font = font;
            var width = Math.max(ctx.measureText(bgStyle.text).width + deviceSizeMap[currDevice].fontPadding, 60);
            var rect = new graphic.Rect({
                shape: {
                    height: deviceSizeMap[currDevice].lineHeight,
                    width: width,
                    x: -width / 2,
                    y: -15,
                    r: 5
                },
                style: bgStyle
            });

            group.add(rect);
        }
        else if (menuItem.image) {
            var circle = new graphic.Circle({
                shape: {
                    r: itemSize / 2
                },
                style: bgStyle,
                z: z || 0
            });
            var image = new graphic.Image({
                style: {
                    image: menuItem.image,
                    width: itemSize - deviceSizeMap[currDevice].itemPadding * 2,
                    height: itemSize - deviceSizeMap[currDevice].itemPadding * 2,
                    x: -itemSize / 2 + deviceSizeMap[currDevice].itemPadding,
                    y: -itemSize / 2 + deviceSizeMap[currDevice].itemPadding
                },
                z: z || 0
            });

            group.add(circle);
            group.add(image);
        }

        return group;
    }

    function createGradient(cx, cy, r) {
        var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'transparent');
        return gradient;
    }

    function drawMenuSector(r0, r, startAngle, endAngle) {
        var sector = new graphic.Sector({
            shape: {
                startAngle: startAngle,
                endAngle: endAngle,
                r0: r0,
                r: r
            },
            style: {
                opacity: 0.2
            },
            z: -100
        });

        sector.on('mouseover', function () {
            sector.animateTo({
                style: {
                    opacity: 1
                }
            }, 200);
        }).on('mouseout', function () {
            sector.animateTo({
                style: {
                    opacity: 0.2
                }
            }, 200);
        });
        sector.setStyle('fill', createGradient(0, 0, r));
        return sector;
    }

    function drawConnectLine(x1, y1, x2, y2, dist) {
        var line = new graphic.Line({
            shape: {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            },
            style: {
                stroke: createGradient(0, 0, dist),
                lineWidth: 2
            },
            z: -100
        });
        return line;
    }

})();
