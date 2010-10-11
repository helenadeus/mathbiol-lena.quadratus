//quadrado.js is an exercise in ubilding an interface that displays only the permission that the user that has been chosen has on the project that has been selected
var ClickColor = "#000000";
var MovColor = "#33FF66";
var MoffColor = "blue";

function trigger_s3db() {
	s3db = {};
	s3db.url = document.getElementById('url').value;
	if(typeof(s3db.url)=='undefined' || s3db.url=='other'){
		s3db.url = document.getElementById('url_other').value;
		if (!s3db.url.match(/\/$/)) {
			s3db.url+='/';
			document.getElementById('url_other').value = s3db.url;
		}
	}

	s3db.key = document.getElementById('key').value;
	s3db.core = {
			entities : {U:'user',P:'project',C:'collection',R:'rule',I:'item',S:'statement'},
			ids : {U:'user_id',P:'project_id',C:'collection_id',R:'rule_id',I:'item_id',S:'statement_id'},
			inherits : {P:["C","R"],C:["I","R"],R:"S",I:"S", "S":[]},
			prev : {P:["U"], R:["P", "C", "I", "C"],C:["P"],I:["C"],S:["R", "I", "I"]},
			prev_id : {P:["user_id"], R:["project_id", "subject_id", "verb_id", "object_id"],C:["project_id"],I:["collection_id"],S:["rule_id","item_id","value"]},
			boxes : {U:'users',P:'projects',C:'collections',R:'rules',I:'items',S:'statements'},
			labels : {U:['username'],P:['name'],C:['name'],R:['subject', 'verb', 'object'],I:['notes'],S:['value']},
			uid_total_threadsLong :	{'P':1,'C':1,'R':4,'I':1,'S':6},
			uid_total_threadsShort :  {'P':1,'C':1,'R':3,'I':1,'S':4}
	};
	
	if(s3db.key==='' || s3db.key==='type your key'){
		
		//call apilogin first
		//authority
		s3db.username = document.getElementById('username').value;
		s3db.password = document.getElementById('password').value;
		s3db.authority = document.getElementById('authority').value;
		var url2call = s3db.url+'apilogin.php?format=json&authority='+s3db.authority+'&username='+s3db.username+'&password='+s3db.password;
		s3db.key_call =  url2call;
		
		$.getJSON(url2call+'&callback=?', function (data) {
			if (typeof(data[0].key_id)!='undefined' && data[0].key_id!='') {
				s3db.key = data[0].key_id;
				//document.getElementById('key').value = s3db.key;
				hide('login');display('login_text');display('legend');display('square');
				findUserId();
			
			}
			else {
				alert("You were not authenticated. Please try again");
			}
			
		});

	}
	else {
		//start by checking if the key is valid
		var url2call = s3db.url+'keyCheck.php?key='+s3db.key;
		$.getJSON(url2call+'&format=json&callback=?', function (ans) {
			if(ans[0].error_code=='0'){
				hide('login');display('login_text');display('square');
				drawCore();
				findUserId();
			}
			else {
				document.getElementById("message").innerHTML = "Key is not valid";
				document.getElementById("message").style.color = "red";

			}
		})
		//s3dbcall(url2call, 'checkKeyValid(ans)');
	
	}
	return false;
}

function checkKeyValid(ans) {
	if(ans[0].error_code=='0'){
		hide('login');display('login_text');display('square');
		drawCore();
		findUserId();
	}
	else {
		document.getElementById("message").innerHTML = "Key is not valid";
		document.getElementById("message").style.color = "red";

	}
}

