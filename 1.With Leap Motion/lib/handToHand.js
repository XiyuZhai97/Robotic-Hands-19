/**
 * handToHand
 */
var handToHand = function() {

	// THIS FUNCTION CALCULATE THE ANGLE BETWEEN 2 VECTORS
	var _vectorAngle = function(v1,v2) {

		// FIRST VECTOR COMPONENTS
		var v1_x = v1[0];
		var v1_y = v1[1];
		var v1_z = v1[2];

		// SECOND VECTOR COMPONENTS
		var v2_x = v2[0];
		var v2_y = v2[1];
		var v2_z = v2[2];

		// SCALAR PRODUCT
		var scalarProduct = v1_x*v2_x + v1_y*v2_y + v1_z*v2_z;

		// BOTH VECTOR'S MODULES
		var v1_module = Math.sqrt(v1_x*v1_x+v1_y*v1_y+v1_z*v1_z);
		var v2_module = Math.sqrt(v2_x*v2_x+v2_y*v2_y+v2_z*v2_z);

		// RETRIEVE THE ANGLE (IN RADIANTS) BETWEEN THE 2 VECTORS
		var angle_radians = Math.acos(scalarProduct / (v1_module*v2_module));

		// RADIANTS TO DEGREES CONVERSION
		return angle_radians * 180 / Math.PI;
	};

	// THIS FUNCTION VERIFY THE VALIDITY OF THE ID-SERVOS OBJECT
	var _checkIdsToServos = function(fingers, idsToServos) {

		// SET THE RESULT ON TRUE
		var check = true;

		// FOR EACH FINGER
		for( var j = 0; j < fingers.length; j++ ){

	        // CURRENT FINGER
	        var finger = fingers[j];

	        // CURRENT FINGER ID
	        var finger_id = finger.id;

	        // IF THIS FINGER ID IS NOT PRESENT INSIDE THE ID-SERVO OBJECT THEN SET THE RESULT ON FALSE
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
			servosArray[0] = 'pollice'; // THUMB
			servosArray[1] = 'indice'; // INDEX
			servosArray[2] = 'medio'; // MIDDLE
			servosArray[3] = 'anulare'; // ANNULAR
			servosArray[4] = 'mignolo'; // PINKIE

		var idsToStabilizedX = {};
		var idsToServos = {};
		var sortable = [];

		// FOR EACH FINGER
		for( var j = 0; j < fingers.length; j++ ){

	        // CURRENT FINGER
	        var finger = fingers[j];

	        // CURRENT FINGER ID
	        var finger_id = finger.id;

	        // CURRENT FINGER X COORDINATE
	        var finger_stabilized_x_position = finger.stabilizedTipPosition[0].toFixed(0);

	        // IT IS IMPORTANT TO USE AN OBJECT AND NOT AN ARRAY HERE EVEN IF IT COMPLICATES THE SORTING PROCESS
	        // BECAUSE FINGERS ID CAN ASSUME VERY HIGH VALUES AND USING AN ARRAY MAY PRODUCE EMPTY INDEXES GENERETING BIG AND USELESS ARRAY
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

			// DEBUG
			console.log('COUNTER: '+i+', SERVO NAME: '+this_finger_servo+', FINGER ID: '+this_finger_id+', X_COORDINATE: '+sortable[i][1]);
		};

		return idsToServos;
    	
	};

	// THIS FUNCTION CLOSE ALL NOT DETECTED FINGERS
	var _closeAbsentFingers = function(fingers, idsToServos, servoFinger){

		// BUFFER
		var idsToServosBuffer = {};

		// LET'S CLONE A ID-SERVO DUPLICATE
		for (var key in idsToServos) {

			// SERVO NAME
			var nome_servo = idsToServos[key];

			// FINGER ID
			var id_leap = key;

			// BUFFER OBJECT
			idsToServosBuffer[id_leap] = nome_servo;

        }

        // NOW WE CAN REMOVE ALL DETECTED FINGERS (SO THAT ONLY NOT DETECTED FINGERS WILL REMAIN)
		for( var j = 0; j < fingers.length; j++ ){

			// CURRENT FINGER
			var finger = fingers[j];

        	// CURRENT FINGER ID
        	var finger_id = finger.id;

        	// REMOVE DETECTED FINGERS
        	delete idsToServosBuffer[finger_id];
      		
		}

		// FOR EACH NOT DETECTED FINGER
		for (var key in idsToServosBuffer) {

			// SERVO NAME
			var nome_servo = idsToServosBuffer[key];

			// FINGER ID
			var id_leap = key;

			// LET'S CLOSE THIS FINGER BECAUSE IT WASN'T DETECTED
			_fingerClose(servoFinger, nome_servo);

			// console.log('ID: '+id_leap+', SERVO: '+nome_servo);

        }

	}

	// MAKE A FIST
	var _punch = function(servoFinger){
		servoFinger['mignolo'].max();
		servoFinger['anulare'].max();
		servoFinger['medio'].max();

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		servoFinger['indice'].min();
		servoFinger['pollice'].min();
	}

	// RELAX THE HAND
	var _relax = function(servoFinger){
		servoFinger['mignolo'].min();
		servoFinger['anulare'].min();
		servoFinger['medio'].min();

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		servoFinger['indice'].max();
		servoFinger['pollice'].max();
	}

	// CLOSE A SINGLE FINGER
	var _fingerClose = function(servoFinger, selectedFinger){

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		if(selectedFinger == 'pollice' || selectedFinger == 'indice')
			servoFinger[selectedFinger].min();
		else
			servoFinger[selectedFinger].max();
	}

	// OPEN A SINGLE FINGER
	var _fingerOpen = function(servoFinger, selectedFinger){

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		if(selectedFinger == 'pollice' || selectedFinger == 'indice')
			servoFinger[selectedFinger].max();
		else
			servoFinger[selectedFinger].min();
	}

	// MOVE A SINGLE FINGER
	var _moveFingerTo = function(servoFinger, fingerAngle, servo, oldServoAngles, servoSensibility) {

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		if(servo == 'pollice' || servo == 'indice')
			var servoAngle = (160-(100-fingerAngle)*2.5); // EMPIRICAL CONVERSION, MAY BE DIFFERENT FOR DIFFERENT SERVOS!
        else
          	var servoAngle = (20+(100-fingerAngle)*1.5);  // EMPIRICAL CONVERSION, MAY BE DIFFERENT FOR DIFFERENT SERVOS!

      	// WE MUST BE SURE NOT TO GIVE SERVOS AN ANGLE OUT OF ITS RANGE
		if(servoAngle < 20)
			servoAngle = 20;
		else if (servoAngle > 160)
		  	servoAngle = 160;

		// SOME DEBUG
	  	console.log("THE FINGER "+servo+" IS SET TO: "+fingerAngle+'°');
		console.log("THE FINGER "+servo+" IS MOVING TO: "+servoAngle+'°');

		// NOW IF A PREVIOUS SERVO POSITION IS STORED, WE MUST CALCULATE THE DIFFERENCE
		// BETWEEND THE NEW ANGLE AND THE OLD ONE
		// AND MOVE THE SERVO ONLY IF THE SENSIBILITY THRESHOLD IS EXCEEDED
		if(oldServoAngles[servo] > 0){

			// DIFFERENCE
			var anglesDelta = Math.abs(parseInt(servoAngle)-parseInt(oldServoAngles[servo]));

			// DEBUG
			console.log("ANGLES DIFFERENCE (DELTA): "+anglesDelta+'°');

			// IF THE DIFFERENCE EXCEED SENSIBILITY THRESHOLD THEN WE MOVE THE SERVO
			if(anglesDelta > servoSensibility[servo]){
				oldServoAngles[servo] = servoAngle;
				servoFinger[servo].to(servoAngle);
			}

		// IF THERE ISN'T AN OLD ANGLE STORED WE JUST MOVE THE SERVO
		} else {
			oldServoAngles[servo] = servoAngle;
			servoFinger[servo].to(servoAngle);
		}

	}

	return {
		vectorAngle: 		_vectorAngle,
		checkIdsToServos: 	_checkIdsToServos,
		punch: 				_punch,
		relax: 				_relax,
		fingerClose: 		_fingerClose,
		fingerOpen: 		_fingerOpen,
		refreshIdsToServos: _refreshIdsToServos,
		closeAbsentFingers: _closeAbsentFingers,
		moveFingerTo: 		_moveFingerTo
	};
};

module.exports = handToHand;
