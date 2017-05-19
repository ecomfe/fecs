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
     * @param  {string | HTMLElement=} navWrap 导航主区域
     * @param  {string | HTMLElement=} slideContent 滚动区域内容
     * @param  {string | HTMLElement=} slideWrap 滚动区域框
     */
    function AutoNav(nav, navWrap, slideContent, slideWrap) {
        var self = this;

        self.anchorMap = [];
        self.navWrap = $('.api-nav-inner');
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
        },
        resetNavActive: function (navMapItem) {
            navMapItem.nav.removeClass('cur');
        },
        resetAllNavActive: function () {
            var self = this;
            $.each(self.anchorMap, function (i, item) {
                self.resetNavActive(item);
            });
        },
        bindEvents: function () {
            var self = this;
            var contentHeight = self.slideContent.height();
            var navHeight = self.navWrap.height();

            // 页面滚动时，动态计算当前cate
            self.slideWrap.scroll(function () {
                var currScrollTop = self.slideWrap.scrollTop();
                var currItem;

                // 因为考虑到有高度较窄的屏幕，nav 可能被挡住
                // 所以滚动的时候，如果左侧存在被遮挡的 nav，整个nav需要缓慢上移保证隐藏的 nav 露出
                var currWindowHeight = (navHeight > $(window).height())
                    ? navHeight - $(window).height()
                    : 0
                if (currWindowHeight) {
                    self.navWrap.css({
                        // 加上40px让每次滚动的距离稍微多一点，这样滚到最后时会与底部留一点间距，更加美观
                        transform: 'translateY(-' + (currScrollTop / contentHeight * (currWindowHeight + 40)) + 'px)'
                    });
                }
                else {
                    self.navWrap.css({
                        transform: 'translateY(0)'
                    });
                }

                $.each(self.anchorMap, function (i, item) {

                    if (currScrollTop === 0) {
                        currItem = self.anchorMap[0];
                        self.resetAllNavActive();
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
                });
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
                });
            });
        }
    };

    new AutoNav(
        '.api-nav-list .anchor',
        '.api-nav-inner',
        '.api-entry',
        '.api-content'
    ).init();
})();
