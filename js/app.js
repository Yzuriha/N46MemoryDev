var deck = [];

// Variable holding opened cards
var vs = [];

// Variable holding matched pairs
var pairs = 0;

// Variable that holds all cards aka board
const board = document.querySelector('.deck');

function buildSettings() {

  if (localStorage.getItem("lastChange") == undefined) {
    localStorage.setItem("lastChange", dataSetVersion)
  }

  if (localStorage.getItem("lastChange") < dataSetVersion) {
    localStorage.removeItem('dataCardSet');
    localStorage.setItem("lastChange", dataSetVersion);
  }

  let getLocalStorageDataCardSet = localStorage.getItem('dataCardSet') != null ? JSON.parse(localStorage.getItem('dataCardSet')) : dataCardSet;
  let nogi1ki = document.getElementById('nogi1ki');
  let nogi2ki = document.getElementById('nogi2ki');
  let nogi3ki = document.getElementById('nogi3ki');
  let nogi4ki = document.getElementById('nogi4ki');
  let currentDiv = document.getElementsByClassName('cardSelection');

  getLocalStorageDataCardSet.forEach(item => {
    let uniqueIDName = item.name.replace(/\s+/g, '').toLowerCase() + "List";

    if (item.gen == "1ki") {
      currentDiv = nogi1ki;
    } else if (item.gen == "2ki") {
      currentDiv = nogi2ki;
    } else if (item.gen == "3ki") {
      currentDiv = nogi3ki;
    } else if (item.gen == "4ki") {
      currentDiv = nogi4ki;
    }

    if (item.active) {
      currentDiv.insertAdjacentHTML('beforeend', `<li class="cardSelection" data-value="${item.name}"><input type="checkbox" id=${uniqueIDName} data-value="${item.name}" checked><label for=${uniqueIDName}>${item.name}</label></li>`);
    } else {
      currentDiv.insertAdjacentHTML('beforeend', `<li class="cardSelection" data-value="${item.name}"><input type="checkbox" id=${uniqueIDName} data-value="${item.name}"><label for=${uniqueIDName}>${item.name}</label></li>`);
    }
  });
}

function updateActiveGirls() {
  let allCards = document.querySelectorAll(".cardSelection input");
  allCards.forEach((item, i) => {
    if (item.checked) {
      dataCardSet[i].active = 1;
    } else {
      dataCardSet[i].active = 0;
    }
  });

  saveSettingsToLocalStorage(dataCardSet);

}

function buildDeck() {
  updateActiveGirls()
  // clearBoard();
  let activeGirls = document.querySelectorAll(".cardSelection input:checked");
  let activeGirlsNameArray = [];
  activeGirls.forEach(item => {
    activeGirlsNameArray.push(item.dataset.value)
  });

  let newDataCardSet = [];
  dataCardSet.forEach(item => {
    if (activeGirlsNameArray.includes(item.name)) {
      newDataCardSet.push(item)
    }
  });



  // let shuffledDeck = shuffle(dataCardSet);
  let shuffledDeck = shuffle(newDataCardSet);
  let shuffledDeckSize = shuffledDeck.length < 16 ? shuffledDeck.length : 16;
  // shuffle the JSON entries
  // put all items into an array twice, since there are two pictures
  for (var i = 0; i < shuffledDeckSize; i++) {
    let item = shuffledDeck[i];
    let imgQuantityArray = shuffle([...Array(Object.keys(item.img).length).keys()]);
    deck.push({
      "name": item.name.replace(/\s+/g, '').toLowerCase(),
      "group": item.group,
      "img": item.img[imgQuantityArray.pop()]
    });
    deck.push({
      "name": item.name.replace(/\s+/g, '').toLowerCase(),
      "group": item.group,
      "img": item.img[imgQuantityArray.pop()]
    });
  }


  let cardCreationCount = 0;
  let cssClassFull = "";
  let currentDiv = document.getElementById('deck');
  deck.forEach(item => {
    let cardID = item.name + cardCreationCount++;
    currentDiv.insertAdjacentHTML('beforeend', `<li data-value=${item.name} id="${cardID}" class="card hvr-border-fade"><img src="data/images/logo.svg" draggable="false"></li>`);
    cssClassFull += `#${cardID}.open, #${cardID}.match {background-image: url("data/images/${item.img}")}`
    if (cardCreationCount == 2) cardCreationCount = 0;
  });

  let style = document.createElement('style');
  style.type = 'text/css';
  style.id = "dynamicImages";
  style.innerHTML = cssClassFull;
  document.getElementsByTagName('head')[0].appendChild(style);


}

function clearBoard() {
  let allCards = Array.from(document.getElementsByClassName("card"));
  allCards.forEach((item, i) => {
    item.remove();
  });

  if (document.getElementById("dynamicImages") != undefined) {
    document.getElementById("dynamicImages").remove();
  }

  deck = [];
}

