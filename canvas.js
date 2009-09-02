
function canvas_add_text(ctx, params,effective_permissions,assigned_permissions) {
					   //0	 1	2		  3   4		  5		   6			7   8		  9
	 params_default = ["					U", "					P",'C verb','R','Csubj','I verb','  C obj /  L','S','I subj','  I  obj /  L'];
	 if(typeof(params)=='undefined'){
	 params = {};
	 }
	 if(typeof(effective_permissions)=='undefined'){
	 effective_permissions = {};
	 }
	 if(typeof(assigned_permissions)=='undefined'){
	 assigned_permissions = {};
	 }

	 var colors = {};
	 for (var i=0; i<=9; i++) {
		 if(typeof(params[i])=='undefined'){
		 colors[i] = 'white';
		 params[i] = params_default[i];
		 }
		 else {
			//also color the box
			colors[i] = '#CCFFFF';
			//find permissions
			if(typeof(effective_permissions[i])=='undefined'){
				effective_permissions[i] = '---';
			}
			if(typeof(assigned_permissions[i])=='undefined'){
				assigned_permissions[i] = '---';
			}
		 }
		
	 }
	 
	ctx.fillStyle = 'blue';
	ctx.font = '16px Courier New blue';
	insideY = 20;insideX = 3;
	
	for (var i=0; i<=9; i++) {
		ctx.fillStyle = colors[i];
		if(i!=3 && i!=7){
			ctx.fillRect(sq[i].x+1, sq[i].y+1, sq[i].W-1, sq[i].H-1);
		}
		
		
		ctx.fillStyle = 'blue';
		if(i!=3 && i!=7){
			ctx.fillText(params[i], sq[i].x+insideX, sq[i].y+insideY);
		}
		else {
			ctx.fillText(params[i], sq[i].x+insideX, sq[i].y+insideY-3);
		}
		//write effetive permissions above the square
		if(typeof(effective_permissions[i])!='undefined'){
		permissionSquares(ctx,sq[i].x, sq[i].y-15,effective_permissions[i]);
		}
		//write assigned permissions below the square
		if(typeof(assigned_permissions[i])!='undefined'){
		permissionSquares(ctx,sq[i].x, sq[i].y+sq[i].H, assigned_permissions[i]);
		}
	
		
	}
	
	
	
}

