window.purpose = new Purpose({ apiKey: "globalcitizen-3f3cf72f7154eecff22152fd317f06c5", url: "//api.movements.purpose.com/en" }).attach().then(
	function(response){ 
		response.loaded.then( function(response){ 
			
			j('.prps-steplist select').css({
				"padding":"0 0 0 22px",
				"height":"40px",
				"line-height":"40px",
				"color":"#000000",
				"background-image": "url(data:image/gif;base64,R0lGODlhNAAoANUAAP8AAP92dv/j4/8tLf+xsf+Zmf9SUv8KCv/T0/////9CQv/5+f+Pj//ExP8YGP+IiP9WVv/19f+np/8EBP+Hh/9mZv+6uv/u7v83N/+iov8iIv9KSv/b2//r6/+hof+UlP+3t/8PD/8AAP+rq//////Hx/+MjP8ICP8GBv8MDP+zs/+Rkf/Fxf+9vQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAHAP8ALAAAAAA0ACgAAAaEQIBwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum89o74bRzEDGhARFiRolJONDKRFAouISE2QhCAkVRgcgCR6CZQ4cCQZEBy0JBWkaAgsKQikNCR9pQgMdERghnyaiQxgRF4UPq0QKCQlsskQGFo24vb6/wMHCw8TFxsfIyV1BADs=)",
				"cursor":"pointer",
				"border-radius":" 0",
				"background-position":"100% center",
				"background-repeat":" no-repeat",
				"border-style":" solid",
				"border-width":" 1px",
				"border-color":" #cccccc",
				"margin":"0 0 13px 0",
				"width":"100%",
				"box-sizing":"content-box"
			});
			j('.prps-steplist select')[0].style["-webkit-appearance"] = "none";
			j('.prps-steplist select')[0].style["-webkit-border-radius"] = "0px";	
			j('.prps-steplist select option[value=us]').prop('selected',true)
		} ) 
	}
);		