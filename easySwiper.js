(
    function(win,dom,undefined){
        //准备工作
        if (!Object.assign){
            Object.defineProperty(Object, "assign", {
                enumerable: false,
                configurable: true,
                writable: true,
                value: function(target, firstSource) {
                    "use strict";
                    if (target === undefined || target === null)
                        throw new TypeError("Cannot convert first argument to object");
                    var to = Object(target);
                    for (var i = 1; i < arguments.length; i++) {
                        var nextSource = arguments[i];
                        if (nextSource === undefined || nextSource === null) continue;
                        var keysArray = Object.keys(Object(nextSource));
                        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                            var nextKey = keysArray[nextIndex];
                            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                            if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                        }
                    }
                    return to;
                }
            });
        }

        function hasClass(elem,cls) {
            cls = " " + cls + " ";
            if (( " " + elem.className + " " ).replace( /[\t\r\n\f]/g, " " ).indexOf( cls ) > -1
            ) {
                return true;
            }
            return false;
        }

        function addClass(ele,cls){
            cls = cls.match(/\S+/g) || [];
            cls.forEach(function(clz){
                if (!hasClass(ele,clz)) ele.className += " "+cls;
            });
        }

        function removeClass(ele,cls) {
            cls = cls.match(/\S+/g) || [];
            cls.forEach(function(clz){
                var reg = new RegExp('(\\s|^)'+clz+'(\\s|$)',"g");
                ele.className=ele.className.replace(reg,' ');
            });
        }

        //默认配置
        var SwiperDefault = {
            pageClass:"s-page",//默认页面选择符
            wrapperClass:"s-wrapper",
            pagination:"false",//默认不显示分页
            direction:"horizontal",//默认方向 水平
        }

        function Swiper(target,options){
            if(options){
                options.target = target;
            }
            else{
                options = target;
            }
            options = Object.assign({},SwiperDefault,options);
            this.options = options;

            var container = (typeof options.target =="string")?dom.querySelectorAll(options.target):options.target;
            if(container&&container.nodeType!=1&&container.length){
                if (container.length === 0) return;
                if (container.length > 1) {
                    var swipers = [];
                    container = [].slice.call(container);
                    container.forEach(function (elem){
                        swipers.push(new Swiper(elem,options));
                    });
                    return swipers;
                }
                container = container[0];
            }
            else{
                return;
            }

            this.container = container;
            var wrapper = container.querySelector("."+options.wrapperClass);
            addClass( wrapper,"s-wrapper" );
            addClass( this.container,"s-container-" + options.direction );
            var pages = [].slice.call(container.querySelectorAll(options.pageSelector));
            pages.forEach(function(page){
                wrapper.appendChild(page);
            });
            container.appendChild(wrapper);
            this.pages = pages;
            this.wrapper = wrapper;
            this.resize();

        }

        Swiper.prototype = {
            resize:function(){//根据容器尺寸设置item和wrapper尺寸
                var isHorizontal = this.options.direction == "horizontal";
                var itemCount = this.pages.length;



                if(isHorizontal){//水平的
                    this.wrapper.style.width = itemCount+ "00%";
                    this.pages.forEach(function(e){
                        e.style.width  = 100/itemCount +"%";
                        e.style.height = "100%";
                        e.style.float  = "left";
                    });
                }

            },
        }

        win.Swiper = Swiper;
    }
)(window,document)