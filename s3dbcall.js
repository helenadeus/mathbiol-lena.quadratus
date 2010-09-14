// call_id = s3dbcall(src,next_eval,else_eval,tout)
// Makes a URL call to a S3DB deployment using JSON
// Arguments:
//  call_id is the call identifier, useful for debugging and
//      tracking call results, see below.
//	src is the url, typically the url of the deployment's
//      S3QL service concatenated with the S3QL query.
//		src can also be an object with the S3QL arguments as
//      properties. The parameters url and key can also be passed
//      as properties of the s3dlcall object (see examples).
//	next_eval is the coomand that is to be executed AFTER a
//      sucessful call.
//	else_eval is the command that is to be executed if the
//      call fails to respond.
//	tout (timeout) is the time in milliseconds the call waits
//      for a reply before deciding it failed. Note that
//      if the reply arrives back after tout expires next_eval
//      will still be evaluated. default value is 10000 (10secs).
//
// Debugging and other advanced tools
//
//   the s3db call returns the call id (var call), i.e. id=s3dbcall(...
//   s3dbcall.job keeps track of both successful and failed calls
//   which can be checked with this reference. Successful calls answers
//   will be stored in s3dbcall.job[id] untill of tout expires it. Note that
//   If the call was succesfull s3dbcall.job[id] is deleted, seasing
//   to be available for use by other functions. If the call was
//   unsuccessfull within tout time interval than the failed url is stored
//   with the sufix 'tout_', i.e. s3dbcall.job.tout_call_12345... 
//
// example 1: 
//   u='https://ibl.mdanderson.org/gcc/S3QL.php?key=abcdef&query=<S3QL><select>*</select><from>statements</from><where><rule_id>123</rule_id><project_id>456</project_id></where></S3QL>';
//
//   or any other S3DB service, such as u='https://ibl.mdanderson.org/URI.php'
//
//   s3dbcall(u,"result=ans;alert(':-)')","result=0;alert(':-(')")
//
// example 2:
//
//   q={url:'http://ibl.mdanderson.org/gcc',key:'abcdef',select:'*',from:'statements',where:{rule_id:123,project_id:456}};
//   s3dbcall(q,"result=ans;alert(':-)')","result=0;alert(':-(')")
//
// example 3:
//
//   s3dbcall.url='http://ibl.mdanderson.org/gcc'; // preset url
//   s3dbcall.key='abcdef'; // preset key
//	 // and thereafter S3QL calls can be more simply made as, for example
//   s3dbcall({select:'*',from:'statements',where:{rule_id:123,project_id:456}},"f(ans)","g()");
//
// Jonas Almeida, 30 July 2009

// --- CALL ---

s3dbcall=function (src,next_eval,else_eval,tout) {
	if (!next_eval) {next_eval=''}
	if (!else_eval) {else_eval=''}
	if (!tout) {tout=10000} // default time out is 10 seconds
	var call = s3dbcall.job('call_');
	var arg = 'format=json&callback=s3dbcall.s3db_jsonpp&jsonpp=s3dbcall.job.'+call+'=ans;'+next_eval;
	if (typeof src == 'object') { // then a S3QL object is being passed in, note in that case that the key and the url may be set as properties of s3dbcall
		if (src.url) {var url=src.url;delete src.url} else {var url=s3dbcall.url} // get url
		if (url[url.length]!=='/') {url+='/'}
		if (src.key) {var key=src.key;delete src.key} else {var key=s3dbcall.key} // get url
		src=url+'S3QL.php?key='+key+'&query='+s3dbcall.json2xml(src,'S3QL');
		//console.log(src)
		}
	if (!src.match(/\?/)) {src+="?"+arg} else {src+='&'+arg}
	var headID = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = src ;
	script.id = call;
	headID.appendChild(script);// retrieve answer
//	setTimeout('s3dbcall.remove_element_by_id("'+script.id+'")',1000); // wait 1 sec and remove the script that asked the question (IE needs it there for a moment, Firefox and Chrome are actually ok with immediate deletion)
//	setTimeout('if(!s3dbcall.job.'+call+'){s3dbcall.job.tout_'+call+'="'+src+'";eval("'+else_eval+'")}else{delete s3dbcall.job.'+call+'}',tout); // set wait time here
	return call;}
s3dbcall.remove_element_by_id=function (id) {
	var e = document.getElementById(id);
	if(e){
	e.parentNode.removeChild(e);
	}
	return false;}
s3dbcall.s3db_jsonpp = function (ans,jsonpp) {
	eval(jsonpp);
	return false;}
s3dbcall.job = function (prefix){ // Creates unique labels
	return prefix+Math.random().toString().replace(/\./g,'');}

// --- S3QL ---
s3dbcall.json2xml=function(S,tag){ // minimal xml parser
	if (tag) {var xml='<'+tag+'>';}else {var xml=''}
	for (var x in S){
		xml+='<'+x+'>';
		if (typeof S[x] == 'array'|typeof S[x] == 'object'){xml+=s3dbcall.json2xml(S[x])}
		else {xml+=S[x]}
		xml+='</'+x+'>';
		}	
	if (tag) {xml+='</'+tag+'>';}	
	return xml}
