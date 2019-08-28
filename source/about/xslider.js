(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') factory(require('jquery'));
    else factory(window.jQuery);
}(function ($) {
    if (!$) return console.warn('Needs jQuery');
    $.xslider = function (context, options) {
        var self = this;
        self._ = 'xslider';
        self.total = 0;
        self.current = 0;
        self.$container = null;
        self.$slides = null;
        self.$bar = null;
        self.eventSuffix = '.' + self._ + ~~(Math.random() * 2e3);
        self.$context = context;
        self.options = {};
        self.defaults = {
            prefix: self._ + '-',
            keys: { prev: 37, next: 39 },
            scroll: true,
            swipe: false,
            bar: true,
            circular: false,
            selectors: { container: 'ul:first', slides: 'li' },
            activeClass: 'active',
            contextClassData: null
        };
        self.init = function (options) {
            self.options = $.extend({}, self.defaults, options);
            self.$container = self.$context.find(self.options.selectors.container);
            self.$slides = self.$container.children(self.options.selectors.slides);
            self.total = self.$slides.length;
            $.each(['bar', 'keys', 'scroll', 'swipe'], function (index, module) {
                self.options[module] && self['init' + $._ucfirst(module)]();
            });
            self.setIndex(0);
        };
        self.initBar = function () {
            self.$bar = $('<div class="' + self.options.prefix + 'pointer"><span class="' + self.options.prefix + 'bar"></span></div>');
            self.$container.append(self.$bar);
        };
        self.initKeys = function () {
            $(document).on('keyup' + self.eventSuffix, function (e) {
                $.each(self.options.keys, function (key, val) {
                    if (e.which === val) $.isFunction(self[key]) && self[key].call(self);
                });
            });
        };
        self.initScroll = function () {
            var last = null;
            self.$context.bind('mousewheel' + self.eventSuffix, function (e) {
                var now = new Date();
                if (now - last > 800 || !last) {
                    self[(e.originalEvent.deltaY > 0) ? 'next' : 'prev']();
                    last = now;
                }
            });
        };
        self.initSwipe = function () {
            self.$context.swipe({
                swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                    if (direction === self.options.swipe.next) self.next();
                    else if (direction === self.options.swipe.prev) self.prev();
                }
            });
        };
        self.next = function () {
            if (self.current + 1 === self.total && !self.options.circular) return;
            return self.animate((self.current + 1) % self.total);
        };
        self.prev = function () {
            if (self.current === 0 && !self.options.circular) return;
            return self.animate(Math.abs(self.current - 1 % self.total));
        };
        self.setIndex = function (to) {
            to = (to < 0) ? self.total - 1 : to;
            var t = Math.min(Math.max(0, to), self.total - 1);
            if (self.options.contextClassData != null) {
                self.$context.removeClass(self.$slides.eq(self.current).data(self.options.contextClassData));
                self.$context.addClass(self.$slides.eq(t).data(self.options.contextClassData));
            }
            self.current = t;
            self.$slides.eq(t).addClass(self.options.activeClass).siblings().removeClass(self.options.activeClass);
        };
        self.animate = function (to) {
            if (isNaN(to)) return;
            self.setIndex(to);
            self.$context.trigger(self._ + '.change', [to, self.$slides.eq(to)]);
            if (self.total > 1) self.$bar.children().width((100 * self.current / (self.total - 1)) + '%');
        };
        return self.init(options);
    };
    $._ucfirst = function (str) {
        return (str + '').toLowerCase().replace(/^./, function (match) { return match.toUpperCase() });
    };
    $.fn.xslider = function (opts) {
        return this.each(function (index, elem) {
            var $this = $(elem);
            var xslider = $(elem).data('xslider');
            if (xslider instanceof $.xslider) return;
            if (typeof opts === 'string' && $this.data('xslider')) {
                opts = opts.split(':');
                var call = $this.data('xslider')[opts[0]];
                if ($.isFunction(call)) return call.apply($this, opts[1] ? opts[1].split(',') : null);
            }
            return $this.data('xslider', new $.xslider($this, opts));
        });
    };
}));