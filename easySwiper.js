(function(win,dom){
    "use strict"
    //准备工作
    if (!Object.assign){
        Object.defineProperty(Object, "assign", {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function(target, firstSource) {
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
        if (( " " + elem.className + " " ).replace( /[\t\r\n\f]/g, " " ).indexOf( cls ) > -1 ) {
            return true;
        }
        return false;
    }

    function addClass(ele,cls){
        cls = cls.match(/\S+/g) || [];
        if(!ele.forEach){
            ele = [ele];
        }
        ele.forEach(function(e){
            if(e.nodeType === 1){
                cls.forEach(function(clz){
                    if (!hasClass(e,clz)) e.className += " "+cls;
                });
            }
        });
    }

    function removeClass(ele,cls) {
        cls = cls.match(/\S+/g) || [];
        cls.forEach(function(clz){
            var reg = new RegExp('(\\s|^)'+clz+'(\\s|$)',"g");
            ele.className=ele.className.replace(reg,' ');
        });
    }

    function getComputedStyle(elem){
        return elem.currentStyle?elem.currentStyle : window.getComputedStyle(elem,null);
    }


    //默认配置
    var SwiperDefault = {
        pageClass:"s-page",//默认页面选择符
        wrapperClass:"s-wrapper",
        pagination:"false",//默认不显示分页
        isHorizontal:true,//默认方向 水平
        threshold:50,//临界值,超过临界值触发翻页
        duration:"0.5s",//持续时间
        supportWheel:true,//支持鼠标滚轮翻页
        wheelThreshold:2,//鼠标滚动触发翻页次数
        auto:true,//是否自动滚动
        autoInterval:5000,//自动滚动时间间隔
    }

    function Swiper(target,options){
        var container,
            wrapper,
            pages;

        var self = this;

        this.canMove =false;
        this.moveDistance = 0;
        this.pageSize;//每一页的宽度或者高度,取决于移动方向

        if(options){
            options.target = target;
        }
        else{
            options = target;
        }
        options = Object.assign({},SwiperDefault,options);
        this.options = options;
        if(!options.target){
            return ;
        }

        container = (typeof options.target =="string")?dom.querySelectorAll(options.target):options.target;

        if(container.length){
            if (container.length === 0) return;
            if (container.length > 1) {
                var swipers = [];
                container = [].slice.call(container);
                container.forEach(function (elem){
                    swipers.push(new Swiper(elem,options));
                });
                return swipers;
            }
            //length=1的情况
            container = container[0];
        }

        wrapper = container.querySelector("."+options.wrapperClass);
        wrapper.style.transitionProperty = "transform";
        wrapper.style.transitionDuration = this.options.duration;
        pages = [].slice.call(wrapper.querySelectorAll("."+options.pageClass));

        addClass( container,"s-container-" + (options.isHorizontal?"horizontal":"vertical") );
        addClass( wrapper,"s-wrapper" );
        addClass( pages,"s-page");
        this.container = container;
        this.wrapper = wrapper;
        this.transFormDistance = 0;
        this.pages = pages;
        this.pageCount = pages.length;
        this.index = 1;
        this.autoTimer = null;
        this.resize();
        var resizeTimer = null;
        window.addEventListener("resize",function(){//窗体大小变化时节流改变wrapper和page的大小
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function(){
                self.resize();
            },200);
        });

        var isHorizontal = this.options.isHorizontal;//是否水平
        var startX;
        var startY;

        //触摸或点击事件
        function moveStart(e){
            if(!self.canMove){
                self.canMove = true;
                self.moveDistance = 0;
                if(e.type =="mousedown"){
                    startX = e.pageX;
                    startY = e.pageY;
                }
                else if(e.type == "touchstart"){
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                }
            }
        }

        function move(e){
            if(self.canMove){
                self.wrapper.style.transitionDuration = "0s";

                if(e.type == "mousemove"){
                    self.moveDistance = isHorizontal?(e.pageX - startX):(e.pageY - startY);
                }
                else if(e.type == "touchmove"){
                    self.moveDistance = isHorizontal?(e.touches[0].pageX - startX):(e.touches[0].pageY - startY);
                }
                self.wrapper.style.transform = "translate"+(isHorizontal?"X":"Y")+"("+(self.transFormDistance+self.moveDistance)+"px)";
                //阻止默认行为，防止因为用户选择了字符后再拖动（浏览器默认搜索选中的字符）造成的位移混乱
                e.preventDefault();
                e.returnValue = false;
            }
        }

        function moveEnd(){
            if(self.canMove){
                self.canMove = false;
                if(Math.abs(self.moveDistance)>=self.options.threshold){
                    if(self.moveDistance>0){
                        self.goto(self.index-1);
                    }
                    else{
                        self.goto(self.index+1);
                    }
                }
                else{
                    self.goto(self.index);
                }
            }
        }

        this.wrapper.addEventListener("mousedown",moveStart,false);
        this.wrapper.addEventListener("touchstart",moveStart,false);

        dom.addEventListener("mousemove",move,false);
        dom.addEventListener("touchmove",move,false);

        dom.addEventListener("mouseup",moveEnd,false);
        dom.addEventListener("touchend",moveEnd,false);

        var deltaScroll = 0;
        //鼠标滚轮事件
        function mouseWheel(e){
            e.delta = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
            e.preventDefault();
            e.stopPropagation();

            deltaScroll += e.delta;
            if(Math.abs(deltaScroll)>=options.wheelThreshold){
                self.goto(self.index+(deltaScroll>0?-1:1));
                deltaScroll = 0;

                if(options.auto){
                    //重置自动滚动
                    clearTimeout(self.autoTimer);
                    autoMove();
                }
            }
        }

        //支持滚动
        if(options.supportWheel){
            container.addEventListener("mousewheel",mouseWheel,false);
            container.addEventListener("DOMMouseScroll",mouseWheel,false);
        }

        function autoMove(){
            self.autoTimer = setInterval(function(){self.goto(++self.index);},options.autoInterval);
        }

        if(options.auto){
            autoMove();
        }

    }

    Swiper.prototype = {
        resize:function () {//根据容器尺寸设置item和wrapper尺寸
            var isHorizontal = this.options.isHorizontal;//是否水平
            var pageCount = this.pageCount;
            var size;//尺寸

            if(isHorizontal){//水平的
                size = this.container.clientWidth;
                this.wrapper.style.width = pageCount*size+"px";
                this.pages.forEach(function(e){
                    e.style.width  = size + "px";
                    e.style.height = "100%";
                    e.style.float  = "left";
                });
            }
            else{//垂直的
                size = this.container.clientHeight;
                this.wrapper.style.height = pageCount*size+"px";
                this.pages.forEach(function(e){
                    e.style.height = size + "px";
                    e.style.width = "100%";
                });
            }
            this.pageSize = size;
            this.goto(this.index,true);
        },
        goto:function(index,withOutAnimate){
            var isHorizontal = this.options.isHorizontal;
            var pageCount = this.pageCount;
            index = index>0?(index>pageCount?pageCount:index):1;
            var distance = -(index-1)*this.pageSize;

            if(withOutAnimate){
                this.wrapper.style.transitionDuration = "0s";
            }
            else{
                this.wrapper.style.transitionDuration = this.options.duration;
            }

            if(isHorizontal){
                this.wrapper.style.transform = "translateX("+distance+"px)"
            }
            else{
                this.wrapper.style.transform = "translateY("+distance+"px)"
            }
            this.index = index;
            this.transFormDistance = distance;
        },

    }

    if ( typeof module === "object" && typeof module.exports === "object" ){
        module.exports = Swiper;
    }
    else{
        win.Swiper = Swiper;
    }
}
)(window,document);