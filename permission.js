//s3db = {};
//s3db.core = {entities : 
//				{'P':'project', 'U':'user', 'C':'collection','R':'rule','I':'item','S':'statement'},
//			ids :
//				{'P':'project_id','U':'user_id','C':'collection_id','R':'rule_id','I':'item_id','S':'statement_id'},
//			
//			prev :
//				{'P':['U'],'C':['P'],'R':['P','C','I','C'],'I':['C'],'S':['I','R','I']},
//			prev_id :
//				{'P':[], 'C':['project_id'],'R':['project_id','subject_id','verb_id','object_id'],'I':['collection_id'],'S':['item_id','rule_id','value']},
//			uid_total_threadsLong :
//				{'P':1,'C':1,'R':4,'I':1,'S':6},
//			uid_total_threadsShort :
//				{'P':1,'C':1,'R':3,'I':1,'S':4}
//			};
//s3db.user_id = 139281;
//s3db.url = 'http://ibl.mdanderson.org/edu/';
//s3db.activeU = {ind : 0 };
//s3db.U = {0 : { key : 'mudamseostempos' } };
//s3db.U[s3db.activeU.ind].pl = {};
//s3db.actions = {};
////uid = "S17112";
////uid = "R17102";
////uid = "P17066";
////uid = 'C26969';
////uid = "R17098";
////uid = 'S17106';
////uid = "I17109";			
////uid = "S17115";
////uid = "R17098";
//uid = "R27018";
//uid_call(uid, "Permission.parents('"+uid+"')");

var Permission = {
	//Find where this udi inherits from
	
	
	parents : function (uid, root) {
		
		if(typeof(root)=='undefined'){
			var root=uid;
			s3db.permission = {};
			s3db.totalThreads = {};
			s3db.parentsReady = [];
			s3db.parents_uid = {};
			s3db.permission[uid] = {};
			s3db.parentsReady[uid] = 0;
		}
		
		var E = uid.substr(0,1);
		
		//Calculate the maximum number of threads for this uid
		if(E=='R' || E=='S'){
			if(s3db[uid].object_id!=""){
			s3db.totalThreads[uid] = s3db.core.uid_total_threadsLong[E];
			}
			else {
				//remove value, object_id from backtrack ids
				s3db.core.prev_id[E].splice(s3db.core.prev_id[E].length-1,1);
				s3db.core.prev[E].splice(s3db.core.prev[E].length-1,1);
				s3db.totalThreads[uid] = s3db.core.uid_total_threadsShort[E];
			}
		}
		else {
			s3db.totalThreads[uid] = s3db.core.uid_total_threadsShort[E];
		}

		//U indicates the end of a thread
		if(E=='U'){
			s3db.parentsReady[root]++;
		}
		
		//Declare some housekeeping variables for this uid
		if(typeof(s3db.parentsReady[uid])=='undefined') { s3db.parentsReady[uid] = 0; }
		if(typeof (s3db.parents_uid[uid])=='undefined') { s3db.parents_uid[uid] = []; }
		if(typeof(s3db.permission[uid])=='undefined') {s3db.permission[uid] = {} };
		
		//Record this uid's effective and assigned permisions
		Permission.tranferPermission(uid,uid);
		
		//Find this uid's parents
		pids = s3db.core.prev[E];
		if(typeof(pids)!='undefined'){
			for (var i=0, il=pids.length; i<il; i++) {
				
				
				E1 = s3db.core.prev[E][i].substr(0,1);
				if(E1=='U'){
					next_uid = 'U'+s3db.user_id;
				}
				else {
					next_uid = E1+s3db[uid][s3db.core.prev_id[E][i]];
				}
				s3db.parents_uid[uid].push(next_uid);
				if(typeof(s3db[next_uid])=='undefined'){
					uid_call(next_uid, "Permission.join_parent_thread(ans, '"+root+"', '"+next_uid+"')");
				}
				else {
					Permission.join_parent_thread([s3db[next_uid]], root, next_uid);
				}

			}
		}
		
	},

	join_parent_thread : function (ans, rt, next_uid) {
		 //Save this parent's data and increment uid's ready threads by 1
		 
		 var E = rt.substr(0,1);
		 s3db[next_uid] = ans[0];
		 Permission.parents(next_uid, rt);
		 Permission.tranferPermission(rt,next_uid);
		 
		
		 //Now that all uid in each thread has been recovered
		 if(s3db.parentsReady[rt]==s3db.totalThreads[rt]){ 
				//console.log(root+' finished ');
				//delete s3db.totalThreads;
				//delete s3db.parentsReady;
				delete s3db.parents_uid;
				s3db.U[s3db.activeU.ind].pl[rt] = s3db.permission[rt];
				explainPermission(E, rt.substr(1, rt.length-1));
				//delete s3db.permission;
		 }
	},

	tranferPermission : function (uid, p_uid) {
		
		E = p_uid.substr(0,1);
		
		if(E=='U'){
				if(s3db[p_uid].filter){
				s3db.permission[uid][p_uid] = {effective_permission : s3db[p_uid].filter, assigned_permission : s3db[p_uid].filter};
				}
				else {
				s3db.permission[uid][p_uid] = {effective_permission : '---', assigned_permission : '---'};	
				}
		}
		else {
				if(s3db.activeU.user_id==s3db.user_id) { var dd = s3db[p_uid]; }
				else { var dd = s3db.U[s3db.activeU.ind][p_uid];	}
				s3db.permission[uid][p_uid] = {effective_permission : dd.effective_permission, assigned_permission : dd.assigned_permission }; 
		}
		s3db.permission[uid][p_uid].uid_type = Permission.uidType(uid, p_uid);
	},
	
		uidType : function (uid,n_uid,root) {
			if(typeof(root)=='undefined') { var root = uid;}
			var uid_type = false;
			//Types for boxes - at some point, will need to know what is a Csub, a Cobj and a Cverb
			
					
				var E = root.substr(0,1);
				var E1 = n_uid.substr(0,1);
				if(E=='R' || E=='S'){
					if(E1=='C'){//either subj or obj
						if('C'+s3db[uid].subject_id==n_uid){
							uid_type = 'Csub';
						}
						else if ('C'+s3db[uid].object_id==n_uid) {
							uid_type = 'Cobj';
						}
						else {
							uid_type = 'Cverb';
						}
					}
					else if (E1=='I'){
						if('I'+s3db[uid].item_id==n_uid){
							uid_type = 'Isub';
						}
						else if ('I'+s3db[uid].value==n_uid) {
							uid_type = 'Iobj';
						}
						else {
							uid_type = 'Iverb';
						}
					}
				}
				else if (E=='I'){
					if(uid.substr(0,1)=='R' || uid.substr(0,1)=='S'){
						  if(s3db[n_uid].name=='s3dbVerb'){
							   uid_type = 'Cverb';
						  }
					}
				}
			return uid_type;
			
	}
}



