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
        var i, e, j, c;
        cls = cls.match(/\S+/g) || [];
        if(!Array.isArray(ele)){
            ele = [ele];
        }
        for(i=0;i<ele.length;i++){
            e = ele[i];
            if(e.nodeType === 1){
                for(j=0;j<cls.length;j++){
                    c = cls[j];
                    if (!hasClass(e,c)) e.className += " "+c;
                }
            }
        }
    }

    function removeClass(ele,cls) {
        var i, e, j, c;
        cls = cls.match(/\S+/g) || [];
        if(!Array.isArray(ele)){
            ele = [ele];
        }
        for(i=0;i<ele.length;i++){
            e = ele[i];
            if(e.nodeType === 1){
                for(j=0;j<cls.length;j++){
                    c = cls[j];
                    var reg = new RegExp('(\\s|^)'+c+'(\\s|$)',"g");
                    e.className=e.className.replace(reg,' ');
                }
            }
        }
    }

    function getComputedStyle(elem){
        return elem.currentStyle?elem.currentStyle : window.getComputedStyle(elem,null);
    }


    //默认配置
    var SwiperDefault = {
        pageClass:         "s-page",      //默认页面类名
        wrapperClass:      "s-wrapper",   //默认wrapper类名
        pagination:        true,         //默认不显示分页
        isHorizontal:      true,          //默认方向 水平
        threshold:         50,            //翻页临界值,超过临界值触发翻页
        animationDuration: "0.5s",        //持续时间
        supportWheel:      true,          //支持鼠标滚轮翻页
        wheelThreshold:    2,             //鼠标滚动触发翻页所需次数
        auto:              false,         //是否自动滚动
        autoInterval:      5000,          //自动滚动时间间隔
        autoIncreasing:    true,          //是否递增自动滚动,false则递减
        loop:              true,          //是否循环滚动
        initPage:          1,             //初始化页面
    }

    function Swiper(target,options){
        var container,
            wrapper,
            pages,
            pager;//分页按钮

        var self = this;

        this.canMove =false;
        this.moveDistance = 0;
        this.pageSize;//每一页的宽度或者高度,取决于移动方向
        this.pageIndex = 1;//真实页面索引,循环模式时0和pageCount-1为两个重复页面（对应最后一页和第一页）;
        this.autoTimer = null;


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
        this.pageIndex = options.initPage;//页面索引

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
        wrapper.style.transitionDuration = this.options.animationDuration;
        pages = [].slice.call(wrapper.querySelectorAll("."+options.pageClass));

        var firstPage,lastPage;
        if(options.loop){//循环滚动
            firstPage = pages[0].cloneNode(true);
            lastPage = pages[pages.length-1].cloneNode(true);
            wrapper.insertBefore(lastPage,pages[0]);
            wrapper.insertBefore(firstPage,null);
            pages.unshift(lastPage);
            pages.push(firstPage);
        }

        addClass( container,"s-container-" + (options.isHorizontal?"horizontal":"vertical") );
        addClass( wrapper,"s-wrapper" );
        addClass( pages,"s-page");
        this.container = container;
        this.wrapper = wrapper;
        this.transFormDistance = 0;
        this.pages = pages;
        this.pageCount = pages.length;//页面总数，如果支持循环则包括在首尾添加的重复页面

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

                //处理循环模式到达两边重复页的情况
                if(self.pageIndex == 0){//在最前的最后一页
                    self.goto(self.pageCount-2,true);
                }
                else if(self.pageIndex == (self.pageCount-1)){//在最后的第一页
                    self.goto(1,true);
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
                        self.goto(self.pageIndex-1);
                    }
                    else{
                        self.goto(self.pageIndex+1);
                    }
                }
                else{
                    self.goto(self.pageIndex);
                }

                if(options.auto){
                    //重置自动滚动
                    clearTimeout(self.autoTimer);
                    autoMove();
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
                self.goto(self.pageIndex+(deltaScroll>0?-1:1));
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

        //自动播放
        function autoMove(){
            self.autoTimer = setInterval(
                function(){
                    self.goto(self.options.autoIncreasing?(++self.pageIndex):(--self.pageIndex));
                }
                ,options.autoInterval);
        }

        if(options.auto){
            autoMove();
        }

        var paginationHTML="";
        var truePageCount,i;
        //分页
        if(options.pagination){
            truePageCount = this.options.loop?this.pageCount-2:this.pageCount;
            for(i=0;i<truePageCount;i++){
                paginationHTML +="<span></span>"
            }
            var pageElem = document.createElement("div");
            addClass(pageElem,"s-pagination");
            pageElem.innerHTML = paginationHTML;
            this.pager = [].slice.call(pageElem.querySelectorAll("span"));
            this.container.insertBefore(pageElem,null);
            pageElem.addEventListener("click",function(e){
                var target = e.target;
                var index = self.pager.indexOf(e.target);
                if(target&&index>=0){
                    if(options.auto){
                        //重置自动滚动
                        clearTimeout(self.autoTimer);
                        autoMove();
                    }

                    //处理循环模式到达两边重复页的情况
                    if(self.pageIndex == 0){//在最前的最后一页
                        self.goto(self.pageCount-2,true);
                    }
                    else if(self.pageIndex == (self.pageCount-1)){//在最后的第一页
                        self.goto(1,true);
                    }

                    self.goto(index+1);
                }
            },false);
        }
        //修正大小
        this.resize();
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
            this.goto(this.pageIndex,true);//修正变动大小后的页面位置
        },
        goto:function(pageIndex,withOutAnimate){
            var trueIndex;//真实目标页面索引,比如循环时，在收尾添加重复的页面，第一页索引为2
            var isHorizontal = this.options.isHorizontal;
            var pageCount = this.pageCount;
            trueIndex = pageIndex+1;
            if(this.options.loop){//自动播放且循环的情况
                if(trueIndex == 0){//逆向经过首位的重复页
                    this.goto(pageCount-2,true);
                    this.goto(pageCount-3);
                    return;
                    //trueIndex = this.pageIndex;
                }
                else if(trueIndex == (pageCount+1)){//正向经过末位的重复页
                    this.goto(1,true);
                    this.goto(2);
                    return;
                    //trueIndex = this.pageIndex+2;
                }
            }
            else{//非循环的情况
                trueIndex = trueIndex>0?(trueIndex>pageCount?pageCount:trueIndex):1;
            }

            var distance = -(trueIndex-1)*this.pageSize;

            if(withOutAnimate){
                this.wrapper.style.transitionDuration = "0s";
            }
            else{
                this.wrapper.style.transitionDuration = this.options.animationDuration;
            }

            if(isHorizontal){
                this.wrapper.style.transform = "translateX("+distance+"px)"
            }
            else{
                this.wrapper.style.transform = "translateY("+distance+"px)"
            }
            var reDraw = this.wrapper.offsetHeight;//强制触发重绘
            this.pageIndex = trueIndex-1;

            var paginationIndex;
            //分页器
            if(this.options.pagination){
                paginationIndex = this.pageIndex;

                //处理循环模式重复页的情况
                if(paginationIndex == 0){
                    paginationIndex = this.pageCount-2;
                }
                else if(paginationIndex == (this.pageCount-1)){
                    paginationIndex = 1;
                }

                //根据paginationIndex添加active类
                removeClass(this.pager,"active");
                addClass(this.pager[paginationIndex-1],"active");
            }

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