
/*
règles de syntaxe :
- tous les noms de variables en camelCase
- ajouter Selector derrière le nom de la variable quand celle cie est un élément du DOM
*/


var playerNumberSelector 	= document.querySelector("#player-number");
var playerNumber 			= playerNumberSelector.options[playerNumberSelector.selectedIndex].value;
playerNumberSelector.addEventListener('change', changePlayerNumber);

var playerHolderSelector = document.querySelector("#players-holder");

function changePlayerNumber() {
	playerNumber = playerNumberSelector.options[playerNumberSelector.selectedIndex].value;
	
	for(var i=0; i<8; i++) {
		if (i < playerNumber) {
			playerHolderSelector.children[i].classList.remove("hidden");
			playerHolderSelector.children[i].classList.remove("pickDown");
		} else {
			playerHolderSelector.children[i].classList.add("pickDown");
			hideMenuPlayer(i);
		}
	}
}

function hideMenuPlayer(i) {
	//cache les lignes dont on n'a pas besoin avec un délai correspondant au temps de l'animation
	setTimeout(function () {
		playerHolderSelector.children[i].classList.add("hidden");
   	}, 700);			
}