function permissionSquares(ctx,positionX,positionY,perm) {
	X = {0: positionX };
	Y = {0: positionY };
	var sqlen = 20; 
	var sqhei = 15;
	for (var i=0, il=perm.length; i<il; i++) {
		if(perm[i]=='y' || perm[i]=='Y'){
			ctx.fillStyle = 'green';
		}
		if(perm[i]=='s' || perm[i]=='S'){
			ctx.fillStyle = 'yellow';
		}
		if(perm[i]=='n' || perm[i]=='N'){
			ctx.fillStyle = 'red';
		}
		if(perm[i]=='-'){
			ctx.fillStyle = 'silver';
		}
		ctx.fillRect(X[i], Y[i], sqlen,sqhei);
		ctx.strokeStyle = 'blue';
		ctx.strokeRect(X[i], Y[i], sqlen,sqhei);
		ctx.fillStyle = 'black';
		ctx.font = '14px Courier New black';
		ctx.fillText(perm[i], X[i]+4, Y[i]+12);
		X[i+1] = X[i]+sqlen;
		Y[i+1] = Y[i];
	}
	
}
function drawCore(params,effective_permissions,assigned_permissions) {
	var canvas = document.getElementById('permit');
	var ctx = canvas.getContext('2d');

	ctx.width = canvas.getAttribute("width");
	ctx.height = canvas.getAttribute("height");
	
	//clean state before adding stuff
	clear(ctx);
	
	recWidth = 60;
	recHeight = 30;
	drawDistanceBorder = 20;
	drawDistanceX = 20;
	drawDistanceY = 80;
	curvatureX = 60;
	curvatureY = 70;
	

	//draw  arectangle right in the middle of x, 10 px away from the top border on y
	ctx.strokeStyle = "blue";
	sq = {}; 
	sq[0] = {x:drawDistanceX, y:drawDistanceBorder, W:recWidth, H:recHeight};
	sq[1] = {x:ctx.width/2-recWidth/2, y:drawDistanceBorder, W:recWidth, H:recHeight};
	sq[2] = {x:sq[1].x, y:sq[1].y+drawDistanceY, W:recWidth, H:recHeight};
	sq[3] = {x:drawDistanceBorder, y:sq[2].y+drawDistanceY, W:(ctx.width-drawDistanceBorder*2)+3, H:recHeight+drawDistanceBorder*4};
	sq[4] = {x:sq[3].x+drawDistanceBorder, y:sq[3].y+drawDistanceBorder*2, W:recWidth, H:recHeight};
	sq[5] = {x:sq[1].x, y:sq[3].y+drawDistanceBorder*2, W:recWidth, H:recHeight};
	sq[6] = {x:sq[5].x+sq[5].W+drawDistanceBorder, y:sq[3].y+drawDistanceBorder*2, W:recWidth, H:recHeight};
	sq[7] = {x:drawDistanceBorder*3, y:sq[3].y+drawDistanceBorder*8, W:(ctx.width-drawDistanceBorder*6), H:recHeight+drawDistanceBorder*4};
	sq[8] = {x:sq[7].x+drawDistanceBorder, y:sq[7].y+drawDistanceBorder*2, W:recWidth, H:recHeight};
	sq[9] = {x:sq[8].x+sq[8].W+drawDistanceBorder, y:sq[7].y+drawDistanceBorder*2, W:recWidth, H:recHeight};

	for (var i=0; i<10; i++) {
		ctx.strokeRect(sq[i].x,sq[i].y,sq[i].W, sq[i].H);
	}
	
	
	//now draw lines; shift them if they will have permission squares
	if(typeof(effective_permissions)=='undefined'){
		effective_permissions = [];
	}
	
	ln = {0:{},1:{},2:{},3:{},4:{},5:{},6:{},7:{},8:{}};
	lnp = {0:{},1:{},2:{},3:{},4:{},5:{},6:{},7:{},8:{}};
	
	ln[0] = {xi:sq[0].x+recWidth, yi:sq[0].y+recHeight/2, xj:sq[1].x, yj:sq[1].y+recHeight/2, begin_square : 0,end_square: 1};
	ln[1] = {xi:sq[1].x+recWidth/2, yi:sq[1].y+recHeight,yip:sq[1].y+recHeight+16, xj:sq[2].x+recWidth/2, yj:sq[2].y, yjp:sq[2].y-16, begin_square : 1,end_square: 2};
	ln[2] = {xi:sq[2].x+recWidth/2, yi:sq[2].y+recHeight,yip:sq[2].y+recHeight+16, xj:sq[5].x+recWidth/2, yj:sq[5].y, yjp:sq[5].y-16, begin_square : 2,end_square: 5};
	ln[3] = {xi:sq[3].x+sq[3].W/2-3, yi:sq[3].y+sq[3].H, xj:sq[3].x+sq[3].W/2-3,yj:sq[7].y,yjp:sq[7].y, begin_square : 3,end_square: 7};
	ln[4] = {xi:sq[1].x+recWidth/2, yi:sq[1].y+recHeight, xj:sq[4].x+recWidth/2, yj:sq[4].y, yjp:sq[4].y-16,begin_square : 1,end_square: 4};
	ln[5] = {xi:ln[4].xi, yi:ln[4].yi, xj:sq[6].x+sq[6].W/2, yj:sq[6].y,yjp:sq[6].y-16 ,begin_square : 4,end_square: 6};
	ln[6] = {xi:sq[4].x+sq[4].W/2, yi: sq[4].y+sq[4].H, xj: sq[8].x+sq[8].W/2, yj: sq[8].y,yjp: sq[8].y-16 ,begin_square : 4,end_square: 8}
	ln[7] = {xi:sq[6].x+sq[6].W/2, yi: sq[6].y+sq[6].H, xj: sq[9].x+sq[9].W/2, yj: sq[9].y, yjp: sq[9].y-16, begin_square : 6,end_square: 9}
	
	//stroke in canvas has a memory - beginPath makes sure all the strokes do not come back after being cleared
	ctx.beginPath();
	
	for (var l=0; l<=7; l++) {
		if(typeof(effective_permissions[ln[l].begin_square])!='undefined' && typeof(ln[l].yip)!='undefined'){
			//ctx.strokeStyle = 'red';
			var Ybeg = ln[l].yip;
		}
		else {
			//ctx.strokeStyle = 'blue';
			var Ybeg = ln[l].yi;	
		}
		ctx.moveTo(ln[l].xi,Ybeg);
		
		if(typeof(effective_permissions[ln[l].end_square])!='undefined' && typeof(ln[l].yjp)!='undefined'){
				var Yend = ln[l].yjp;
			}
			else {
				var Yend = ln[l].yj;
			}

		if(l==4){
			ctx.quadraticCurveTo(curvatureX,curvatureY,ln[l].xj,Yend);	
		}
		else if (l==5) {
			ctx.quadraticCurveTo(ctx.width-curvatureX,curvatureY,ln[l].xj,Yend);	
		}
		else {
			
			ctx.lineTo(ln[l].xj,Yend); 
		}
		ctx.stroke('blue');
		
		
		if(l==4 || l==5){
			arrow(ctx,ln[l].xj,ln[l].xj,ln[l].yi-10-1,Yend-1,2,10);	
		}
		else {
			arrow(ctx,ln[l].xi,ln[l].xj,ln[l].yi-1,Yend-1,2,10);	
		}
		
	}
	//Add the permission boxed first, lines will have to account for that
	canvas_add_text(ctx,params,effective_permissions,assigned_permissions);
	
	
}



