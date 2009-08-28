
var mouse_x = 0;
var mouse_y = 0;
var distance_to_right_edge = 0;
var distance_to_bottom = 0;
var contextmenu = null;

//addLoadEvent(onstart);

function rightClickSpan(id, S3DB_UID) {
  if(!document.getElementById(id)){
	//createSpan(id);
  }
  else {
	createMenu(id, S3DB_UID);
	sp = document.getElementById(id);
	//sp.setAttribute("oncontextmenu","show_contextmenu(event, '"+id+"');return false;");
	sp.setAttribute("onClick","show_contextmenu(event, '"+id+"');return false;");
	sp.setAttribute("onBlur","hide_contextmenu('"+id+"');return false;");
  }
  
  contextmenu = document.getElementById('thecontextmenu_'+id);
  addGenericEvent(document,'mousemove',mousemove);
  //addGenericEvent(document,'click',hide_contextmenu);
  
}

function createSpan(id) {
	createMenu(id);
	sp = document.createElement('span');
	sp.id=id;
	sp.setAttribute("oncontextmenu","show_contextmenu(event, '"+id+"');return false;");
	sp.setAttribute("style","background-color:green;border:solid 1px #ccc;padding:3px;");
	sp.innerHTML = 'Y';
	document.body.appendChild(sp);

}

function createMenu(id, S3DB_UID) {
	var	ul = document.createElement('ul');
	
	ul.setAttribute("class","contextmenu");
	ul.id="thecontextmenu_"+id;

	opts = ['y','s','n','-', 'Y','S','N'];
	colors = ['green','yellow','red','silver', 'green','yellow','red'];

	for (var i=0; i<7; i++) {
		if(i==0){
			var li = document.createElement('li');
			li.setAttribute("class","title");
			li.innerHTML = 'Local';
			ul.appendChild(li);
		}
		else if (i==4) {
			var li = document.createElement('li');
			li.setAttribute("class","title")
			li.innerHTML = 'Global';
			ul.appendChild(li);
		}
		
		var li = document.createElement('li');
		li.setAttribute("onClick", "permissionUpdated('"+id+"', '"+opts[i]+"', '"+S3DB_UID+"'); document.getElementById('"+id+"').innerHTML = '&nbsp;"+opts[i]+"&nbsp;'; document.getElementById('"+id+"').style.background='"+colors[i]+"'; hide_contextmenu('"+id+"')");
		li.setAttribute("onmouseover", "context_menuitem_highlight(this)");
		li.setAttribute("onmouseout", "context_menuitem_unhighlight(this)");
		li.innerHTML = opts[i];
		ul.appendChild(li);
	}
	document.body.appendChild(ul);	 
}
function context_menuitem_highlight(element, color) {
  element.className = 'highlight';
}

function context_menuitem_unhighlight(element) {
  element.className = '';
}

function show_contextmenu(event, id) {

  get_page_boundaries();
  var contextmenu = document.getElementById('thecontextmenu_'+id);
  contextmenu.style.left = mouse_x+"px";
  contextmenu.style.top = mouse_y+"px";
  contextmenu.style.visibility = "visible";
  
  
  // adjust menu if near window edge
  if (distance_to_right_edge < contextmenu.offsetWidth)
    contextmenu.style.left = 2+mouse_x - contextmenu.offsetWidth+"px";  // The 2+ is not some dumb kludge - 
  if (distance_to_bottom < contextmenu.offsetHeight)                    // it places the menu just under the pointer,
    contextmenu.style.top = 2+mouse_y - contextmenu.offsetHeight+"px";  // instead of just outside
  
  try {
    window.getSelection().collapseToStart();  // try to compensate for tendency to treat right-clicking as text selection
 } catch (e) {} // do nothing
  
  // prevent the event from bubbling up and causing the regular browser context menu to appear.
  event.cancelBubble = true;
	if (event.stopPropagation) event.stopPropagation(); 
  if (event.preventDefault) event.preventDefault();
  
  return false;
}

function hide_contextmenu(id) {
  var contextmenu = document.getElementById('thecontextmenu_'+id);
  contextmenu.style.visibility = "hidden";
}


function addLoadEvent(func) {
  if (window.addEventListener)
    window.addEventListener("load",func,false);
  else if (document.addEventListener)
    document.addEventListener("load",func,false);
  else if (window.attachEvent)
    window.attachEvent("onload",func);
  else if (document.attachEvent)
    document.attachEvent("onload",func);
}

function addGenericEvent(source, trigger, func) {
  if (source.addEventListener)
    source.addEventListener(trigger,func,false);
  else if (source.attachEvent)
    source.attachEvent("on"+trigger,func);
}

function window_x() {
  if (window.screenX)
    return window.screenX
  else if (window.screenLeft)
    return window.screenLeft;
}

function window_y() {
  if (window.screenY)
    return window.screenY
  else if (window.screenTop)
    return window.screenTop;
}

function mousemove(e) { 
  if (e && e.clientX && typeof(window.scrollY) == 'number') { // Moz
    mouse_x = e.clientX + window.scrollX;
    mouse_y = e.clientY + window.scrollY;
    event_target = e.target;
  }
  else if (window.event) { // IE
    if (document.documentElement)   // Explorer 6 Strict
    {
      mouse_x = window.event.clientX + document.documentElement.scrollLeft - 4;
      mouse_y = window.event.clientY + document.documentElement.scrollTop - 4;
    }
    else if (document.body) // all other Explorers
    {
      mouse_x=window.event.clientX+document.body.scrollLeft-4;
      mouse_y=window.event.clientY+document.body.scrollTop-4;
    }
 
    mouse_window_x = window.event.clientX;
    mouse_window_y = window.event.clientY;
  }
}

function get_page_boundaries()
{
  if (window.innerWidth) {
    distance_to_right_edge = window.innerWidth-(mouse_x - window.scrollX)
    distance_to_bottom = window.innerHeight-(mouse_y - window.scrollY);
    
    //alert(window.innerHeight+' '+mouse_y);
  } else if (document.body.clientWidth) {
    distance_to_right_edge = document.body.clientWidth-mouse_x;
    distance_to_bottom = document.body.clientHeight-mouse_y;
  }
}




												 