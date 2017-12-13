
var playersNumberSelector 	= document.querySelector("#players-number");
var playersNumber 			= playersNumberSelector.options[playersNumberSelector.selectedIndex].value;
playersNumberSelector.addEventListener('change', changePlayerNumber);

function changePlayerNumber() {
	playersNumber = playersNumberSelector.options[playersNumberSelector.selectedIndex].value;
}


console.log(playersNumber);