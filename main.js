var threshold = 50,//滑动超过阈值之后触发换页
	viewHeight,//内容视口section高度
	currentPage,
	activePage,
	scroll,
	start,
	startX = 0,
	startY = 0,
	moveDistanceX = 0,
	moveDistanceY = 0,
	isEnd = 1;

$(function(){
	//加载第一个页面
	currentPage = $(".main-page")[0];
	currentPage.classList.add("z-current");
	viewHeight=$('.main').height();
	
	//$(".main").on('mousedown mouseup mousemove touchstart touchend touchmove',function(e){
	//	e.preventDefault();
	//});
	
	$(".main").on("mousedown touchstart",function(e){
		if(isEnd){
			if(e.type =="mousedown"){
				start = true;
				startX = e.pageX;
				startY = e.pageY; 
				moveDistanceX = 0;
				moveDistanceY = 0;
			}
			else if(e.type == "touchstart"){
				start = true;
				startX = e.originalEvent.touches[0].pageX;
				startY = e.originalEvent.touches[0].pageY;
				moveDistanceX = 0;
				moveDistanceY = 0
			}
		}
	});
	
	$(".main").on('mousemove touchmove',function(e){
		if(start){
			if(e.type == "mousemove"){
				moveDistanceX = e.pageX - startX;
				moveDistanceY = e.pageY - startY;
				verticalMove();
			}
			else if(e.type == "touchmove"){
				moveDistanceX = e.originalEvent.touches[0].pageX - startX; 
				moveDistanceY = e.originalEvent.touches[0].pageY - startY;
				verticalMove();
			}
		}
	});
	
	$(".main").on('mouseup touchend',function(e){
		if(start&&moveDistanceY){
			currentPage.style.webkitTransition = "-webkit-transform 0.4s ease-out"; 
		    activePage.style.webkitTransition = "-webkit-transform 0.4s ease-out"; 
		    currentPage.style.mozTransition = "-moz-transform 0.4s ease-out";
		    activePage.style.mozTransition = "-moz-transform 0.4s ease-out";
		    currentPage.style.transition = "transform 0.4s ease-out";
		    activePage.style.transition = "transform 0.4s ease-out";
			isEnd = 0;
			if(Math.abs(moveDistanceY)>threshold){//发生翻页
				activePage.style.webkitTransform = "translateY(0px)";
			    activePage.style.mozTransform = "translateY(0px)";
			    activePage.style.transform = "translateY(0px)";
				setTimeout(function(){
					activePage.classList.remove("z-active");
					currentPage.classList.remove("z-current");
					activePage.classList.add("z-current");
					currentPage = $(".z-current")[0];
					isEnd = 1;
					},500);
			}
			else{//不发生翻页
				if(moveDistanceY>0){//向下
					activePage.style.webkitTransform = "translateY(-100%)";
				    activePage.style.mozTransform = "translateY(-100%)";
				    activePage.style.transform = "translateY(-100%)";
				}
				else{//向上
					activePage.style.webkitTransform = "translateY(100%)";
				    activePage.style.mozTransform = "translateY(100%)";
				    activePage.style.transform = "translateY(100%)";
				}
				setTimeout(function(){
					activePage.style.webkitTransform = "none";
					activePage.style.mozTransform = "none";
					activePage.style.transition = "none";
					activePage.classList.remove("z-active");
					activePage.style.webkitTransform = "translateY(0px)";
				    activePage.style.mozTransform = "translateY(0px)";
				    activePage.style.transform = "translateY(0px)";
				    isEnd = 1;
				},500);
			}
		}
		start = false;
	});
});
function verticalMove() {
	if(moveDistanceY > 0){//上一页
		if(activePage){
			$(".z-active").removeClass("z-active");
		}
		if(currentPage.previousElementSibling && currentPage.previousElementSibling.classList.contains("main-page")){
			activePage = currentPage.previousElementSibling;
		}
		else{
			activePage = $('.main-page:last')[0];
		}
		if(activePage){
			showAnimation();
			activePage.classList.add("z-active");
			activePage.style.webkitTransition = "none";
			activePage.style.webkitTransform = "translateY(" +( moveDistanceY - viewHeight ) + "px)";
			activePage.style.mozTransition = "none";
			activePage.style.mozTransform = "translateY(" + ( moveDistanceY - viewHeight ) + "px)";
			activePage.style.transition = "none";
			activePage.style.transform = "translateY(" + ( moveDistanceY - viewHeight ) + "px)";
		}
	}
	else if(moveDistanceY < 0){//下一页
		if(activePage){
			$(".z-active").removeClass("z-active");
		}
		if(currentPage.nextElementSibling && currentPage.nextElementSibling.classList.contains("main-page")){
			activePage = currentPage.nextElementSibling;
		}
		else{
			activePage = $('.main-page').get(0);
		}
		if(activePage){
			showAnimation();
			activePage.classList.add("z-active");
			activePage.style.webkitTransition = "none";
			activePage.style.webkitTransform = "translateY(" + (viewHeight+moveDistanceY) + "px)";
			activePage.style.mozTransition = "none";
			activePage.style.mozTransform = "translateY(" + (viewHeight+moveDistanceY) + "px)";
			activePage.style.transition = "none";
			activePage.style.transform = "translateY(" + (viewHeight+moveDistanceY) + "px)";
		}
	}
};
function showAnimation(){
	$(".element-container",activePage).each(function(i,e){
		var html = $(e).html();
		$(e).html("");
		$(e).html(html);
	});
};
