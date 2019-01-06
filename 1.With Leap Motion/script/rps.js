var mode = 0;

var handToHand = function() {

	// 向量角度计算公式 vectorAngle
	var _vectorAngle = function(v1,v2) {

		// 载入向量
		var v1_x = v1[0];
		var v1_y = v1[1];
		var v1_z = v1[2];
		var v2_x = v2[0];
		var v2_y = v2[1];
		var v2_z = v2[2];

		// 获得角度，单位rad
		var dotProduct = v1_x*v2_x + v1_y*v2_y + v1_z*v2_z;
		var v1_magnitude = Math.sqrt(v1_x*v1_x+v1_y*v1_y+v1_z*v1_z);
		var v2_magnitude = Math.sqrt(v2_x*v2_x+v2_y*v2_y+v2_z*v2_z);
		var angle_radians = Math.acos(dotProduct / (v1_magnitude*v2_magnitude));

		// 转换为角度
		return angle_radians* 180 / Math.PI;
	};

	// 手指与舵机映射表
	var _checkIdsToServos = function(fingers, idsToServos) {

		// 判断结果为真
		var check = true;

		// finger.lenght为手指数目，由leapmotion返回
		for( var j = 0; j < fingers.length; j++ ){

	        // 当前leapmotion判断所得手指
	        var finger = fingers[j];

	        // 当前手指对应的手指id
	        var finger_id = finger.id;

	        // 判断当前手指是否符合同预期舵机绑定的手指
	        if(typeof idsToServos[finger_id] === "undefined"){
	        	check = false;
	        	break;
	        }
    	}

    	return check;
	};


	// THIS FUNCTION RENEW THE ID-SERVOS OBJECT
	var _refreshIdsToServos = function(fingers) {

		var servosArray = new Array();
			servosArray[0] = 'THUMB';  // 大拇指
			servosArray[1] = 'INDEX';  // 食指
			servosArray[2] = 'MIDDLE'; // 中指
			servosArray[3] = 'RING';   // 无名指
			servosArray[4] = 'LITTLE'; // 小拇指

		var idsToStabilizedX = {};
		var idsToServos = {};
		var sortable = [];

		// 对于每一根手指
		for( var j = 0; j < fingers.length; j++ ){
	        var finger = fingers[j];
	        var finger_id = finger.id;

	        // 当前手指稳定的x坐标
	        var finger_stabilized_x_position = finger.stabilizedTipPosition[0].toFixed(0);
	        idsToStabilizedX[finger_id] = finger_stabilized_x_position;

    	}

    	// IN ORDER TO SORT THE OBJECT WE FIRST ASSIGN AN ARRAY WITH ALL OBJECT'S VALUES AND THEN WE SORT THE ARRAY
		for (var id_finger in idsToStabilizedX)
			sortable.push([id_finger, idsToStabilizedX[id_finger]]);
			
		// SORT THE ARRAY
		sortable.sort(function(a, b) {return a[1] - b[1]});

		// NOW WE CAN TAKE THE ID-X_COORDINATES SORTED ARRAY AND WE GENERATE THE ID-SERVOS OBJECT
		for (var i = 0; i < sortable.length; i++) {

			// CURRENT FINGER
			var this_finger_id = sortable[i][0];

			// CURRENT FINGER SERVO
			var this_finger_servo = servosArray[i];

			// UPDATE ID-SERVOS OBJECT
			idsToServos[this_finger_id] = this_finger_servo;
			console.log('COUNTER: '+i+', SERVO NAME: '+this_finger_servo+', FINGER ID: '+this_finger_id+', X_COORDINATE: '+sortable[i][1]);
		};

		return idsToServos;
    	
	};

	// 关闭未识别的手指电机
	var _closeAbsentFingers = function(fingers, idsToServos, servoFinger){

		// BUFFER
		var idsToServosBuffer = {};

		// 复制ID-舵机表
		for (var key in idsToServos) {
			var nome_servo = idsToServos[key];
			var id_leap = key;
			idsToServosBuffer[id_leap] = nome_servo;
        	}

        	// 清除表中已识别的手指
		for( var j = 0; j < fingers.length; j++ ){
			var finger = fingers[j];
        		var finger_id = finger.id;
        		delete idsToServosBuffer[finger_id];      		
		}

		// 关闭未识别手指的电机
		for (var key in idsToServosBuffer) {
			var nome_servo = idsToServosBuffer[key];
			var id_leap = key;
			_fingerClose(servoFinger, nome_servo);
        	}

	}
	// 关闭单根手指舵机
	var _fingerClose = function(servoFinger, selectedFinger){

			servoFinger[selectedFinger].max();
	}
	// 开启单根手指电机
	var _fingerOpen = function(servoFinger, selectedFinger){

			servoFinger[selectedFinger].min();
	}
	// 握拳
	var _punch = function(servoFinger){
		servoFinger['LITTLE'].max();
		servoFinger['RING'].max();
		servoFinger['MIDDLE'].max();
		servoFinger['INDEX'].max();
		servoFinger['THUMB'].max();
	}

	// 舒展
	var _relax = function(servoFinger){
		servoFinger['LITTLE'].min();
		servoFinger['RING'].min();
		servoFinger['MIDDLE'].min();
		servoFinger['INDEX'].min();
		servoFinger['THUMB'].min();
	}

	var _scissor = function(servoFinger){
		servoFinger['LITTLE'].max();
		servoFinger['RING'].max();
		servoFinger['MIDDLE'].min();
		servoFinger['INDEX'].min();
		servoFinger['THUMB'].max();
	}
	var _OK = function(servoFinger){
		servoFinger['LITTLE'].min();
		servoFinger['RING'].min();
		servoFinger['MIDDLE'].min();
		servoFinger['INDEX'].max();
		servoFinger['THUMB'].max();
	}



	// 移动单根手指
	var _moveFingerTo = function(servoFinger, fingerAngle, servo, oldServoAngles, servoSensibility) {

		// 大拇指以及中指控制速度较快
		var servoAngle = (20+(100-fingerAngle)*1.5); 
		if(servoAngle < 60)
			servoAngle = 0;
		else if (servoAngle > 100)
		  	servoAngle = 170;

		// 控制台显示
	  	console.log("THE FINGER "+servo+" IS SET TO: "+fingerAngle+'°');
		console.log("THE FINGER "+servo+" IS MOVING TO: "+servoAngle+'°');

		// 防抖
		if(oldServoAngles[servo] > 0){

			// 取绝对值
			var anglesDelta = Math.abs(parseInt(servoAngle)-parseInt(oldServoAngles[servo]));
			if(anglesDelta > servoSensibility[servo]){
				oldServoAngles[servo] = servoAngle;
				servoFinger[servo].to(servoAngle);
			}

		} else {
			oldServoAngles[servo] = servoAngle;
			servoFinger[servo].to(servoAngle);
		}

	}
	var _moveWristTo =function (servoWrist,wristAngle,servo){
		var servoAngle = wristAngle*1.2;
		if(servoAngle < 100)
			servoAngle = 90;
		else if (servoAngle > 150)
		  	servoAngle = 180;
		servoWrist[servo].to(servoAngle)
	  	console.log("THE WRIST IS SET TO: "+wristAngle+'°');
		console.log("THE WRIST IS MOVING TO: "+servoAngle+'°');
	}


	return {
		vectorAngle: 		_vectorAngle,
		checkIdsToServos: 	_checkIdsToServos,
		punch: 				_punch,
		OK:					_OK, 
		scissor: 			_scissor,
		relax: 				_relax,
		fingerClose: 		_fingerClose,
		fingerOpen: 		_fingerOpen,
		refreshIdsToServos: _refreshIdsToServos,
		closeAbsentFingers: _closeAbsentFingers,
		moveFingerTo: 		_moveFingerTo,
		moveWristTo:		_moveWristTo
	};
};