function clickS3DB(E, I, user_id) {
//This is the new clickS3DB; the previous one has a few housekeeping features that needed to be recovered
	if(typeof(user_id)=='undefined') { var user_id = s3db.activeU.ind; }
	var uid = E+I;
	
	//Because explainPermission splices core.prev, recover it every time
	s3db.core.prev = {P:["U"], R:["P", "C", "I", "C"],C:["P"],I:["C"],S:["R", "I", "I"]};
	s3db.core.prev_id = {P:["user_id"], R:["project_id", "subject_id", "verb_id", "object_id"],C:["project_id"],I:["collection_id"],S:["rule_id","item_id","value"]};

	//Define the active state - for backward compatibility
	var s3_id = s3db.core.ids[E];
	s3db["active"]=uid;
	s3db["activeE"]=E;
	s3db["activeID"]=I;
	s3db["active"+E]=[];
	s3db["active"+E].ind = document.getElementById(E+I).getAttribute("active_ind")*1;
	s3db["active"+E][s3_id] = I;

	//start by explaining why user has permission that he has on clicked resource
	explainPermission(E, I);

	//remove all forward children left from the previous uid; this includes removing children of children
	intface.removeChildren(E);
	
	//Dsiplay loading inside the square of the children
	intface.loadingChildren(E);
	
	//now proceed to finding the s3db entities that inherit from this one. Start by filling it upu with what U1 sees, then limit permissions
	
	if(s3db.user_id != s3db.activeU.ind){
	//s3db.user_id queyr has to be performed first and those children used on the intface
		intface.children.thread = 0;
		intface.children.threadMax = s3db.core.inherits[E].length;
		UID.compareChildren(uid, s3db.activeU.ind);
	
	}
	else {
		intface.children.thread = 0;
		intface.children.threadMax = s3db.core.inherits[E].length;
		//clear the box for the children coming 
		
		UID.children(uid, s3db.user_id, "intface.children");	
	}
	
	//entertain the users - this must point to the children
	//loading(s3db.core.boxes[E], s3db.core.ids[E]+"_loading");
	//add a line to add new user to the entity
	$('#new_user').html('');
	$('#new_user').append(
		$(document.createElement("a")).attr('href', '#').html('Add a new user to selected '+s3db.core.entities[E]).click(
		function (event, E, I, user_id) {
			
			$('#new_user').append(
			$(document.createElement('div')).attr('id', 'error_message').html('Please input here the UID of the user you wish to add:'))
				.append(		
				$(document.createElement('input')).attr('type','text').attr('id','new_user_id'))
				.append(
					$(document.createElement('input')).attr('type','button').attr('value','Go!').click(
						function (E, I, user_id) {
							if($('#new_user_id').val()!==""){
								s3db.newUserID = $('#new_user_id').val();
								var activeUID = s3db["active"];
								var entityUID_id = s3db.core.ids[s3db["activeE"]];
								//is provided user a valid user_id? 
								//var s3qlC = 'insert(U|'+activeUID+','+$('#new_user_id').val())
								var validateU = s3db.url+'URI.php?key='+s3db.key+'&uid='+s3db.newUserID;
								
								$.getJSON(validateU+'&format=json&callback=?',
										function (ans) {
											if(typeof(ans[0].error_code)!=='undefined'){
												$('#error_message').attr('style', 'color:red').html(ans[0].message);
											}
											else {
												var entityName_id = s3db.core.ids[s3db["activeE"]];
												
												s3db.U[s3db.newUserID] = ans[0];
												var writeU = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><insert>user</insert><where><user_id>'+s3db.newUserID+'</user_id><'+entityName_id+'>'+s3db["activeID"]+'</'+entityName_id+'></where></S3QL>';
												$.getJSON(writeU+'&format=json&callback=?', 
													function (ans) {
														if(ans[0].error_code===0){
															$('#user_id').append('<option value="'+s3db.newUserID+'">'+s3db.U[s3db.newUserID].account_uname+' ('+s3db.newUserID+')</option>');	
															$('#error_message').attr('style', 'color:green').html("New user added to Users");

														}
													}	
												
												);
											}
										}
								);
								
							}
						}
					)
				)
			}
		)		
	);

}

function trimS3DB(s3db_entity, params1, params2){
	//more than 1 params var means a union rather than an intersection
	var mem_name = memory_varname(s3db_entity);
	var facename = mem_name.replace('.U[s3db.activeU.ind]','');
	
	var holder = s3db.core.boxes[s3db_entity];
	var s3_id = s3db.core.ids[s3db_entity];
	
	

	
	if (eval(mem_name+"."+s3db_entity)!=""){
		var complete_set =eval(mem_name+"."+s3db_entity);
		
		if(typeof (complete_set)!='undefined')//in case user clicks coll before rules appear
		{
		
		//before trimming, recover the original setup
		if(document.getElementById('rules').childNodes.length!=complete_set.length){
			display_box(complete_set, s3db_entity);
		}
		
		//extract all entity ids that match the query
		var listed = [];
		for (var i=0, il=complete_set.length; i<il; i++) {
			var toRemove = true;
		
			if(typeof(params1)!='undefined'){
				
				for (var par_name in params1) {
					if(complete_set[i][par_name]==params1[par_name]){
					listed.push(complete_set[i][s3_id]);
					var toRemove  =false;
					}
				}
			}
			if(typeof(params2)!='undefined'){
				
				for (var par_name in params2) {
					if(complete_set[i][par_name]==params2[par_name]){
					listed.push(complete_set[i][s3_id]);
					var toRemove  =false;
					}
				}
			}
		//Now remove the elements ids that are not in the toUnyte list
		if(toRemove){
			remove_element(s3db_entity+complete_set[i][s3_id]);
		}
		}
		
		
		
		//Finally, remove by id those elements (divs) that do not fit the list
	   	
		}
	}
	return listed;
}

