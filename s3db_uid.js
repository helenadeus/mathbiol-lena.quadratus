var UID = {
//UID will contain all operations that can be performed in an s3db uid;
	uid_children : {},
	uid_call_children : {},

	call : function (uid, user_id, next_action) {
		//only execute a call when uid does not yet exist
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.user_id; }
		if(typeof(s3db.U[user_id][uid])=='undefined'){
			var E = uid.substr(0,1);
			var I = uid.substr(1,uid.length-1);

			url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+s3db.core.entities[E]+"</from><where><"+s3db.core.ids[E]+">"+I+"</"+s3db.core.ids[E]+"></where></S3QL>";
			s3dbcall(url2call, 'UID.found(ans, "'+uid+'", "'+user_id+'","'+next_action+'")');
		}
		else {
			eval (next_action);
		}
	},
	
	found : function (ans, uid, user_id, next_action) {
		if(user_id==s3db.user_id){	s3db[uid] = ans[0];	}
		//when ans is empty (user cannot query), copy data from parent
		if(typeof(ans)!='undefined' && typeof(ans[0].error_code)=='undefined'){
		s3db.U[user_id][uid] = ans[0];
		}
		else if (typeof(s3db[uid])!='undefined') {
		s3db.U[user_id][uid] = s3db[uid];
		delete s3db.U[user_id][uid].assigned_permission;
		delete s3db.U[user_id][uid].effective_permission;

		}
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
		if(typeof(UID.uid_children[uid])=='undefined'){
			UID.children(uid, s3db.user_id, "UID.compareChildren");//come back to this func afterwards
		}
		else {
		//at this point uid children exists, inow the active user's permission on children can be retrieved
		//UID.children(uid, s3db.activeU.ind, "intface.childrenReload");
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
			
			//don't try to do this for statements
			if(typeof (childEntities)!='undefined')
			{
				for (var i=0, il=childEntities.length; i<il; i++) {
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
							s3dbcall(url2call, 'UID.childrenFound(ans, "'+childEntities[i]+'", "'+uid+'", "'+user_id+'","'+next_action+'")');
							
							var inheritedIDName = 'object_id';
							var url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+childName+"</from><where><"+inheritedIDName+">"+I+"</"+inheritedIDName+"></where></S3QL>";
							UID.uid_call_children = url2call;
							s3dbcall(url2call, 'UID.childrenFound(ans, "'+childEntities[i]+'", "'+uid+'", "'+user_id+'","'+next_action+'")');
						}
						else {
							url2call = s3db.url+"S3QL.php?key="+s3db.U[user_id].key+"&query=<S3QL><from>"+childName+"</from><where><"+inheritedIDName+">"+I+"</"+inheritedIDName+"></where></S3QL>";
							UID.uid_call_children = url2call;
							s3dbcall(url2call, 'UID.childrenFound(ans, "'+childEntities[i]+'", "'+uid+'", "'+user_id+'","'+next_action+'")');
						}															
						
						
					}
					else {
						if(next_action!='undefined'){
							eval(next_action+"('"+uid+"', "+user_id+", '"+childType+"')");
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
			
			if(next_action!='undefined'){
			eval(next_action+"('"+uid+"', "+user_id+", '"+childType+"')");
			//next_action(uid, user_id, childType);//This should work, returning an error in s3dbcall (eval json)
			}
		 }
		 

	},

	childrenReload : function (uid, user_id, next_action) {
		if(typeof(user_id)=='undefined'){ var user_id = s3db.activeU.ind; }
		
		if(typeof(s3db.U[user_id][uid])=='undefined'){
			s3db.U[user_id][uid] = {assigned_permission : '---', effective_permission : 'nnn' };
			console.log("User "+user_id+" cannot query uid "+uid+". For that reason, permission is assumed nnn.");
		}
		var E = uid.substr(0,1);
		var I = uid.substr(1,uid.length-1);
		var childEntities = s3db.core.inherits[E];	
		for (var i=0, il=childEntities.length; i<il; i++) {
			 if(typeof(s3db.U[user_id][uid][childEntities[i]])!='undefined'){
				 delete s3db.U[user_id][uid][childEntities[i]];
				 
				 if(user_id==s3db.user_id){
				 delete s3db[uid][childEntities[i]];
				 }
			 }

		}
		UID.children(uid, user_id, next_action);
	
	},

}

//s3db = {};
//s3db.core = {
//			entities : {U:'user',P:'project',C:'collection',R:'rule',I:'item',S:'statement'},
//			ids : {U:'user_id',P:'project_id',C:'collection_id',R:'rule_id',I:'item_id',S:'statement_id'},
//			inherits : {P:["C","R"],C:["I","R"],R:"S",I:"S"},
//			prev : {P:["U"], R:["P", "C", "I", "C"],C:["P"],I:["C"],S:["R", "I", "I"]},
//			prev_id : {P:["user_id"], R:["project_id", "subject_id", "verb_id", "object_id"],C:["project_id"],I:["collection_id"],S:["rule_id","item_id","value"]},
//			boxes : {U:'users',P:'projects',C:'collections',R:'rules',I:'items',S:'statements'},
//			labels : {U:['username'],P:['name'],C:['name'],R:['subject', 'verb', 'object'],I:['notes'],S:['value']},
//			uid_total_threadsLong :	{'P':1,'C':1,'R':4,'I':1,'S':6},
//			uid_total_threadsShort :  {'P':1,'C':1,'R':3,'I':1,'S':4}
//	};
//s3db.user_id = 3117;
//s3db.url = 'http://ibl.mdanderson.org/edu/';
//s3db.activeU = {ind : 139281 , user_id : 139281};
//s3db.U = {139281 : { key : 'XuUpWmDjS1uU5Nn' } };
////var s3uid = 'P17066';
//s3uid = 'C17096';
//
////UID.call(s3uid, s3db.activeU.user_id, "UID.children('"+s3uid+"')");
////UID.children(s3uid, s3db.activeU.user_id);
//UID.children(s3uid, s3db.activeU.user_id);

