
/*
règles de syntaxe :
- tous les noms de variables en camelCase
- ajouter Selector derrière le nom de la variable quand celle cie est un élément du DOM
*/


/* ---------------
 common variables
------------------ */

var debug = true;

var activeScreen = "menu";

/*dev line : to remove later !!!*/
activeScreen = "game";


/* -------------------------
 menu variables & listeners
---------------------------- */

var menuScreenSelector = document.querySelector("#menu-screen");

var playerNumberSelector 	= document.querySelector("#player-number");
var playerNumber 			= playerNumberSelector.options[playerNumberSelector.selectedIndex].value;
playerNumberSelector.addEventListener('change', changePlayerNumber);

var playerHolderSelector = document.querySelector("#players-holder");

/*buttons*/
var buttonRules = document.querySelector("#button-rules");
buttonRules.addEventListener('click', showRules);
var buttonStart = document.querySelector("#button-start");
buttonStart.addEventListener('click', startRace);

var playersData = [];

/* -------------------------------
 game board variables & listeners
---------------------------------- */

var gameScreenSelector = document.querySelector("#game-screen");

var nextTurnAvailable = true; /*cooldown to wait before toggling next turn*/

/*variables to insert cards in deck*/
var decksSelector = document.getElementsByClassName("deck-card-holder");
var deckStyle = window.getComputedStyle(decksSelector[0]);
var deckWidth = deckStyle.getPropertyValue('width');

var deckCardsSelector = document.getElementsByClassName('deck-card');
var deckCardStyle = window.getComputedStyle(deckCardsSelector[0]);
var deckCardWidth = deckCardStyle.getPropertyValue('width');

/*variables to insert cards in holders*/
var cardHoldersSelector = document.getElementsByClassName("card-holder");
var cardHolderStyle = window.getComputedStyle(cardHoldersSelector[0]);
var cardHolderWidth = cardHolderStyle.getPropertyValue('width');

var cardsSelector = document.getElementsByClassName('card');
var cardStyle = window.getComputedStyle(cardsSelector[0]);
var cardWidth = cardStyle.getPropertyValue('width');

/*buttons*/
var buttonNextTurn = document.querySelector("#next-turn");
buttonNextTurn.addEventListener('click', nextTurn);

var buttonSeeResults = document.querySelector("#see-results");
buttonSeeResults.addEventListener('click', seeResults);

/*deck cards to animate*/
var deckCardPick = document.querySelector("#deck-face-down .top-card");
var deckCardDropTop = document.querySelector("#deck-face-up .top-card");
var deckCardDropBottom = document.querySelector("#deck-face-up .bottom-card");

/*horses variables*/


/*API variables*/
var deckId = "";
var APIState; //var to control the state of the API & decide what to do next
var deckCards = []; //API data about the deck cards
var aces = []; //API data about the four aces
var sideTrackDeck = []; //API data about the cards on the side of the track
var request = new XMLHttpRequest();
var requestData;

/* ---------------
 common functions
------------------ */

window.onresize = function(event) {
	if (activeScreen == "game") { 
		insertCardsinDesk();   
		insertCardsinHolders();
	}
};

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
		playerHolderSelector.children[i].classList.remove("pick-line");
	}, waitTime);
}

function hideMenuPlayer(i) {
	//hide the menu line for player i
	var waitTime = 80 * (8 - Math.max(0, i - playerNumber));
	
	setTimeout(function () {
		playerHolderSelector.children[i].classList.add("pick-line");
	}, waitTime);
	
	setTimeout(function () {
		playerHolderSelector.children[i].classList.add("hidden");
   	}, waitTime + 400);			
}


function showRules () {
	/*show the game rules at the bottom of the menu screen*/
	event.preventDefault();
	javascript:location.href = '#rules';
}

function startRace () {
	/*go to game screen & start the race*/
	event.preventDefault();
	getPlayersData();
	hideMenuScreen();
	initGameScreen();
}

function hideMenuScreen() {
	menuScreenSelector.classList.add("exit-screen-left");
	
	setTimeout(function () {
		menuScreenSelector.classList.add("hidden");
   	}, 200);
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
	if (debug) {
		console.log("playersData : ");
		console.log(playersData);
	}
}


/* ------------
 API functions
--------------- */

request.onreadystatechange = function() {
  if (request.readyState == 4 && request.status == 200) {
  	
    requestAnswered();
  }
};

function requestAnswered(){
	requestData = JSON.parse(request.responseText);
	if (debug) {
		console.log("APIState : " + APIState);
		console.log("requestData : ");
		console.log(requestData);
	}
	switch (APIState) {
	  	case "init":
			deckId = requestData.deck_id;
			drawCards(52);
			break;
		case "gameDrawn":
			deckCards = requestData.cards;
			makeAcesPile();
			if (debug) {
				console.log("aces :");
				console.log(aces);
			}
			makeSideTrackPile();
			if (debug) {
				console.log("sideTrackDeck :");
				console.log(sideTrackDeck);
			}
			break;
		default:
			break;
	}
}


