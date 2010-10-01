var UID = {
//UID will contain all operations that can be performed in an s3db uid;
	uid_children : {},
	uid_call_children : {},
	cache : {},
	call : function (uid, user_id, next_action) {
		//only execute a call when uid does not yet exist
		
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.user_id; }
		if(typeof(s3db.U[user_id][uid])=='undefined'){
			var E = uid.substr(0,1);
			var I = uid.substr(1,uid.length-1);
		  
			url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+s3db.core.entities[E]+"</from><where><"+s3db.core.ids[E]+">"+I+"</"+s3db.core.ids[E]+"></where></S3QL>";
			UID.call.uid = uid;UID.call.user_id = user_id; UID.call.next_action = next_action;
			$.getJSON(url2call+'&format=json&callback=?', function (ans) {
				UID.found(ans, UID.call.uid, UID.call.user_id, UID.call.next_action);
			})
			//s3dbcall(url2call, "UID.found(ans, '"+uid+"', '"+user_id+"','"+next_action+"')");
		}
		else {
			UID.found([s3db.U[user_id][uid]], uid, user_id, next_action);
			//eval(next_action);
		}
	},
	
	found : function (ans, uid, user_id, next_action) {
		if(user_id==s3db.user_id){	s3db[uid] = ans[0];	}
		//when ans is empty (user cannot query), copy data from parent
		if(typeof(ans)!='undefined' && typeof(ans[0].error_code)=='undefined'){
		s3db.U[user_id][uid] = ans[0];
		}
		else if (typeof(s3db[uid])!='undefined' && typeof(s3db.U[user_id][uid])=='undefined') {
		s3db.U[user_id][uid] = copy_parms(s3db[uid]);
		delete s3db.U[user_id][uid].assigned_permission;
		delete s3db.U[user_id][uid].effective_permission;

		}
		//console.log(next_action);
		eval(next_action);
	},

	reload : function (uid, user_id, next_action) {
		//delete existing data and call it again
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.ind; }

		if(user_id==s3db.user_id){
		delete s3db[uid];
		}
		delete s3db.U[user_id][uid];
		UID.call(uid, user_id, next_action);
	},

	compareChildren : function(uid, user_id){
		//user-id here is going to be s3db.user_id; once this function is over, UID.children may be called with the actual active user_id
		
		if(typeof(UID.completed)=='undefined'){
			UID.completed = 0;
			UID.compareChildren.uid = uid;
			
			UID.children(uid, s3db.user_id, 'UID.compareChildren(UID.compareChildren.uid, s3db.activeU.user_id, UID.completed)');//come back to this func afterwards
		}
		else {
			UID.completed++;
		}
		if(typeof(s3db.core.inherits[uid.substr(0,1)])=='undefined' || UID.completed>=s3db.core.inherits[uid.substr(0,1)].length){
			 UID.children(uid, user_id, "intface.compareChildren");
			
			//now display the innaccessible
			//intface.displayInaccessible(ans, Permission.uidQueryInaccessible.uid, Permission.uidQueryInaccessible.user_id);
			
			delete UID.completed;
		}
		else {
			//console.log('more');
		}
		
	},

	children : function (uid, user_id, next_action) {
		//Note that next_action will be exectued after each child is retrieved; 
		//find the children of this entity
		
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.ind; }
		
		if(typeof(s3db.U[user_id][uid])=='undefined'){
			 
				UID.call(uid, user_id, "UID.children('"+uid+"', '"+user_id+"', '"+next_action+"')");
			  
		}
		else {
				
			var E = uid.substr(0,1);
			var I = uid.substr(1,uid.length-1);
			var childEntities = s3db.core.inherits[E];
			delete UID.children.thread;
			UID.children.thread = 0;
			//don't try to do this for statements
			if(typeof (childEntities)!='undefined')
			{
				for (var i=0; i<childEntities.length; i++) {
					var childType = childEntities[i];
					
					if(typeof(s3db.U[user_id][uid][childType])=='undefined'){
						var childName = s3db.core.entities[childEntities[i]];
						var inheritedIDName = s3db.core.ids[E];
						
						//Special cases: rules where parent is a collectio will query "subject_id" and "object_id"; 
						//statements where parent is an item will also query "value"
						if(E=='C' && childEntities[i]=='R'){
							//Find the rules with subject and rules with object separatelly
							var inheritedIDName = 'subject_id';
							var url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+childName+"</from><where><"+inheritedIDName+">"+I+"</"+inheritedIDName+"></where></S3QL>";
							UID.uid_call_children = url2call;
							UID.children.childEntity = childEntities[i];UID.children.uid = uid;UID.children.user_id = user_id;UID.children.next_action = next_action;
							//s3dbcall(url2call, 'UID.childrenFound(ans, "'+childEntities[i]+'", "'+uid+'", "'+user_id+'","'+next_action+'")');
							$.getJSON(url2call+'&format=json&callback=?', function (ans) {
								UID.childrenFound(ans, UID.children.childEntity, UID.children.uid, UID.children.user_id, UID.children.next_action);
							});

							
							var inheritedIDName = 'object_id';
							var url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+childName+"</from><where><"+inheritedIDName+">"+I+"</"+inheritedIDName+"></where></S3QL>";
							
							UID.uid_call_children = url2call;
							UID.children.childEntities = childEntities;UID.children.uid = uid;
							UID.children.user_id = user_id; UID.children.next_action = next_action;
							$.getJSON(url2call+'&format=json&callback=?', function (ans) {
								variableI = UID.children.thread;
								UID.childrenFound(ans, UID.children.childEntities[variableI],UID.children.uid, UID.children.user_id,UID.children.next_action);
								UID.children.thread++;
							});
							//s3dbcall(url2call, 'UID.childrenFound(ans, "'+childEntities[i]+'", "'+uid+'", "'+user_id+'","'+next_action+'")');
						}
						else {
							url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+childName+"</from><where><"+inheritedIDName+">"+I+"</"+inheritedIDName+"></where></S3QL>";
							UID.uid_call_children = url2call;
							UID.children.childEntities = childEntities;UID.children.uid = uid;
							UID.children.user_id = user_id; UID.children.next_action = next_action;
							$.getJSON(url2call+'&format=json&callback=?', function (ans) {
								variableI = UID.children.thread;
								UID.childrenFound(ans, UID.children.childEntities[variableI],UID.children.uid, UID.children.user_id,UID.children.next_action);
								UID.children.thread++;
							});
							//s3dbcall(url2call, 'UID.childrenFound(ans, "'+childEntities[i]+'", "'+uid+'", "'+user_id+'","'+next_action+'")');
						}															
						
						
					}
					else {
						if(typeof(next_action)!=='undefined'){
							if(next_action.match(/\(.*\)/)){
								eval(next_action);
								//next_action
							}
							else {
								eval(next_action+"('"+uid+"', "+user_id+", '"+childType+"')");
							}
							//eval(next_action+"('"+uid+"', "+user_id+", '"+childType+"')");
							//next_action(uid, user_id, childType);//This should work, returning an error in s3dbcall (eval json)
						}
						
					}
				}
			}
		}
	
	},
	
	childrenFound : function (ans, childType, uid, user_id, next_action){

		//Housekeeping
		if(typeof(UID.uid_children[uid])=='undefined') { UID.uid_children[uid] = 0;}
		UID.uid_children[uid]++;

		if(typeof(user_id)=='undefined') {var user_id = s3db.activeU.ind; }
		if(typeof(s3db.U[user_id][uid][childType])=='undefined'){
			s3db.U[user_id][uid][childType] = {};
		}
		
		//Because the goal is to maintain a link between updated uid and children uid, don't assign ans directly to children
		if(typeof(ans)!='undefined' && ans.length>0 && typeof(ans[0].error_code)=='undefined'){
			for (var i=0, il=ans.length; i<il; i++) {
				var c_uid =  childType+ans[i][s3db.core.ids[childType]];
				s3db.U[user_id][c_uid] = ans[i];
				s3db.U[user_id][uid][childType][c_uid] = s3db.U[user_id][c_uid];
				
				
				//for parent user, save also in the global s3db
				if(user_id==s3db.user_id){
					s3db[uid][childType][c_uid] = s3db.U[user_id][c_uid];
					s3db[c_uid] = s3db.U[user_id][c_uid];
				}
				
			}
	   
		}

		if(next_action!='undefined'){
			//does it bring argumnetos?
			if(next_action.match(/\(.*\)/)){
				eval(next_action);
			}
			else {
				eval(next_action+"('"+uid+"', '"+user_id+"', '"+childType+"')");
			}

		}


	},

	projects : function (user_id, next_action) {

		//if projects are being requested, then this must mean the either the user is first looging in or the user has changed (proxy) in either case, all other boxes should go empty?
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.ind; }
		if(typeof(s3db.U[user_id].P)=='undefined'){
			url2call = s3db.url+"S3QL.php?format=json&key="+s3db.U[user_id].key+"&query=<S3QL><from>projects</from></S3QL>";
			UID.uid_call_children = url2call;
			UID.projects.user_id = user_id;UID.projects.next_action = next_action;
			$.getJSON(url2call+'&callback=?', function (ans) {
				UID.projectsFound(ans, user_id,next_action);
			});
			//s3dbcall(url2call, 'UID.projectsFound(ans, "'+user_id+'","'+next_action+'")');	
			//s3dbcall(url2call, "UID.projectsFound(ans, '"+user_id+"','"+next_action+"')");	
		}
		else {

			if(next_action!='undefined'){
				if(next_action.match(/\(.*\)/)){
					eval(next_action);
				}
				else {
					eval(next_action+"('"+user_id+"', 'P')");
				}
			}
		}
	},
	
	projectsFound : function (ans, user_id, next_action) {
		if(typeof(user_id)=='undefined') {var user_id = s3db.activeU.ind; }
			if(typeof(s3db.U[user_id].P)=='undefined'){
				s3db.U[user_id].P = {};
			}
		
		if(typeof(ans)!='undefined' && ans.length>0 && typeof(ans[0].error_code)=='undefined'){
			for (var i=0, il=ans.length; i<il; i++) {
				var p_uid =  "P"+ans[i][s3db.core.ids["P"]];
				s3db.U[user_id][p_uid] = ans[i];
				s3db.U[user_id]["P"][p_uid] = ans[i];
				
				
				//for parent user, save also in the global s3db
				if(user_id==s3db.user_id){
					if(typeof(s3db["P"])=='undefined'){ s3db["P"] = {}; };
					s3db["P"][p_uid] = s3db.U[user_id][p_uid];
					s3db[p_uid] = s3db.U[user_id][p_uid];
				}
				
			}
	   
		}
		//at this point, we can either use the projects to populate the interface (if original user) or, if the user that is active is not the original one, we can use the projects to compare agains what is already in the box
		
		//action 1 is compare with entities already there
		if(s3db.activeU.user_id!==s3db.user_id){
			intface.compareEntity(s3db.activeU.user_id, 'P');
			if(typeof(s3db.activeP)!=='undefined')
			clickS3DB('P', s3db.activeP.project_id, s3db.activeU.user_id);
		}
		else {
			intface.displayEntity(s3db.activeU.user_id, 'P');
		}
		
		//action 2 is a fill with entities that login user may not have had permission on
		
		
		/*
		if(next_action!='undefined'){
			//does it bring argumnetos?
			if(next_action.match(/\(.*\)/)){
				eval(next_action);
			}
			else {
				eval(next_action+"("+user_id+", 'P')");
			}

		}
		*/
	},

	childrenReload : function (uid, user_id, next_action) {
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.ind; }
		
		if(typeof(s3db.U[user_id][uid])=='undefined'){
			s3db.U[user_id][uid] = {assigned_permission : '---', effective_permission : 'nnn' };
			if(console.log)
			console.log("User "+user_id+" cannot query uid "+uid+". For that reason, permission is assumed nnn.");
		}
		var E = uid.substr(0,1);
		var I = uid.substr(1,uid.length-1);
		var childEntities = s3db.core.inherits[E];	
		if(typeof(childEntities)!='undefined'){
			for (var i=0, il=childEntities.length; i<il; i++) {
				 if(typeof(s3db.U[user_id][uid][childEntities[i]])!='undefined'){
					 for (var c_uid in s3db.U[user_id][uid][childEntities[i]]) {
						 //delete s3db.U[user_id][uid][childEntities[i]][c_uid];
						 delete s3db.U[user_id][uid][childEntities[i]][c_uid];
						 //delete s3db.U[user_id][c_uid];
					 	 
						 if(user_id==s3db.user_id){
							delete s3db[uid][childEntities[i]][c_uid];
							//delete s3db[c_uid];
						 }
					 
					 }
					 delete s3db.U[user_id][uid][childEntities[i]];
					 if(user_id==s3db.user_id){
						delete s3db[uid][childEntities[i]];
					 }
					 
					 
				 }

			}
		}
		UID.children(uid, user_id, next_action);
	
	},

}