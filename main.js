
/*
règles de syntaxe :
- tous les noms de variables en camelCase
- ajouter Selector derrière le nom de la variable quand celle-ci est un élément du DOM
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
var buttonTop = document.querySelector("#button-top");
buttonTop.addEventListener('click', goToTop);

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

/*deck variables*/
var deckDiv = document.querySelector("#deck-face-down");
deckDiv.addEventListener('click', nextTurn);
var deckCardPick = document.querySelector("#deck-face-down .top-card");
var deckCardDropTop = document.querySelector("#deck-face-up .top-card");
var deckCardDropBottom = document.querySelector("#deck-face-up .bottom-card");
var deckCardId = 0; //Id of the next card to draw from the API deck

var gameBoardSelector = document.querySelector("#game-board");

/*track side variables*/
var trackSideCardsBottom = document.querySelectorAll('.track-card .bottom-card');
var trackSideCardsTop = document.querySelectorAll('.track-card .top-card');

/*Aces variables*/
var aceHoldersSelector = document.querySelectorAll('.track .card-holder');
var acesSelector = document.querySelectorAll('.track .card');

/*API variables*/
var deckId = "";
var APIState; //var to control the state of the API & decide what to do next
var deckCards = []; //API data about the deck cards
var aces = []; //API data about the four aces
var sideTrackDeck = []; //API data about the cards on the side of the track
var request = new XMLHttpRequest();
var requestData;

var raceInfos = { 
	/*infos sur la course pour 
	-savoir si une carte doit aller en arrière
	-déterminer la victoire
	-écrire les commentaires*/
	firstId:0,
	lastId:0,
	nextSideCard:-1,
	nbTurns:0,
	raceOver:false
}
var prevRaceInfos = {};
Object.assign(prevRaceInfos,raceInfos); //copy
//infos du tour précedent, 
//pour comparer et faire des commentaires

var gameCommentary = document.querySelector('#game-commentary');

/* ---------------------------------
 results screen variables & listeners
------------------------------------ */

var resultsScreenSelector = document.querySelector("#results-screen");

/*buttons*/

var backToRace = document.querySelector("#back-to-race");
backToRace.addEventListener('click', backTo);
var newRace = document.querySelector("#new-race");
newRace.addEventListener('click', backToMenu);

/* ---------------
 common functions
------------------ */


window.onresize = function(event) {
	if (activeScreen == "game") { 
		insertCardsinDesk();   
		insertCardsinHolders();
		resizeGameBoard();		
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

function goToTop () {
	document.documentElement.scrollTop = 0;
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
		resizeGameBoard();	
	},200);
}

function setupAPI() {
	/*create a deck of cards with the API*/
	APIState = "init";
	request.open('GET', "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", true);
	request.send();
}

request.onreadystatechange = function() {
	/*API request came back*/
	if (request.readyState == 4 && request.status == 200) {
    	requestAnswered();
  	}
};

function requestAnswered(){
	/*do stuff with the request*/
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
			loadSideTrackCards();
			loadAces();
			break;
		default:
			break;
	}
}

function loadAces() {
	for (i=0; i<4; i++) { //causes bugs for unknown reason -> normally fixed
		acesSelector[i].src = aces[i].image;
		acesSelector[i].classList.remove("hidden");		
	}
}