function findS3DB(user_key, s3db_entity, params) {

	if(typeof(user_key)=='undefined')
		{
		user_key = s3db.key;
		}
	var s3db_element = s3db.core.entities[s3db_entity];

	if (params) {
	var where = "<where>"; //where will be build from input argummetns at s3db_entity	
		for (var x in params) {
			where +=	"<"+x+">"+params[x]+"</"+x+">";
		}
	where += "</where>";
	}
	else {
		var where = "";
	}
	//memory
	//build and eval the name of the varible that will hold information on this entity
	//display loading
	loading(s3db.core.boxes[s3db_entity], s3db.core.ids[s3db_entity]+"_loading");

	var varname = memory_varname(s3db_entity);
	var facename = varname.replace(".U[s3db.activeU.ind]","");
	
	
	//facename is the memory var for the entities on the interface (eqivalent to U1); before comparing with U2, facename must exist in memory
	
	if(eval("typeof ("+facename+"."+s3db_entity+")")=='undefined'){
		
		var url2call = s3db.url+"S3QL.php?key="+s3db.key+"&query=<S3QL><from>"+s3db_element+"</from>"+where+"</S3QL>";
		//when the entities are not already in store (because U1 has not requested), they must be queried first with the credentials of U1
		if(s3db.activeU.user_id!=s3db.user_id){
			for (var i in s3db.U) {
			//for (var i=0; i<s3db.U.length; i++) {
				if(s3db.U[i].user_id==s3db.user_id){
				var ownername = varname.replace(".U[s3db.activeU.ind]",".U["+i+"]");
				var owner_ind = i;
				}
			}
		//one call to retrieve the data as U1 sees it; one call to retrieve the data as U1 sees it
		
		var url2call_U2 = s3db.url+"S3QL.php?key="+user_key+"&query=<S3QL><from>"+s3db_element+"</from>"+where+"</S3QL>";
		s3db.U[owner_ind][s3db_element+'_call'] = url2call;
		s3db.U[s3db.activeU.ind][s3db_element+'_call']=url2call_U2;
		//s3dbcall(url2call, 'saveS3DB(ans, "'+s3db_entity+'", "'+s3db.user_id+'");s3dbcall(s3db.U['+s3db.activeU.ind+'].'+s3db_element+'_call, \'saveS3DB(ans, "'+s3db_entity+'");\')');
		s3dbcall(url2call, 'saveAndMakeAnotherCall(ans, "'+s3db_entity+'","'+s3db.user_id+'",s3db.U['+s3db.activeU.ind+'].'+s3db_element+'_call)');
		}
		else {
			//just one simple query and display
			s3db.U[s3db.activeU.ind][s3db_element+'_call']=url2call;
			s3dbcall(url2call, 'saveS3DB(ans, "'+s3db_entity+'")');

		}
		
									
		
	}
	else {
		//once data is saved, we should return to this portion and find the resource for the active user (U2)
		
		
		if(eval("typeof("+varname+"."+s3db_entity+")")=='undefined'){
		var url2call = s3db.url+"S3QL.php?key="+user_key+"&query=<S3QL><from>"+s3db_element+"</from>"+where+"</S3QL>";
		s3db.U[s3db.activeU.ind][s3db_element+"_call"] = url2call; 
			
			//once it's found, save it
			s3dbcall(url2call, varname+'.'+s3db_entity+'=ans;saveS3DB(ans, "'+s3db_entity+'")');	
			
			
		}
		else {
			//information already exists, no need for saving. 
			//if the box of this element is empty, then the next step will be to fill it; otherwise, compare and adapt the data in the boxes with the data that was requested
			eval("data="+varname+"."+s3db_entity);
			if(document.getElementById(s3db.core.boxes[s3db_entity]).childNodes.length==0 || s3db.user_id==s3db.activeU.user_id || s3db_entity=="S"){
			display_box(data, s3db_entity);
			}
			else {
			//display the whole dataset, then compare
			compareS3DB(data, s3db_entity);	
			}
		}
	}
	
}

function saveAndMakeAnotherCall(ans,s3db_entity, user_id, another_call) {
	saveS3DB(ans, s3db_entity, user_id);
	s3dbcall(another_call, 'saveS3DB(ans, "'+s3db_entity+'")');
}