function uid_found(ans, uid, next_action) {
	//this means a certain thread was completed
	//s3db.U[s3db.activeU.ind][uid] = ans[0];
	
	if(s3db.activeU.ind==s3db.user_id){
	s3db[uid] = ans[0];
	}
	s3db.U[s3db.activeU.ind][uid] = ans[0];

	eval(next_action);
}

function uid_call(uid, next_action) {

	
	var E = uid.substr(0,1);
	var I = uid.substr(1,uid.length-1);

	url2call = s3db.url+"S3QL.php?key="+s3db.U[s3db.activeU.ind].key+"&query=<S3QL><from>"+s3db.core.entities[E]+"</from><where><"+s3db.core.ids[E]+">"+I+"</"+s3db.core.ids[E]+"></where></S3QL>";
	s3dbcall(url2call, 'uid_found(ans, "'+uid+'", "'+next_action+'")');
	
}

function permissionUpdated(span_id, new_value, uid) {
	//To prevent user from removing himself, do nothing if current user is the same as parent user
	if(s3db.user_id != s3db.activeU.user_id){
		//capture the complete assigned permissions string
		//console.log('here '+s3db.U[s3db.activeU.ind][uid].assigned_permission);
		if(typeof (s3db.U[s3db.activeU.ind][uid])!='undefined'){
		var current_permission = s3db.U[s3db.activeU.ind][uid].assigned_permission;
		}
		else {
			var current_permission = '---';
		}
		//Replace, in current permission, the value that was changed
		if(typeof(current_permission)!='undefined'){
			 var E = uid.substr(0,1);
			 var I = uid.substr(1,uid.length-1);
			 var tmp = span_id.split('_');
			 var uid = tmp[0]; var type = tmp[1]; var pos = tmp[2];
			 var new_permission = '';
			 for (var i=0; i<current_permission.length; i++) {
				   if(i==pos){
						new_permission += new_value;
				   }
				   else {
						new_permission += current_permission[i];
				   }
			 }
			 // current_permission[pos] = new_value;
			 //now send the query to s3dbcall
			 var url2call = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><insert>user</insert><where><user_id>'+s3db.activeU.user_id+'</user_id><'+s3db.core.entities[E]+'_id>'+I+'</'+s3db.core.entities[E]+'_id><permission_level>'+new_permission+'</permission_level></where></S3QL>';
			 
			 //callit, then user permissions need to be recalculated
			 //console.log(url2call);
			 s3dbcall(url2call, 'permissionReIssue(ans, "'+uid+'", "'+s3db.activeU.ind+'", "'+new_permission+'")');
				

		}
	}
	else {
		alert("Increasing your own permission from a resource is not allowed! Decreasing your permissions in a resource is not recoverable (Admin will need to recover it)");
	}
}

function permissionReIssue(ans, uid,user_was_changed,new_permission) {
 //the permission for this uid has just changed, so re-issue it on the interface
 //if permission is the same, do nothing
	if(ans[0].error_code=='0'){
		s3db.U[user_was_changed][uid] =  new_permission;
	}

	if(typeof(s3db.U[user_was_changed][uid])=='undefined') 
	{ 
		s3db.U[user_was_changed][uid] = {assigned_permission : '---', effective_permission : '---' } 
		console.log("User "+user_was_changed+" cannot query uid "+uid+". For that reason, permission is assumed ---.");
	};
	
	if(new_permission!=s3db.U[user_was_changed][uid].assigned_permission){
		UID.reload(uid,user_was_changed, "intface.uidReload('"+uid+"', '"+user_was_changed+"')");
		
	}
}