function loadSideTrackCards() {
	for (i=0; i<5; i++) {
		trackSideCardsTop[i].src = sideTrackDeck[i].images.png;
	}
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
	for (i=deckCards.length-1; i>=0; i--) { //reverse loop because splice changes superior indexes
		if (deckCards[i].value == "ACE") {
			tmpCard = deckCards.splice(i, 1)[0];
			tmpCard.position = 0; //the position property will give info about the position of the card/horse during the race
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


function resizeGameBoard() {
	gameBoardSelector.style.width = (parseInt(cardStyle.getPropertyValue('height'))*7)+"px";
}

function nextTurn () {
	if (nextTurnAvailable) {
		nextTurnAvailable = false;
		raceInfos.nbTurns++;
		if (debug) {console.log("nextTurn");}
		loadDropCard();
		
		updateDeck();

		setTimeout(function () {
			moveAceFwd();
			updateRaceInfos();

			setTimeout(function () {
				console.log("prevRaceInfos");
				console.log(prevRaceInfos);
				if (raceInfos.nextSideCard > prevRaceInfos.nextSideCard) {	
					updateTrackSide();

					setTimeout(function () {
						moveAceBkw();
						updateRaceInfos();
					},800);
				}
				SayAComment();
				checkIfRaceIsOver();
				if (raceInfos.raceOver) {
					endRace();
				} else {
					Object.assign(prevRaceInfos,raceInfos); //copy			

				}
			},800);
			coolDownNextTurn();
		},800);
		
		/*
		- print comment
		- check if someone won the race
		*/

	}
}

function checkIfRaceIsOver () {
	console.log("aces[raceInfos.firstId].position : " + aces[raceInfos.firstId].position);
	if (aces[raceInfos.firstId].position >= 6) {
		raceInfos.raceOver = true;
	}
}

function SayAComment() {

	var maxPosition;
	var position_1 = aces[0].position;
	var position_2 = aces[1].position;
	var position_3 = aces[2].position;
	var position_4 = aces[3].position;
	raceInfos;

	for (var i=4 ; i>0 ; i--) {
		//Afficher le premier + déterminer la position max
		for (j=0 ; j<4 ; j++) {
			if (aces[j].position == i) {
				gameCommentary.innerHTML = "Le poulain de la piste N° " + (raceInfos.firstId+1) + " est en tête !";
				maxPosition = aces[raceInfos.firstId].position;
				console.log('maxposition:' + maxPosition);
				console.log('i: ' + i);
			}
		}
		//Afficher les ex aequo de la première place
		for (var k=0 ; k<4 ; k++) {
			if (aces[k].position == maxPosition && k != raceInfos.firstId) {
				console.log("k: " + k);
				gameCommentary.innerHTML = " Le poulain de la piste N°" + (k+1) + " rattrape le premier !"
				+ " Il y a maintenant égalité entre le N°" + (k+1) + " et le N°" + (raceInfos.firstId+1) + " !";
			}
		}
		//Afficher le recul d'une carte -> marche pas
		for (var l=0 ; l<4 ; l++) {
			var position = aces[l].position;
			if (aces[l].position == position-1) {
				console.log("l:" + l);
				console.log("aces[l].position :" + aces[l].position);
				console.log("aces[l].position-1 :" + (aces[l].position)-1);
				gameCommentary.innerHTML += " Le poulain de la piste N°" + (0) + " a reculé d'un pas !";
			}
		}
	}
	// Ex Aequo du reste de la course
	// if (position_1 == position_2 && position_2 == position_3 && position_3 == position_4) {
	// 	gameCommentary.innerHTML = "Tout le monde est ex aequo !";
	// }
	// if (position_1 == position_2) {
	// 	gameCommentary.innerHTML += " Les poulains de la piste 1 et 2 sont ex aequo !";
	// }
	// if (position_2 == position_3) {
	// 	gameCommentary.innerHTML += " Les poulains de la piste 2 et 3 sont ex aequo !";
	// }
	// if (position_3 == position_4) {
	// 	gameCommentary.innerHTML += " Les poulains de la piste 3 et 4 sont ex aequo !";
	// }
	// if (position_4 == position_2) {
	// 	gameCommentary.innerHTML += " Les poulains de la piste 3 et 4 sont ex aequo !";
	// }

}


function moveAceBkw() {
	//checks which Ace needs to move bkw & moves it
	for (i=0; i<4; i++) {
		if (sideTrackDeck[raceInfos.nextSideCard].suit == aces[i].suit) {
			
			aces[i].position--;

			aceHoldersSelector[i].classList.remove("move-card-right");
			aceHoldersSelector[i].classList.remove("move-card-left");

			setTimeout(function (i) {
				/*20ms of delay to prevent stupid lag*/
				var marginLeftTmp = 14.29*aces[i].position;
				aceHoldersSelector[i].style.marginLeft = ""+marginLeftTmp+"%";
				aceHoldersSelector[i].classList.add("move-card-left");
			},20,i);
		}
	}
}

function updateTrackSide() {
	if (raceInfos.nextSideCard < 5) {
		trackSideCardsBottom[raceInfos.nextSideCard].classList.add("pick-track-card");
		setTimeout(function () {
			trackSideCardsTop[raceInfos.nextSideCard].classList.remove("hidden");
		},400);
	}
}

function updateRaceInfos () {
	for (i=0; i<4; i++) {
		console.log("aces["+i+"].position" + aces[i].position);
		if (aces[raceInfos.lastId].position > aces[i].position) {
			raceInfos.lastId = i;
		}
		if (aces[raceInfos.firstId].position < aces[i].position) {
			raceInfos.firstId = i;
		}
	}
	raceInfos.nextSideCard = Math.max(raceInfos.nextSideCard, aces[raceInfos.lastId].position-1);
	console.log("raceInfos");
	console.log(raceInfos);
}

function moveAceFwd() {
	//checks wich Ace needs to move fwd & moves it
	for (i=0; i<4; i++) {
		if (deckCards[deckCardId-1].suit == aces[i].suit) {
			
			aces[i].position++;

			aceHoldersSelector[i].classList.remove("move-card-right");
			aceHoldersSelector[i].classList.remove("move-card-left");

			setTimeout(function (i) {
				/*20ms of delay to prevent stupid lag*/
				var marginLeftTmp = 14.29*aces[i].position;
				aceHoldersSelector[i].style.marginLeft = ""+marginLeftTmp+"%";
				aceHoldersSelector[i].classList.add("move-card-right");
			},20,i);
		}
	}
}


function loadDropCard() {
	/*load the next card to draw from the deck API*/
	deckCardDropTop.src = deckCards[deckCardId].images.png;
	deckCardId++;
}



function updateDeck () {
	/*animation for taking a card from the deck*/
	deckCardPick.classList.remove("pick-deck-card");

	setTimeout(function () {
		/*20ms of delay to prevent stupid lag*/
		deckCardPick.classList.add("pick-deck-card");	
	},20);

	setTimeout(function () {
	/*animation to drop the card face up on the deck*/
	deckCardDropTop.classList.remove("drop-deck-card");
	},420);

	setTimeout(function () {
		/*20ms of delay to prevent stupid lag*/
		deckCardDropTop.classList.remove("hidden");
		deckCardDropTop.classList.add("drop-deck-card");
		copyTopBottomDeckCards();
	},440);
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
	},500);
}

function endRace() {
	console.log ("WIIIIIIIIN");
	gameCommentary.innerHTML = "Et c'est le poulain de la piste N° " + (raceInfos.firstId+1) + " qui remporte la victoire !";
}

function seeResults() {
	/*Load the results screen*/
	activeScreen = "results";

	gameScreenSelector.classList.add("exit-screen-left");
	setTimeout(function () {
		gameScreenSelector.classList.add("hidden");
   	}, 400);

	setTimeout(function () {
		resultsScreenSelector.classList.remove("hidden");
	}, 400);
	resultsScreenSelector.classList.add("enter-screen-right");

	var winner = raceInfos.firstId
	//console.log("porrrrr");

}

/* Functions for buttons in results sreen */

function backTo() {
	/* Back to Race */
	activeScreen="game";

	setTimeout(function () {
		gameScreenSelector.classList.remove("hidden");
	}, 400);
	gameScreenSelector.classList.add("enter-screen-left");

	resultsScreenSelector.classList.add("exit-screen-right");
	setTimeout(function () {
		resultsScreenSelector.classList.add("hidden");
	}, 400);

}

function backToMenu () {

	activeScreen="menu";

	resultsScreenSelector.classList.add("exit-screen-right");
	setTimeout(function () {
		resultsScreenSelector.classList.add("hidden");
	}, 400);

	menuScreenSelector.classList.add("enter-screen-left");
	setTimeout(function () {	
		menuScreenSelector.classList.remove("hidden");
	}, 400);

}	