function saveS3DB(ans, s3db_entity, user_id) {

	//when user is not the same as user logging in, save it as part of that user
	s3db_id = s3db.core.ids[s3db_entity];

	//save the data in the root level, then make it be inherited by the structure data
	for (var i=0, il=ans.length; i<il; i++) {
		var uid =  s3db_entity+ans[i][s3db_id];
		s3db.U[s3db.activeU.ind][uid] = ans[i];

		if(s3db.activeU.user_id==s3db.user_id || user_id==s3db.user_id){
		s3db[uid] = ans[i];
		}
	}
	
	//where should the data be saved?
	if(typeof (user_id)=='undefined'){
		var user_id = s3db.activeU.user_id;
		var varname = memory_varname(s3db_entity);
		
			
	}
	else {
		//find the user requesting the data to be save
		for (var i=0, il=s3db.U.length; i<il; i++) {
			if(s3db.U[i].user_id==user_id){
				tmpInd = i;
			}
		}
		if(typeof(tmpInd)!='undefined'){
			var	varname = 	memory_varname(s3db_entity).replace(".U[s3db.activeU.ind]",".U["+tmpInd+"]");
			
		}
		else {
			var varname = memory_varname(s3db_entity);
		}
	
	}
	var facename = varname.replace('.U[s3db.activeU.ind]','');
	


	if(user_id==s3db.user_id || s3db.activeU.user_id==s3db.user_id){
		//when user_id is the same as the parent_id, save it in both in mainstream (for interface) and user specifiec
		//save it
		eval(varname+"."+s3db_entity+"=ans;");
		eval(facename+"."+s3db_entity+"=ans;");
	
		//now that data has been saved, proceed to filling the boxes and comparing the data in the boxes with the newly found data (in case U2 is the activeU)
		display_box(ans, s3db_entity);
		
		
	}	
	else {
		//data for active user still needs to be found
		//indexes of projecs may be different, for example if U2 can only see 2 projects, but U1 can see 5, they will not necesarily have indexes 1 and 2
		//at the same time, we do not want to have 'undefined' parent when trying to retrieve the children
		complete_set = eval(facename+"."+s3db_entity);
		var data=[];
		for (var i=0, il=ans.length; i<il; i++) {
			
			if(typeof(complete_set)!='undefined'){
				for (var j=0, jl=complete_set.length; j<jl; j++) {
					if(typeof(data[j])=='undefined'){ data[j] = []; }
					if(ans[i][s3db_id]==complete_set[j][s3db_id]){
						data[j] = ans[i];
						
					}

				}
			}
		}
		if(eval('typeof('+varname+')=="undefined"')) {eval(varname+'=[]');}
		eval(varname+"."+s3db_entity+'=data');
		//findS3DB(s3db.U[s3db.activeU.ind].key, s3db_entity, params);
		//and once it is displayed, find it for this user and compare it

		compareS3DB(data, s3db_entity);	
	}

	
				
}