//Function to reset and initiate the game
function gameInit() {
  buildDeck();
  // Selector for individual card
  let card = document.getElementsByClassName('card');

  // Spread HTMLCollection into an array
  let cards = [...card];

  // Reset matched pairs counter
  pairs = 0;

  // Empty opened cards array
  vs = [];

  // Variable for shuffled cards
  let mixCards = shuffle(cards);

  // Append each mixed card to the board
  // Set up the event listener for a card. If a card is clicked:
  // - display the card's symbol
  // - start the timer (is removed after timer starts)
  for (let i = 0; i < mixCards.length; i++) {
    board.append(mixCards[i]);
    cards[i].classList.remove('open', 'wrong', 'match', 'kill-click')
    cards[i].addEventListener('click', reveal);
    cards[i].addEventListener('click', check);
    // cards[i].addEventListener('click', startTimer);
  };

  addHideModal();
}

function saveNewSettings() {
  clearBoard();
  gameInit();
  addHideModalSetting();
}

// Start counter and remove event listeners from all other cards
// function startTimer() {
// 	// timer();
// 	cards.forEach(card => card.removeEventListener('click', startTimer))
// }

// Cards checker that holds a maximum of 2 cards
function check() {
  // Push card into opened cards
  vs.push(this);
  // While opened cards length is 2 check:
  let len = vs.length;
  if (len == 2) {
    // While cards have same id and are different cards call match function
    if (vs[0].dataset.value === vs[1].dataset.value && vs[0] !== vs[1]) {
      match();
      // If not call noMatch function
    } else {
      board.classList.add('kill-click');
      noMatch();
    }
  }
}

// Opened cards match function add's 'match' class and add's them to matched pairs, if matched pairs is 8 call's winner function with a delay of 200ms, if matched pairs is smaller then 8 calls moves counter and reset checker
function match() {
  pairs++;
  if (pairs === document.getElementsByClassName('card').length / 2) {
    vs[0].classList.add('match');
    vs[1].classList.add('match');
    setTimeout(winner, 500);
    board.classList.remove('kill-click');
  } else {
    vs[0].classList.add('match');
    vs[1].classList.add('match');
    vs[0].removeEventListener('click', check);
    vs[1].removeEventListener('click', check);
    vs[0].removeEventListener('click', reveal);
    vs[1].removeEventListener('click', reveal);
    resetCheck();
  };
}

// Opened cards noMatch function add's 'wrong' class so you can view them (otherwise second card will not flip, it will for 1ms),
// call reset match function with timer to allow card view for x ammount of ms, and the moves counter
function noMatch() {
  setTimeout(resetCheck, 1000);
}

// Remove classes from the 2 cards and empty the 'vs' array
function resetCheck() {
  vs[0].classList.remove('open');
  vs[1].classList.remove('open');
  vs[0].classList.toggle('kill-click');
  vs[1].classList.toggle('kill-click');
  board.classList.remove('kill-click');
  vs = [];
}

// Display symbol (Add or remove classes to card)
function reveal() {
  // vs[0].classList.remove('close');
  // vs[1].classList.remove('close');
  this.classList.toggle('open');
  this.classList.toggle('kill-click');
}

// Display a modal for completing the game
//---------------------------
function winner() {
  document.getElementsByClassName("modal")[0].classList.remove("hide");
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

//Save settings to local storage
function saveSettingsToLocalStorage(item) {

  //Retrieve data from local storage and append to highscore
  localStorage.setItem('dataCardSet', JSON.stringify(item));
  // populateList(getHighscores, highscoreList);
}

function addHideModal() {
  document.getElementsByClassName("modal")[0].classList.add("hide");
  // board.classList.add('kill-click');

}

function addHideModalSetting() {
  document.getElementsByClassName("modal-setting")[0].classList.add("hide");
}

function showSettings() {
  document.getElementsByClassName("modal-setting")[0].classList.remove("hide");

}

function clearStorage() {
  localStorage.removeItem('dataCardSet');
  location.reload();

}

// ** FADE OUT FUNCTION **
function fadeOut(el) {
  el.style.opacity = 1;
  (function fade() {
    if ((el.style.opacity -= .1) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
};

// ** FADE IN FUNCTION **
function fadeIn(el, display) {
  el.style.opacity = 0;
  el.style.display = display || "block";
  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += .1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
};

setTimeout(function() {
  fadeOut(document.getElementById("loadingScreen"))
  fadeIn(document.getElementById("main"))
}, 2300);

buildSettings();

// After content is loaded game reset function is called
document.addEventListener('DOMContentLoaded', gameInit());