module.exports = handToHand;



/******************************************************************************************************/
/************************************* 程序启动部分****************************************************/
/*****************************************************************************************************/


// 导入所需模组以及脚本
var 	five = require("johnny-five"),
	Leap = require("../lib/index"),
	board, servo;

// 分配 ARDUINO
board = new five.Board();

// 分配舵机分辨率阈值
servoSensibility = {'THUMB': 0, 'INDEX': 0, 'MIDDLE': 0, 'RING': 0, 'LITTLE': 0};


// 分配LeapMotion控制器
var controller = new Leap.Controller()

// 建立手指和舵机分配表
var idsToServos = {};

// 手指尖x坐标
var idsToStabilizedX = {};

// 存储上一帧舵机角度
var oldServoAngles = {};

// 创建舵机数组
var servoFinger = new Array();
var servoWrist  = new Array();

// 分配变量给handToHand的lib /lib/handToHand
handToHand = new handToHand();

/********************************************************************************************************/
/*************************************Arduino与舵机控制 *************************************************/
/*******************************************************************************************************/

board.on("ready", function() {

	// 舵机连接PWM输出

	// 小拇指
	servoFinger['LITTLE'] = new five.Servo({
		pin: 3, // Servo 1
		range: [0, 150], //  0-180
		type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
		startAt: 30, // 初始角度
		center: false // overrides startAt if true and moves the servo to the center of the range
	});

	// 无名指
	servoFinger['RING'] = new five.Servo({
		pin: 5, 
		range: [0, 180], 
		type: "standard", 
		startAt: 30, 
		center: false 
	});

	// 中指
	servoFinger['MIDDLE'] = new five.Servo({
		pin: 6, 
		range: [0, 180], 
		type: "standard", 
		startAt: 30, 
		center: false 
	});

	// 大拇指
	servoFinger['THUMB'] = new five.Servo({
		pin: 9, 
		range: [0, 180], 
		type: "standard", 
		startAt: 30, 
		center: false 
	});

	// 食指
	servoFinger['INDEX'] = new five.Servo({
		pin: 10, 
		range: [0, 180], 
		type: "standard", 
		startAt: 30, 
		center: false 
	});
	//手腕
	servoWrist ['WRIST'] = new five.Servo({
		pin: 11, 
		range: [90, 180], 
		type: "standard", 
		startAt: 150, 
		center: false 
	});


	// 获取Leapmotion单帧
	controller.on("frame", function(frame) {

		 // 手的数目
	    var nHands = frame.hands.length;
	    if(nHands == 1){
	    	console.log("我看到了一个手嘿嘿嘿~");
  			var hand = frame.hands[0];
  			// 获取手指数据
  			var finger_obj = hand.fingers;
  			// 手指数目
  			detectedFingers = finger_obj.length;
  			console.log("伸出了"+ detectedFingers+"手指");
  				// 判断舵机与手指是否一一映射，否则刷新
  				if(handToHand.checkIdsToServos(finger_obj, idsToServos) == false){
  					console.log("张开手掌,让叔叔康康");
  					if(detectedFingers == 5){
						delete idsToServos;
						idsToServos = {};
						idsToServos = handToHand.refreshIdsToServos(finger_obj);
					}
  				} else {
  					if(mode == 1){
	  						if(detectedFingers >= 4){
			        			handToHand.scissor(servoFinger);
			        		    console.log("Me scissor");
	        				}else if(detectedFingers <= 1){
			        			handToHand.relax(servoFinger);
		        		    	console.log("Me Paper");
	        				}else{
			        			handToHand.punch(servoFinger);
			        		    console.log("Me Rock");
	        				}
        				}else if(mode == 0){
        					if(detectedFingers < 5){
						
								// FIND AND CLOSE ABSENT FINGERS
								handToHand.closeAbsentFingers(finger_obj, idsToServos, servoFinger);

								}
							for( var j = 0; j < detectedFingers; j++ ){
									var this_finger = finger_obj[j];
					        		// 由leapmotion 获取手指
					        		var this_finger_id = this_finger.id;
					        		// 映射电机
					        		var servo = idsToServos[this_finger_id];
					        		// 计算角度
					        		var fingerAngle = handToHand.vectorAngle(hand.palmNormal, this_finger.direction).toFixed(0);
									//var wristAngle  = handToHand.vectorAngle(hand.palmNormal, [1,1,0]).toFixed(0);
									// 移动舵机
					      			handToHand.moveFingerTo(servoFinger, fingerAngle, servo, oldServoAngles, servoSensibility);
									//handToHand.moveWristTo(servoWrist,wristAngle,'WRIST');
							}
						}
					}
  			}
	    else {
	    	handToHand.OK(servoFinger);
			delete idsToServos;
			idsToServos = {};
			//process.stdin.setRawMode(true);
			var keypress = require('keypress');
			keypress(process.stdin);
			console.log("输入m进行模仿，r进行猜拳");
			process.stdin.on('keypress', function (ch, key) {
		  		if (key &&  key.name == 'm') {
			  		console.log("进入模仿模式");
			  		mode = 0;
		  		}else if (key &&  key.name == 'r') {
			  		console.log("进入猜拳模式");
			  		mode = 1;
		  		}
			});
			process.stdin.setRawMode(true);
	    	//console.log("妈耶，放个手好不啦");
	    	
	    }
	    	

	});


}); 


/*********************************************************************************************************/
/******************************** LEAP MOTION 状态以及连接************************************************/
/********************************************************************************************************/

controller.on('ready', function() {
    console.log("Leap Motion is ready...");
});

controller.on('deviceConnected', function() {
    console.log("Leap Motion is connected...");
});

controller.on('deviceDisconnected', function() {
    console.log("Leap Motion is disconnected...");
});

controller.connect();