/* -------------
 game functions
---------------- */

function initGameScreen () {
	showGameScreen();
	activeScreen = "game";
	setupAPI();
}

function showGameScreen() {
	/*enable the game screen*/

	setTimeout(function () {
		gameScreenSelector.classList.remove("hidden");
		insertCardsinDesk();
		insertCardsinHolders();
	},200);
}

function setupAPI() {
	/*create a deck of cards with the API*/
	APIState = "init";
	request.open('GET', "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", true);
	request.send();
}

function drawCards(x) {
	//request the api to draw x cards from the deck
	//(no deckId is given as parameter because it is global and we will use only one deck)
	APIState = "gameDrawn";
	request.open('GET', "https://deckofcardsapi.com/api/deck/"+deckId+"/draw/?count="+x, true);
	request.send();
}

function makeAcesPile() {
	//store the 4 aces in a separate list
	var tmpCard;
	for (i=0; i<deckCards.length; i++) {
		if (deckCards[i].value == "ACE") {
			tmpCard = deckCards.splice(i, 1)[0];
			tmpCard.position = 0; //the position properti will give info about the position of the card/horse during the race
			aces.push(tmpCard);
		}
	}
}

function makeSideTrackPile() {
	//store the 5 cards on the side of the track in a separate list
	sideTrackDeck = deckCards.splice(0, 5);
}


function insertCardsinDesk() {
	/*compute the CSS style for the deck card 
	(because it's been rotated so it sucks)*/
	deckStyle = window.getComputedStyle(decksSelector[0]);
	deckWidth = deckStyle.getPropertyValue('width');

	for(i=0; i<deckCardsSelector.length; i++) {
		deckCardsSelector[i].style.height = deckWidth;
	}

	deckCardStyle = window.getComputedStyle(deckCardsSelector[0]);
	 deckCardWidth = deckCardStyle.getPropertyValue('width');

	for(i=0; i<decksSelector.length; i++) {
		decksSelector[i].style.height = deckCardWidth;
	}
}
insertCardsinDesk();


function insertCardsinHolders() {
	/*compute the CSS style for the card on the board
	 (because it's been rotated so it sucks)*/
	cardHolderStyle = window.getComputedStyle(cardHoldersSelector[0]);
	cardHolderWidth = cardHolderStyle.getPropertyValue('width');

	for(i=0; i<cardsSelector.length; i++) {
		cardsSelector[i].style.height = cardHolderWidth;
	}

	cardStyle = window.getComputedStyle(cardsSelector[0]);
	 cardWidth = cardStyle.getPropertyValue('width');

	for(i=0; i<cardHoldersSelector.length; i++) {
		cardHoldersSelector[i].style.height = cardWidth;
	}

}
insertCardsinHolders();



function nextTurn () {
	if (nextTurnAvailable) {
		nextTurnAvailable = false;
		if (debug) {console.log("nextTurn");}
		takeCardFromDeck();
		loadDropCard();
		dropCardOnDeck();
		/*
		- move forward the card with the color of the deck card face up that's been loaded
		- check if someone won th race
		else
			- check if one side track card must be returned & do it
			- move back the card with the color of the side card tht's been returned
		*/
		coolDownNextTurn();
	}
}

function takeCardFromDeck () {
	/*animation for taking a card from the deck*/
	deckCardPick.classList.remove("pick-deck-card");

	setTimeout(function () {
		/*20ms of delay to prevent stupid lag*/
		deckCardPick.classList.add("pick-deck-card");	
	},20);
}

function loadDropCard() {
	/*load the next card to draw from the deck API*/

}

function dropCardOnDeck () {
	/*animation to drop the card face up on the deck*/
	setTimeout(function () {
		deckCardDropTop.classList.remove("drop-deck-card");
	},400);
	setTimeout(function () {
		/*20ms of delay to prevent stupid lag*/
		deckCardDropTop.classList.remove("hidden");
		deckCardDropTop.classList.add("drop-deck-card");
		copyTopBottomDeckCards();
	},420);
}

function copyTopBottomDeckCards () {
	/*copy the top card face up of the deck to bottom card face up 
	to prepare for next turn animation*/
	setTimeout(function () {
		deckCardDropBottom.src = deckCardDropTop.src;
		deckCardDropTop.classList.add("hidden");
	},400);
}


function coolDownNextTurn() {
	/*wait some time before enabling the next turn*/
	setTimeout(function () {
		nextTurnAvailable = true;
	},700);
}


function seeResults() {
	/*Load the resulsts screen*/

}