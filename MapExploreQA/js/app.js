(function() {

// Global variables
  var app = angular.module('Illustrations', []);
  var URL = "http://mapexplore-qa.appspot.com/";
  var nextMap = 0; // for cycling through maps

  var maps = [
  	{"name" : "Europa", "image" : "./images/blaue_europe.jpg"},
  	{"name" : "America", "image" : "./images/the-united-states-of-america-map.gif"},
  	{"name" : "Philadelphia", "image" : "./images/Philadelphia_Downtown_map.jpg"},
  ]

// Main ctrl
app.controller('MainCtrl', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {

    // Enable or disable edit mode
    $scope.toggleEditMode = function(){
    	if($scope.editMode){
    		$scope.editMode = false;

    		// hide buttons
    		var buttons = document.getElementsByClassName("locationButton");
    		for (var i = 0; i < buttons.length; i++){
    			buttons[i].style.opacity = 0;
    		}

    		// make content areas uneditable
    		document.getElementById("infoContent").contentEditable = "false";
    		document.getElementById("infoTitle").contentEditable = "false";
    	}
    	else {
    		$scope.editMode = true;

    		// make buttons visible
    		var buttons = document.getElementsByClassName("locationButton");
    		for (var i = 0; i < buttons.length; i++){
    			buttons[i].style.opacity = 1;
    		}

    		// make content areas editable
    		document.getElementById("infoContent").contentEditable = "true";
    		document.getElementById("infoTitle").contentEditable = "true";
    	}
    }

    $scope.saveButton = function(){
	    if (document.getElementById("editMode").checked) {
	    	$scope.mapData[$scope.mapLocation]["Title"] = document.getElementById("infoTitle").innerHTML;
	    	$scope.mapData[$scope.mapLocation]["Content"] = document.getElementById("infoContent").innerHTML;

	    	// Update server
	    	var xmlHttp = new XMLHttpRequest();
		    xmlHttp.open("POST", URL + "write" + "?Map=" + $scope.mapName, true );
		    xmlHttp.send(JSON.stringify($scope.mapData));

	    	// Notify user that operation is complete
	    	alert("Location info saved.");
	    }

	    else{
	    	alert("Not in edit mode.");
	    }
    }

    $scope.deleteButton = function(){
    	if (document.getElementById("editMode").checked) {
	    	var buttons = document.getElementsByClassName("locationButton");

	    	// Remove Button from data and from HTML
	    	$scope.mapData.splice($scope.mapLocation, 1);
	    	document.getElementById("mapArea").removeChild(buttons[$scope.mapLocation]);

	    	// Decrement button IDs accordingly based on which element was deleted
	    	for (var i = 0; i < buttons.length; i++){
	    		if (parseInt(buttons[i].id) > $scope.mapLocation){
	    			buttons[i].id = parseInt(buttons[i].id) - 1;
	    		}
	    	}

	    	// Update server
	    	var xmlHttp = new XMLHttpRequest();
		    xmlHttp.open("POST", URL + "write" + "?Map=" + $scope.mapName, true );
		    xmlHttp.send(JSON.stringify($scope.mapData));

	    	// Notify user that operation is complete
	    	alert("Location info deleted.");

	    	$scope.closeInfoPanel();
    	}

    	else{
	    	alert("Not in edit mode.");
	    }
    }

    $scope.closeInfoPanel = function(){
		var target = document.getElementById("infoPanel");
		target.style.visibility = "hidden";

		if (document.getElementById("editMode").checked) {
			$scope.editMode = true;

			// make buttons visible
			var buttons = document.getElementsByClassName("locationButton");
			for (var i = 0; i < buttons.length; i++){
				buttons[i].style.opacity = 1;
			}
		}
    }

    $scope.mapButtonClicked = function(event){

	// hide buttons
	var buttons = document.getElementsByClassName("locationButton");
	for (var i = 0; i < buttons.length; i++){
		buttons[i].style.opacity = 0;
	}

	// Open panel
	var target = document.getElementById("infoPanel");
	target.style.visibility = "visible";
	$scope.editMode = false;

	// Populate fields
	$scope.mapLocation = parseInt(event.target.id); // get the correct location index for the mapData array
	document.getElementById("infoTitle").innerHTML = $scope.mapData[$scope.mapLocation ]["Title"];
	document.getElementById("infoContent").innerHTML = $scope.mapData[$scope.mapLocation]["Content"];

    }

    function mapClicked(e) {
	    var X = e.clientX-225 + "px";
	    var Y = e.clientY-25 + "px";
	    var defaultLocation = {"Title": "Location Title", "Content": "This is where you put the description.", "mapX": X, "mapY": Y};

	    if(e.target.tagName != "BUTTON" && $scope.editMode == true){ // check to make sure there is not already an overlapping button and we're in edit mode
	    	placeButton(defaultLocation);
		}
	}

	function placeButton (data) {
		// create button
	    var btn = document.createElement("BUTTON");
	    btn.style.left = data["mapX"];
		btn.style.top = data["mapY"];
	    btn.className = "locationButton";
	    btn.onclick = $scope.mapButtonClicked;

	    if (!$scope.editMode){ btn.style.opacity = 0;} // set non visible if edit mode is off

	    btn.id = $scope.mapData.length; // for retrieving the right location when the user clicks the button later

	    document.getElementById("mapArea").appendChild(btn);

	    // Update map data
	    var location = {"Title": data["Title"], "Content": data["Content"], "mapX": data["mapX"], "mapY": data["mapY"]};
	    $scope.mapData.push(location);
	}

	function initializeMap(){
		for (var i in data){
			placeButton(data[i]);
		}
	}

	this.changeMap = function(){
		// Edit mode, true for visible buttons and button placing, false for interactive map mode
		$scope.editMode = false;
		document.getElementById("editMode").checked = false;

		// Remove all current buttons and change background image
		var mapArea = document.getElementById("mapArea");
		var numButtons = document.getElementsByClassName("locationButton").length;

		for (var i = 0; i < numButtons; i++) {
			mapArea.removeChild(mapArea.lastChild); // kind of dangerous since this relies on the button children being the last children but I can refactor later
		}

		mapArea.style.backgroundImage = "url(" + maps[nextMap]["image"] + ")";

		// Current map and map location data
		$scope.mapName = maps[nextMap]["name"];
		$scope.mapData = [];
		$scope.mapLocation = 0;

		// Get data from server, catch error if server not found
		try {
		    var xmlHttp = new XMLHttpRequest();
		    xmlHttp.open( "GET", URL + "info" + "?Map=" + $scope.mapName, false );
		    xmlHttp.send(null);
		    data = JSON.parse(xmlHttp.responseText); // product data from HTTP get request

		    initializeMap(); // translate the json into actual map locations
		}
		catch (err){
			alert(err.message)
		}

		// update nextMap index, cycling back to 0 if this is the last map in the array
		if (nextMap == maps.length-1){
			nextMap = 0;
		}
		else{
			nextMap++;
		}
	}

	// Initialize Default Map
	this.changeMap();

	// Current User
	$scope.username = "Ben Greenfield";

	// Mouse click listener
    var target = document.getElementById("mapArea");
	target.addEventListener("click", mapClicked);

}]);

  




})();
