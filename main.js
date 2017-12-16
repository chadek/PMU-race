
/*
règles de syntaxe :
- tous les noms de variables en camelCase
- ajouter Selector derrière le nom de la variable quand celle cie est un élément du DOM
*/


/* -------------------------
 menu variables & listeners
---------------------------- */

var menuScreenSelector = document.querySelector("#menu-screen");

var playerNumberSelector 	= document.querySelector("#player-number");
var playerNumber 			= playerNumberSelector.options[playerNumberSelector.selectedIndex].value;
playerNumberSelector.addEventListener('change', changePlayerNumber);

var playerHolderSelector = document.querySelector("#players-holder");

var buttonRules = document.querySelector("#button-rules");
buttonRules.addEventListener('click', showRules);
var buttonStart = document.querySelector("#button-start");
buttonStart.addEventListener('click', startRace);

var playersData = [];

/* -------------------------------
 game board variables & selectors
---------------------------------- */

var APILoaded = false;

/* -------------
 menu functions
---------------- */


function changePlayerNumber() {
	playerNumber = playerNumberSelector.options[playerNumberSelector.selectedIndex].value;
	
	for(var i=0; i<8; i++) {
		if (i < playerNumber) {
			showMenuPlayer(i);
		} else {
			hideMenuPlayer(i);
		}
	}
}

function showMenuPlayer(i) {
	//shows the menu line for player i
	var waitTime = 80 * i;
	
	setTimeout(function () {
		playerHolderSelector.children[i].classList.remove("hidden");
		playerHolderSelector.children[i].classList.remove("pickDown");
	}, waitTime);
}

function hideMenuPlayer(i) {
	//hide the menu line for player i
	var waitTime = 80 * (8 - Math.max(0, i - playerNumber));
	
	setTimeout(function () {
		playerHolderSelector.children[i].classList.add("pickDown");
	}, waitTime);
	
	setTimeout(function () {
		playerHolderSelector.children[i].classList.add("hidden");
   	}, waitTime + 400);			
}


function showRules () {
	event.preventDefault();
	javascript:location.href='#rules';
}

function startRace () {
	event.preventDefault();
	getPlayersData();
	hideMenuScreen();
	initGameScreen();
}

function hideMenuScreen() {
	menuScreenSelector.classList.add("exit-screen-left");
	
	setTimeout(function () {
		menuScreenSelector.classList.add("hidden");
   	}, 400);
}   	

function getPlayersData () {
	//store players names, horses & bets
	
	for(var i=0; i<playerNumber; i++) {

		var playerName = document.querySelector("#menu-player"+(i+1)+" .player-name").value;
		if (playerName == "") {
			playerName = "Joueur "+(i+1);
		}
		var playerHorseSelector = document.querySelector("#menu-player"+(i+1)+" .player-horse");
		var playerBetSelector = document.querySelector("#menu-player"+(i+1)+" .player-bet");
		
		var currPlayer = {
			name: playerName,
			horse: playerHorseSelector.options[playerHorseSelector.selectedIndex].value,
			bet: playerBetSelector.options[playerBetSelector.selectedIndex].value,
		};

		playersData.push(currPlayer);
	}
	console.log(playersData);
}


/* -------------
 game functions
---------------- */

function initGameScreen () {
	showGameScreen();
	if (APILoaded) {
		resetAPI();
	}
	else {
		setupAPI();
		APILoaded = true;
	}
}

function showGameScreen() {

}

function setupAPI() {
	
}

function reserAPI() {

}
