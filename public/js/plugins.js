/**
 * @file api js
 * @author cgzero(cgzero@cgzero.com)
 * @date 2016-07-06
 */
(function () {

    var chart = echarts.init(document.getElementById('plugins'));
    var ctx = document.createElement('canvas').getContext('2d');

    var graphic = echarts.graphic;
    var zr = chart.getZr();

    var ROOT_LAYER_ITEM_SIZE = 100;
    var FIRST_LAYER_ITEM_SIZE = 70;
    var SECOND_LAYER_ITEM_SIZE = 40;
    var MENU_ITEM_PADDING = 8;
    var FIRST_LAYER_DISTANCE = 160;
    var SECOND_LAYER_DISTANCE = 120;

    var FONT = '14px Helvetica Neue';

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

    draw();

    function draw() {
        var root = new graphic.Group({
            position: [
                zr.getWidth() / 2,
                zr.getHeight() / 2
            ]
        });
        zr.add(root);

        var gFecs = drawMenuItem(menu, ROOT_LAYER_ITEM_SIZE, 20);
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

        drawLevel(menu, root, 0, Math.PI * 2, FIRST_LAYER_DISTANCE, FIRST_LAYER_ITEM_SIZE);

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
                    drawLevel(childItem, itemGroup, radian - radianStep / 1.3, radian + radianStep / 1.3, SECOND_LAYER_DISTANCE, SECOND_LAYER_ITEM_SIZE);
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
            bgStyle.font = FONT;
            ctx.font = FONT;
            var width = Math.max(ctx.measureText(bgStyle.text).width + 30, 60);
            var rect = new graphic.Rect({
                shape: {
                    height: 30,
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
                    width: itemSize - MENU_ITEM_PADDING * 2,
                    height: itemSize - MENU_ITEM_PADDING * 2,
                    x: -itemSize / 2 + MENU_ITEM_PADDING,
                    y: -itemSize / 2 + MENU_ITEM_PADDING
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