function compareS3DB(newData, s3db_entity) {
	//at this point, a box for this entity has been filled; therefore, new incoming data needs to be compared against data in teh boxes, and the latter adapted accordingly
	//remove loading
	remove_element(s3db.core.ids[s3db_entity]+"_loading");

	
	var s3_id  = s3db.core.ids[s3db_entity];
	var varname = memory_varname(s3db_entity);
	var facename = varname.replace(".U[s3db.activeU.ind]","");
	//these 3 share indices; same with the following 3, they are simply the vector extracted from the array
	box_ids = extract(eval(facename+"."+s3db_entity), s3_id);
	box_permission = extract(eval(facename+"."+s3db_entity), 'effective_permission');
	box_assigned = extract(eval(facename+"."+s3db_entity), 'assigned_permission');
	
	new_ids = extract(newData, s3_id);
	new_permission = extract(newData, 'effective_permission');
	new_assigned = extract(newData, 'assigned_permission');
	
	

	for (var i=0, il=box_ids.length; i<il; i++) {
			//saveS3DB has rearranged ids on the newData such that indexes mathc with interface data 
			//var new_ind = find(new_ids, box_ids[i]);//find the index of the current box id in the retrieved ids
				if(typeof(newData[i])!='undefined' && typeof(newData[i].effective_permission)!='undefined') {
				var sl = newData[i].effective_permission.length;
				var al = newData[i].assigned_permission.length;
				}
				else {
				var sl = box_permission[i].length;
				var al = box_assigned[i].length;
				}
					
					// "assigned" permissions
					for (var a=0; a<al; a++) {//al is the size of the state
						span_id = s3db_entity+box_ids[i]+'_assigned_'+a;
						var span = document.getElementById(span_id);
						if(typeof(newData[i])!='undefined' && typeof(newData[i].assigned_permission)!='undefined'){
						var qi =  newData[i].assigned_permission[a];
						}
						else {
						var qi = "-";	
						}
						if(span){
							color_permission_square(span, qi);
						}
						else {
								var span = document.createElement('span');
								span.id = s3db_entity+newData[i][s3_id];
								color_permission_square(span, qi);
								var tmp = document.getElementById(s3db_entity+box_ids[i]);
								if(tmp){
								tmp.appendChild(span);
								}
								else {
									//The entity uid box needs to be created first
									var hold = s3db.core.boxes[s3db_entity];
									opt = document.createElement('div');
									opt.id = s3db_entity+box_ids[i];
									document.getElementById(hold).appendChild(opt);
									opt.setAttribute('onMouseOver', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MovColor+'"}');
									opt.setAttribute('onClick', "clickS3DB('"+s3db_entity+"', '"+box_ids[i]+"', '"+s3db.activeU.ind+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
									opt.setAttribute('onMouseOut', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MoffColor+'"}');
									opt.appendChild(span);
									//console.log('something missing?');
								}
								

						}
						
						//Testing right click; only if this span belongs to a user that is not the same as s3db.user_id
						if(s3db.activeU.user_id!=s3db.user_id){
							rightClickSpan(span.id, opt.id);
						}
					}

					//effective permissions
					for (var s=0; s<sl; s++) {//sl is the size of the state
							//now find the state - or create it - thta reflects this user's permissions 
						span_id = s3db_entity+box_ids[i]+'_perm_'+s;
						var span = document.getElementById(span_id);
						if(typeof(newData[i])!='undefined' && typeof(newData[i].assigned_permission)!='undefined'){
						var pi =  newData[i].effective_permission[s];
						}
						else {
						var pi = "n";	
						}
						if(span){
							color_permission_square(span, pi);
						}
						else {
								var span = document.createElement('span');
								span.id = s3db_entity+newData[i][s3_id];
								color_permission_square(span, pi);
								var tmp = document.getElementById(s3db_entity+box_ids[i]);
								if(tmp && typeof(tmp)!='undefined'){
								tmp.appendChild(span);
								}

						}
					}

				
			}


}


function explainPermission(s3db_entity, s3db_clicked_id) {


	//save for later reference
	if (typeof(s3db.U[s3db.activeU.ind].pl)=='undefined') {
	s3db.U[s3db.activeU.ind].pl = {};	
	}
	
	if(typeof(s3db.U[s3db.activeU.ind].pl[s3db_entity+s3db_clicked_id])=='undefined'){
	
		var uid=s3db_entity+s3db_clicked_id;
		next_action = "Permission.parents('"+uid+"')";
		//next_action = 'Permission.parents("'+uid+'")';
		UID.call(uid,s3db.activeU.ind, next_action); 
		//next_action = 'Permission.parents("'+uid+'")';
		//uid_call(uid, s3db.activeU.ind, next_action);
		//if(typeof (s3db.U[s3db.activeU.ind][uid])=='undefined'){
		//uid_call(uid, next_action);
		//}
		//else {
		//	if(s3db.activeU.ind!=s3db.user_id){
		//		s3db.U[s3db.activeU.ind][uid] = copy_parms(s3db[uid]);
		//	}
			
		//Permission.parents(uid);	//Permission.parents should throws us right back at explainPermission once it is done
		//}
		//UID.call(uid, s3db.activeU.ind, "Permission.parents('"+uid+"')");
	}
	else {
		
		var permission = s3db.U[s3db.activeU.ind].pl[s3db_entity+s3db_clicked_id]; 
		//in the canvas
		var params = [];
		var effective = [];
		var assigned = [];
		for (var uid in permission) {
			
			if(typeof(uid)!='undefined'){
				if(typeof(permission[uid].uid_type)!='undefined' && permission[uid].uid_type){
					if(permission[uid].uid_type=='Cverb'){
					var i=2;
					
					}
					if(permission[uid].uid_type=='Csub'){
					var i=4;
					}
					if(permission[uid].uid_type=='Iverb'){
					var i = 5;
					}
					if(permission[uid].uid_type=='Cobj'){
					var i=6;
					}
					if(permission[uid].uid_type=='Isub'){
					var i=8;
					}
					if(permission[uid].uid_type=='Iobj'){
					var i=9;
					}

				
				}
				else {
					if(uid.match(/^U/)){
					var i=0;
					
					}
					if(uid.match(/^P/)){
					var i=1;
					
					}
					if(uid.match(/^R/)){
					var i=3;
					}
					if(uid.match(/^C/)){
					var i=4;
					}
					if(uid.match(/^S/)){
					var i=7;
					}
					if(uid.match(/^I/)){
					var i=8;
					}
				}
				params[i] = uid;
				effective[i] = permission[uid].effective_permission;
				assigned[i] = permission[uid].assigned_permission;
				
				
				
				
			}
		}
		drawCore(params, effective, assigned);	
	}
	
}

function findUserId() {
	
	var url2call = s3db.url+"URI.php?format=json&key="+s3db.key;
	s3db.user_call = url2call;
	$.getJSON(url2call+'&callback=?', function (ans) {
		s3db.user_id = ans[0].user_id;
		s3db.user_info = ans;
		findUsers();
		return false;
	});
	
	return false;
}

function findProjects() {
	 url2call = s3db.url+'S3QL.php?key='+s3db.key;
	 s3db.project_call = url2call;
	 if(typeof(s3db.U[s3db.activeU.ind].P=='undefined')){
	  s3dbcall(url2call, 's3db.U[s3db.activeU.ind].P=ans;if(s3db.user_id==s3db.activeU.user_id){s3db.P=ans;};display_box(ans,"P")');
	 }	 
	 else {
			display_box(s3db.U[s3db.activeU.ind].P,'P');
			
	 }
	 return false;
}

function findUsers() {
	url2call = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><from>users</from><where></where></S3QL>';
	s3db.user_call = url2call;
	//s3dbcall(url2call, 'displayUsers(ans)');
	$.getJSON(url2call+'&format=json&callback=?', function (ans) {
		displayUsers(ans);
	})
	return false;
}

function clickUser() {
	//user permissions will be compared against those of opened projects
	//create a key for this user - who is the active user?
	if(document.getElementById('user_id').value){
	s3db.activeU=[];
	s3db.activeU.user_id= document.getElementById('user_id').value;
	s3db.activeU.ind=s3db.activeU.user_id;
	
	document.getElementById('user_selected').innerHTML = 'Active User: '+ s3db.U[s3db.activeU.ind].username+" (U"+s3db.activeU.user_id+")";
	}
	//key will be used to login as that user; this will only be usefull to chekc permission on resources that user can already see
	if(typeof(s3db.U[s3db.activeU.ind].key)=='undefined'){
		var url2call = s3db.url+"S3QL.php?key="+s3db.key+"&query=<S3QL><insert>key</insert><where><user_id>"+s3db.activeU.user_id+"</user_id></where></S3QL>";	
		s3db.U[s3db.activeU.ind].key_call = url2call;
		//s3dbcall(url2call, 'saveUserKey(ans)');
		$.getJSON(url2call+'&format=json&callback=?', function (ans) {
			if(ans[0].key_id){
				s3db.U[s3db.activeU.ind].key = ans[0].key_id;
				
				if(s3db.user_id != s3db.activeU.user_id){
					UID.projects(s3db.activeU.user_id, "intface.compareEntity('"+s3db.activeU.user_id+"', 'P')");
				}
				else {
					UID.projects(s3db.user_id, "intface.displayEntity('"+s3db.user_id+"', 'P')");	
				}
			}
		});
	}
	else {
		if(s3db.activeU.user_id !== s3db.user_id){
			delete s3db.U[s3db.activeU.user_id].P;
			UID.projects(s3db.activeU.user_id, "intface.compareEntity('"+s3db.activeU.user_id+"', 'P')");
		}
		else {
			UID.projects(s3db.user_id, "intface.displayEntity('"+s3db.user_id+"', 'P')");	
		}
		
		//collections and rules that current user has in current project_id; 
		//findS3DB(s3db.U[s3db.activeU.ind].key, "P");
		
		
	}
	

	return false;
}

//save routines: these are callbacks that are not necessarily displayed

//display routines: these are routines that affect the interface
function display_effective_spans(pl, parent_id) {
	var opt = document.getElementById(parent_id)	
		if(pl!=null){
		for (var k=0, kl=pl.length; k<kl; k++) {//until the end of the state size
				
			qi= pl[k].match(/^y|n|s|-/i);
			var span = document.createElement('span');
			span.id = opt.id+"_effective_"+k;
			color_permission_square(span, qi);
			opt.appendChild(span);
		}
	}
	}

function displayUsers(ans) {
	var hold = 'users';
	
	//clean previous data
	document.getElementById(hold).innerHTML = "";
    use = document.createElement('select');
	use.id = 'user_id';
	s3db.U=[];s3db.activeU = [];
	
	use.setAttribute('onClick', 'clickUser()');
	use.disabled = false;
	use.size=3;
	s3db.activeU.ind = s3db.user_id;
	s3db.activeU.user_id = s3db.user_id;
	s3db.U[s3db.user_id] = s3db.user_info[0];
	s3db.U[s3db.user_id].key=s3db.key;
	document.getElementById('user_selected').innerHTML = 'Active User: '+ s3db.U[s3db.user_id].username+" (U"+s3db.activeU.user_id+")";
	
	
	if(ans){
		for (var i=0, il=ans.length; i<il; i++) {
			if((ans[i].created_by==s3db.user_id || ans[i].username=='public') && ans[i].user_id!=s3db.user_id){
				var uuid = ans[i].user_id;
				s3db["U"+uuid] = ans[i];
				s3db.U[uuid] = s3db["U"+uuid];
				
				var opt = document.createElement('option')
				opt.value = ans[i].user_id;
				opt.innerHTML = ans[i].username+' (U'+ans[i].user_id+')';
				use.appendChild(opt);
				

				if(uuid==s3db.user_id){
				}
			}
		}
	}

	//add one entry for this user
	var opt = document.createElement('option')
	opt.value = s3db.user_id;
	opt.innerHTML = s3db.user_info[0].username+' (U'+s3db.user_id+')';
	opt.selected = true;
	use.appendChild(opt);
	
	document.getElementById(hold).appendChild(use);
	//findS3DB(s3db.key, "P");
	UID.projects(s3db.user_id, "intface.displayEntity");
	return false;
}	


function saveUserPermissions(ans){
   if(ans){
	s3db.P[s3db.activeP.ind].U = ans;
   }
}

function saveUserKey(ans) {
	if(ans[0].key_id){
		s3db.U[s3db.activeU.ind].key = ans[0].key_id;
		
		if(s3db.user_id != s3db.activeU.user_id){
			UID.projects(s3db.activeU.user_id, "intface.compareEntity('"+s3db.activeU.user_id+"', 'P')");
		}
		else {
			UID.projects(s3db.user_id, "intface.displayEntity('"+s3db.user_id+"', 'P')");	
		}
	}
}


//neat little interface functions; they will be usefull for other interfaces
function display_other() {
	if (document.getElementById('url').value=='other') {
		document.getElementById('url_other').style.display='inline';
	}
	else {
		document.getElementById('url_other').style.display='none';	
	}
}

function clean_default(divId, def) {
	if (document.getElementById(divId).value===def) {
		document.getElementById(divId).value = "";
	}
}

function putTheImageInTheMiddle() {
   win = $(document).width();
   hei = $(document).height();
   
	//$('#blue_grad').attr('width', win);
	//document.getElementById('square').width=win/1.5;
	//$('#square').attr("width",win/1.5).attr("height", hei);
	//$('#collections').attr('height', (hei/2)-10);
	//$('#rules').attr('height', (hei/2)-10);
	//document.getElementById('square').height=hei;
	//document.getElementById('square').setAttribute()(
    // document.getElementById('collections').setAttribute("height",(hei/2)-10);
	//document.getElementById('rules').height = (hei/2)-10;

}
function hide(div) {
	//document.getElementById(div).style.display='none';
	$('#'+div).hide();
}

function display(div) {
	//document.getElementById(div).style.display='inline';
	$('#'+div).show();
}

function checkForm() {
	if ((document.getElementById('username').value && document.getElementById('password').value) || document.getElementById('key').value) {
		if(document.getElementById('url').value!='other' || document.getElementById('url_other').value){
		document.getElementById('go').style.display = 'inline';
		}
		}
}

						
						
						

function memory_varname(s3db_entity) {

	var tmp = [];
	p=s3db_entity;
	var varname = "s3db.";
	while (typeof(s3db.core.prev[p])!='undefined') {
		
		var prev = s3db.core.prev[p];
		if(prev.length==1){ var p = prev[0]; }
		else { 
			if(typeof(s3db["active"+prev[0]])=='undefined')
				{ var p = prev[1];
			}
			else { 
				var p = prev[0];
			}
		}
		tmp.push(p);
			
		
	}

	for (var i=(tmp.length-1); i>=0; i--) {
	varname += tmp[i]+"[s3db.active"+tmp[i]+".ind]";
	if(i!=0) {
	varname += ".";
	}
	}
	//varname += "."+s3db_entity;
	return varname;
}						
//other, general scope array manipulating functions
function intersect(a,b) {
	var c=[];
	for (var i=0; i<a.length; i++) {
		for (var j=0; j<b.length; j++) {
			if(a[i]==b[j]){
			c.push(b[j]);
			}
		}
	}
	return c;
}

function union(dataset1, dataset2) {
	 for (var i=0; i<dataset2.length; i++) {
		dataset1.push(dataset2[i]);
	 }
	 return dataset1;
}

function extract(arr, key) {
	var a = [];
	if(typeof(arr)!='undefined'){
	for (var j=0; j<arr.length; j++) {
		for (var i in arr[j]) {
			if(i==key){
			a.push(arr[j][i]);
			}
		}
	}
	}
	return a;
}

function find(arr, val) {
	var a = [];
	for (var i in arr) {
		if(arr[i]==val){
		a.push(i);
		}
	}
	return a;
}

function loading(parent_span, id) {
	var load = document.createElement('div');
	load.id = id;
	var imag = document.createElement('img');
	imag.src = 'blue_loading.gif';
	load.appendChild(imag);
	//document.getElementById(parent_span).appendChild(load);
	document.getElementById(parent_span).insertBefore(load, document.getElementById(parent_span).firstChild);
	return load;
}



function display_box(ans,S3DB_Entity) {


		//remove loading
		if(document.getElementById(s3db.core.ids[S3DB_Entity]+"_loading"))
		{remove_element(s3db.core.ids[S3DB_Entity]+"_loading");}

		var hold = s3db.core.boxes[S3DB_Entity];
		var S3DB_ID = s3db.core.ids[S3DB_Entity];
		var S3DBLabel = s3db.core.labels[S3DB_Entity];
			
		var data = ans;

		//Clean previous data first
		document.getElementById(hold).innerHTML = "";


		if(data){
			
			for (var i=0, u=data.length; i<u; i++) {
				opt = document.createElement('div');
				opt.id = S3DB_Entity+data[i][S3DB_ID];
				document.getElementById(hold).appendChild(opt);
				
				opt.setAttribute("s3db_entity", S3DB_Entity);
				opt.setAttribute("s3db_id", data[i][S3DB_ID]);
				opt.setAttribute("active_ind", i);
				opt.setAttribute(S3DB_ID, data[i][S3DB_ID]);
				opt.setAttribute('onMouseOver', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MovColor+'"}');
				//opt.setAttribute('onClick', funct+"("+data[i][S3DB_ID]+", '"+S3DB_Entity+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
				opt.setAttribute('onClick', "clickS3DB('"+S3DB_Entity+"', '"+data[i][S3DB_ID]+"', '"+s3db.activeU.ind+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
				opt.setAttribute('onMouseOut', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MoffColor+'"}');
				
				//new span for effective colors
				//new span for assigned colors
				q =  data[i]['assigned_permission'];
				for (var k=0, kl=q.length; k<kl; k++) {//until the end of the state size
						
					qi= q[k].match(/^y|n|s|-/i);
					var span = document.createElement('span');
					span.id = opt.id+"_assigned_"+k;
					color_permission_square(span, qi);
					opt.appendChild(span);
					
					//Testing right click; only if this span belongs to a user that is not the same as s3db.user_id
					if(s3db.activeU.user_id!=s3db.user_id){
						rightClickSpan(span.id, opt.id);
					}
				}
				
				
				//put a span between the two to distinguish
				var clutter = document.createElement('span');
				clutter.id = 'perm_clutter';
				clutter.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
				opt.appendChild(clutter);

				p =  data[i]['effective_permission'];
				for (var j=0, k=p.length; j<k; j++) {//until the end of the state size
						
					pi= p[j].match(/^y|n|s|-/i);
					var span = document.createElement('span');
					span.id = opt.id+"_perm_"+j;
					color_permission_square(span, pi);
					opt.appendChild(span);

					
				}

				
				
				//span to separate text from colors
				span = document.createElement('span');
				span.innerHTML = '&nbsp;&nbsp;&nbsp;';
				opt.appendChild(span);


				//create a span for the text
				var span = document.createElement('span');
				
				if(S3DBLabel.length==1){
				span.innerHTML = S3DB_Entity+data[i][S3DB_ID]+" ("+data[i][S3DBLabel]+")";
				}
				else {
					var tmp = "";
					for (var Li=0; Li<S3DBLabel.length; Li++) {
						tmp +=  data[i][S3DBLabel[Li]]+" ";
					}
					
					span.innerHTML = S3DB_Entity+data[i][S3DB_ID]+" ("+tmp+")";
				}
				 opt.appendChild(span);
				
			//wheb box is project, find also the items on collection s3dbVerb at the time the project is clicked
			if(S3DB_Entity=='C'){
					if(data[i] && data[i]['name']=='s3dbVerb'){
					//var params = {'collection_id':	data[i]['collection_id']};
					if(typeof (s3db.activeC)=='undefined') { s3db.activeC = {};}
					s3db.activeC.ind=i; s3db.activeC.collection_id=data[i]['collection_id'];
					
					var url2call = s3db.url+'S3QL.php?key='+s3db.U[s3db.activeU.ind].key+'&query=<S3QL><from>item</from><where><collection_id>'+data[i]['collection_id']+'</collection_id></where></S3QL>';
					//s3dbcall(url2call, 'if(s3db.user_id==s3db.activeU.user_id) { s3db.P[s3db.activeP.ind].C['+i+'].I=ans;s3db.P[s3db.activeP.ind].verbs=s3db.P[s3db.activeP.ind].C['+i+'];} s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C['+i+'].I=ans;s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].verbs=s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C['+i+'];');
					s3dbcall(url2call, 'if(s3db.user_id==s3db.activeU.user_id) { s3db.P[s3db.activeP.ind].C['+i+'].I=ans;s3db.P[s3db.activeP.ind].verbs=s3db.P[s3db.activeP.ind].C['+i+'];} else { s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].verbs=ans;}');
					}
			}
			}

		}
		return false;
}

function remove_element(id) {
	var e = document.getElementById(id);
	if(e){
	e.parentNode.removeChild(e);
	}
	return false;
}

function copy_parms(source,parms,target) { // copy parameters between two fields/methods
	   if (!parms){parms= fields(source)}
	   if (!target){target=new Array}
	   for (var i=0;i<parms.length;i+=1){target[parms[i]]=source[parms[i]]}
	   if (copy_parms.next){eval(copy_parms.next)}
	   
	   return target;
		
	   function fields(ob) { var fields = [];for (var i in ob) {fields.push(i);} return fields;}
   }
