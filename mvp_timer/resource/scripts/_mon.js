var _mon = {};

_mon.time = [];
_mon.longpress_delay = 600;
_mon.longpress_timer;

_mon.dbclick_timer=[];
_mon.dbclick_id = -1;

_mon.nameTrim = function (name)
{
	return name.replace("(迷藏)", "").replace("(西門)", "").replace("(南門)", "")
}

_mon.init = function ()
{
	for (var i in monsort)
	{
		i=monsort[i];
		_mon.time[i] = false;
		$mon = $("<div/>",
			{
				'id' : "mon_" + i,
				"data-index" : i,
				"class" : "mon mon_" + i + " m_" + mons[i].img,
				"data-time" : mons[i].time,
				"data-count" : 9999,
				"title" : "LV." + mons[i].lv + " " + _mon.nameTrim(mons[i].name) +"/"+ mons[i].loc+ " ["+mons[i].race+"/"+ mons[i].attr +"/"+ mons[i].size +"] "
			}
			);
		$mon.html(
			"<div class='time_wrap'>"
			 + "<div class='cover'></div>"
			 + "<div class='btn_hide'></div>"
			 + "<div class='showing'></div>"
			 + "<div class='mark'></div>"
			 + (mons[i].label ? "<div class='label'>"+mons[i].label+"</div>" : '')
			 + "<img src='img/mon/" + mons[i].img + ".png?v=2'>"
			 + "<span class='time'></span>"
			 + "<span class='race'>" + mons[i].race + "</span>"
			 + "<span class='attr'>" + mons[i].attr + "</span>"
			 + "<span class='size'>" + mons[i].size + "</span>"
			 + "</div>"
			 + "<div class='name'>"
			 + "<a target='_blank' href='https://ro.fws.tw/db/monsters/info/" + mons[i].url + "'>"
			+_mon.nameTrim(mons[i].name)
			 + "</a>"
			 + "</div>"
			 + "<div class='loc'>" + mons[i].loc + "</div>");

		//怪物有暫存計時
		if (_cookie.get(i) != null)
		{
			_mon.time[i] = new Date();
			_mon.time[i].setTime(_cookie.get(i));
			$mon.addClass("count");
		}
		
		//控制隱藏
		if(_mon.isHide(i))$mon.addClass('hide');
		$mon.find(".btn_hide").click(function (e)
		{
			_mon.hideClick(e, $(this).closest(".mon").data("index"));
		}
		);

		//怪物: 事件監聽
		$mon.find(".cover").click(function (e)
		{
			_mon.click(e, $(this).closest(".mon").data("index"));
		}
		);
		$mon.on('touchstart', function (e)
		{
			_mon.touch(e, $(this).data("index"));
		}
		);
		$mon.on('touchmove', function (e)
		{
			clearTimeout(_mon.longpress_timer);
		}
		);
		$mon.on('touchend', function (e)
		{
			clearTimeout(_mon.longpress_timer)
		}
		);

		$mon.contextmenu(function (e)
		{
			clearTimeout(_mon.longpress_timer)
			_mon.setTimeDialog($(this).data("index"));
			e.preventDefault();
		}
		);

		//怪物分類
		if (mons[i].mvp)
		{
			$mon.addClass('mvp').appendTo($("#mvp"));
		}
		else
		{
			$mon.addClass('mini').appendTo($("#min"));
		}
		
		if(i.indexOf("_") > -1){
			$mon.insertAfter( $("#mon_"+i.split("_")[0]) );
		}
		

		//佇列: 事件監聽
		$qMon = $mon.clone();
		$qMon.click(function (e)
		{
			_mon.click(e, $(this).data("index"));
		}
		);
		$qMon.on('touchstart', function (e)
		{
			_mon.touch(e, $(this).data("index"))
		}
		);
		$qMon.on('touchmove', function (e)
		{
			clearTimeout(_mon.longpress_timer)
		}
		);
		$qMon.on('touchend', function (e)
		{
			clearTimeout(_mon.longpress_timer)
		}
		);
		$qMon.contextmenu(function (e)
		{
			clearTimeout(_mon.longpress_timer)
			_mon.setTimeDialog($(this).data("index"));
			e.preventDefault();
		}
		);
		$qMon.appendTo($("#queue .wrap"));
	}

}

_mon.touch = function (e, id)
{
	clearTimeout(_mon.longpress_timer);
	var mevent = e;
	_mon.longpress_timer = setTimeout(function ()
		{
			_mon.setTimeDialog(id);
			mevent.preventDefault();
		}, _mon.longpress_delay)
}

