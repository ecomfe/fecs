/**
 * @file api js
 * @author cgzero(cgzero@cgzero.com)
 * @date 2015-09-24
 */
(function () {

    /**
     * 自动导航
     *
     * @class
     * @param  {string | HTMLElement} nav 导航dom
     * @param  {string | HTMLElement=} slideContent 滚动区域内容
     * @param  {string | HTMLElement=} slideWrap 滚动区域框
     */
    function AutoNav(nav, slideContent, slideWrap) {
        var self = this;

        self.anchorMap = [];
        self.slideContent = $(slideContent) || $('body');
        self.slideWrap = $(slideWrap) || $(window);

        // 初始化anchorMap
        $(nav).each(function (i, item) {
            var attr = $(item).attr('href');
            var parentAttr = attr.split('-')[0];
            var anchor = $(attr);
            var parentNav = $(nav).filter('[href=' + parentAttr + ']');
            self.anchorMap.push({
                parentNav: parentNav,
                nav: $(item),
                anchor: anchor
            });
        });
    }

    AutoNav.prototype = {
        constructor: AutoNav,
        init: function () {
            this.render();
            this.bindEvents();
        },
        initAnchorPos: function () {
            var self = this;
            $.each(self.anchorMap, function (i, item) {
                var currAnchorTop = item.anchor.offset().top;
                var len = self.anchorMap.length;

                // 顶部元素top设0，因为顶部元素也在视野内
                if (i === 0) {
                    item.top = 0;
                }
                else {
                    item.top = currAnchorTop;
                    self.anchorMap[i - 1].bottom = currAnchorTop;
                }

                // 底部元素 bottom设最高
                if (i >= len - 1) {
                    item.bottom = self.slideContent.height();
                }
            });
        },
        render: function () {
            this.initAnchorPos();
        },
        setNavActive: function (navMapItem) {
            navMapItem.nav.addClass('cur');
            // navMapItem.parentNav.addClass('cur');
        },
        resetNavActive: function (navMapItem) {
            navMapItem.nav.removeClass('cur');
            // navMapItem.parentNav.removeClass('cur');
        },
        resetAllNavActive: function () {
            var self = this;
            $.each(self.anchorMap, function (i, item) {
                self.resetNavActive(item);
            });
        },
        bindEvents: function () {
            var self = this;

            // 页面滚动时，动态计算当前cate
            self.slideWrap.scroll(function () {
                var currScrollTop = self.slideWrap.scrollTop();
                var currItem;
                // var minOffset;

                $.each(self.anchorMap, function (i, item) {
                    // self.resetNavActive(item);

                    // var currOffset = item.top - currScrollTop
                    if (currScrollTop === 0) {
                        currItem = self.anchorMap[0];
                        self.setNavActive(currItem);
                        return false;
                    }

                    if (
                        currScrollTop < item.bottom - 5
                        && currScrollTop > item.top - 5
                    ) {
                        self.setNavActive(item);
                    }
                    else {
                        self.resetNavActive(item);
                    }

                    // if (currScrollTop === 0) {
                    //     currItem = self.anchorMap[0];
                    //     self.setNavActive(currItem)
                    //     return false;
                    // }

                    // if (currOffset >= 0 ) {
                    //     if (!minOffset) {
                    //         minOffset = currOffset;
                    //         currItem = item;
                    //     }
                    //     else if ( currOffset < minOffset) {
                    //         minOffset = currOffset;
                    //         currItem = item;
                    //     }
                    // }
                });
                // self.setNavActive(currItem)
            });

            // 点击左侧导航，平滑滚动至指定位置
            $.each(self.anchorMap, function (i, item) {
                item.nav.on('click', function (e) {
                    var currNav = $(this);
                    e.preventDefault();
                    self.slideWrap.scrollTo(
                        currNav.attr('href'),
                        100,
                        {
                            onAfter: function () {
                                setTimeout(function () {
                                    self.resetAllNavActive();
                                    self.setNavActive(item);
                                }, 50);

                            }
                        }
                    );

                    // setTimeout(function () {
                    //     console.log(item)
                    //     self.setNavActive(item);
                    // }, 200);
                });
            });
        }
    };

    new AutoNav('.api-nav-list .anchor', '.api-entry', '.api-content').init();
})();