function grid (ctx) {
	width = ctx.width;
	height = ctx.height;
	ctx.strokeStyle = "rgba(0, 0, 200, 0.5)";
	for (var i=0; i<=width; i=i+20) {
	ctx.beginPath();
	ctx.moveTo(i,0);//all grid lines start at zero
	ctx.lineTo(i,height);
	ctx.stroke();
	}

	for (var i=0; i<=height; i=i+20) {
	ctx.beginPath();
	ctx.moveTo(0,i);//all grid lines start at zero
	ctx.lineTo(height, i);
	ctx.stroke();
	}
}

function clear(ctx) {
	ctx.clearRect(0,0,ctx.width, ctx.height);
	//var ctx = document.getElementById('permit').getContext('2d');//reset
	//ctx.fillStyle = '#000000';
	//ctx.fill();
}

function arrow (ctx,X1,X2,Y1,Y2,end,radius) {
	//arrow will draw an arrow at the end of a line (lineX and lineY are that line's end coordinates)
	//angle from the line may be specified
	//use tg x to calculate the angle of the line; tan(alpha) = (Y2-Y1)/(X2-X1);
	//radius will be the radius of the circle encompassing the arrow. Defalts to 1
	if(!radius){
	radius = 1;
	}
	
	declive = (Y2-Y1)/(X2-X1);
	if(end==1){ 
		X = X1; Y = Y1; 
		
		LineAngle = Math.atan(declive)+Math.PI;
	}
	else {
		X = X2; Y = Y2; 
		
		LineAngle = Math.atan(declive);
	}
	
	//If declive is positive in canvas, that means it is negative in math because Y grows to the bottom in canvas
	
	
	
	//assume a straight line and build an arrow at 45 angles on each side of the trigonometric circle
	ctx.save();
	ctx.translate(X,Y);
	
	//reduction to the first quadrant (Q1) 
	 if(LineAngle>=0){
	 ctx.rotate(LineAngle-Math.PI/2);
	 }
	 else { 
		 ctx.rotate(LineAngle+Math.PI/2);	
	 }
	
	Xn = Math.cos(Math.PI/4)*radius;
	Yn = -Math.sin(Math.PI/4)*radius; //negative because canvas grows down :( :(
	ctx.moveTo(0,0);
	ctx.lineTo(Xn,Yn);
	ctx.stroke();

	Xp = Math.cos(3*Math.PI/4)*radius;
	Yp = -Math.sin(3*Math.PI/4)*radius;
	ctx.moveTo(0,0);
	ctx.lineTo(Xp,Yp);
	ctx.stroke();

	ctx.restore();
	
}

function color_permission_square(span, pi) {
		
		if(pi=='y' || pi=='Y'){
		span.setAttribute("style", "background-color: green");
		
		}
		else if(pi=='s' || pi=='S'){
		span.setAttribute("style", "background-color: yellow");
		}
		else if(pi=='n' || pi=='N'){
		span.setAttribute("style", "background-color: red");
		}
		else if(pi=='-'){
		span.setAttribute("style", "background-color: silver");
		}
		span.setAttribute("class", "permission_spans");

		span.innerHTML = "&nbsp;"+pi+"&nbsp;";	
		return span;
		}