_mon.click = function (e, id)
{
	var time = $(".mon_" + id).attr("data-time");
	//單擊怪物
	if (!$(".mon_" + id).hasClass("count"))
	{
		if (_mon.time[id] == false)
		{
			_mon.setTime(id, time);
			$(".mon_" + id).addClass("count");
		}
	}
	else
	{
		var isShown = $(".mon_" + id).hasClass("show");
		//雙擊怪物
		if (_mon.dbclick_id != id)
		{
			_mon.dbclick_id = id;
			clearTimeout(_mon.dbclick_timer[id]);
			_mon.dbclick_timer[id] = setTimeout(function ()
				{
					_mon.dbclick_id = -1;
					if (isShown)
					{
						_mon.reset(id);
						_mon.setTime(id, time);
					}
				}, 400);
		}
		else if (_mon.dbclick_id == id)
		{
			clearTimeout(_mon.dbclick_timer[id]);
			$(".mon_" + id).addClass("reset");
			$(".mon_" + id).removeClass("count");
			_mon.dbclick_id = -1;
			
		}
	}
	e.preventDefault();
}

//控制隱藏
_mon.hideClick = function (e, id){
	$(".mon_" + id).toggleClass('hide');
	_mon.saveHide(id,$(".mon_" + id).hasClass('hide'));
}
_mon.isHide = function(id){
	var hidelist = _cookie.get('hide');
	if(hidelist){
		var arr=hidelist.toString().split(',');
		var index=-1;
		for(var i in arr){
			if(arr[i]==id){
				return true;
			}
		}
	}else{
		return false;
	}
}
_mon.saveHide = function(id,hideIt){
	if(id=="all"){
		if(hideIt){
			var arr=[];
			for(var i in mons){
				arr.push(i);
			}
			_cookie.set('hide',arr.join(','));
			eventGA('編輯顯示','hide','all');
		}else{
			_cookie.set('hide','');
			eventGA('編輯顯示','show','all');
		}
		return;
	}
	var save = _cookie.get('hide');
	
	if(save){
		var arr=save.toString().split(',');
		
		var index=-1;
		for(var i in arr){
			if(arr[i]==id){
				index=i;
			}
		}
		if(hideIt){
			if(index==-1)arr.push(id);
			eventGA('編輯顯示','hide',mons[id].name);
		}else{
			if(index!=-1)arr.splice(index,1);
			eventGA('編輯顯示','show',mons[id].name);
		}
		_cookie.set('hide',arr.join(','));
	}else{
		_cookie.set('hide',id);
		eventGA('編輯顯示','hide',mons[id].name);
	}
}

_mon.reset = function (i)
{
	_mon.time[i] = false;
	$(".mon_" + i).removeClass("last played ready count show reset");
	_cookie.del(i);
	$(".mon_" + i).find(".time").html("--:--:--");
	$(".mon_" + i).data("count", 9999);
}

_mon.ispop = false;
_mon.setTimeDialog = function (mid)
{
	if (!_mon.ispop)
	{
		_mon.ispop = true;
		if ($(window).width() > 500)
		{
			var txt;
			var time = $(".m_" + mid).attr("data-time");
			var person = prompt("輸入剩餘分鐘,或[時.分.秒]或[時,分,秒]", time);
			if (person == null || person == "")
			{
				alert("時間輸入錯誤");
				_mon.ispop = false;
			}
			else
			{
				_mon.setTime(mid, person);
				_mon.ispop = false;
			}
		}
		else
		{
			$.MessageBox(
			{
				input : true,
				message : "輸入剩餘分鐘,或[時.分.秒]或[時,分,秒]"
			}
			).done(function (data)
			{
				if (data == null || data == "")
				{
					alert("時間輸入錯誤");
					_mon.ispop = false;
				}
				else
				{
					_mon.setTime(mid, data);
					_mon.ispop = false;
				}
			}
			);
		}
	}
	//document.getElementById("demo").innerHTML = txt;
}

_mon.setTime = function (id, time)
{
	var mSec = 0;
	var mMin = 0;
	var mHour = 0;
	var arr_time = time.replace(/\,/g, ".").split(".");
	if (arr_time.length <= 3)
	{
		if (arr_time.length == 3)
		{
			mHour = parseTime(arr_time[0]);
			mMin = parseTime(arr_time[1]);
			mSec = parseTime(arr_time[2]);
		}
		else if (arr_time.length == 2)
		{
			mMin = parseTime(arr_time[0]);
			mSec = parseTime(arr_time[1]);
		}
		else if (arr_time.length == 1)
		{
			mMin = parseTime(arr_time[0]);
		}
		if (mSec + mMin + mSec == 0)
		{
			alert("時間輸入錯誤");
			return
		}
		_mon.reset(id);
		_mon.time[id] = new Date();
		_mon.time[id].setHours(_mon.time[id].getHours() + mHour);
		_mon.time[id].setMinutes(_mon.time[id].getMinutes() + mMin, _mon.time[id].getSeconds() + mSec, 0);
		_cookie.set(id, _mon.time[id].getTime());
	}
	else
	{
		alert("時間輸入錯誤");
	}
}
