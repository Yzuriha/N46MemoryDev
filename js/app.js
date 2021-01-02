var deck = [];

// Variable holding opened cards
var vs = [];

// Variable holding matched pairs
var pairs = 0;

// Variable that holds all cards aka board
const board = document.querySelector('.deck');

// create the settings menu
function buildSettings() {

  // we want to take the saved settings in local storage if possible, else just grab the default version
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

// in case the user changed the active girls, update the dataset and save to localStorage
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
  helpCounter = 0;
  timerStarted = false;

}

// take settings and create a deck of the girls
function buildDeck() {
  updateActiveGirls()
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

  let shuffledDeck = shuffle(newDataCardSet);
  let shuffledDeckSize = shuffledDeck.length < 16 ? shuffledDeck.length : 16;
  // shuffle the JSON entries
  // put all items into an array twice, since there are two pictures
  for (var i = 0; i < shuffledDeckSize; i++) {
    let item = shuffledDeck[i];
    let imgQuantityArray = shuffle([...Array(Object.keys(item.img).length).keys()]);
    // put same card in twice, but with a different picture
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

  // create HTML elements for all the cards
  let cardCreationCount = 0;
  let cssClassFull = "";
  let currentDiv = document.getElementById('deck');
  deck.forEach(item => {
    let cardID = item.name + cardCreationCount++;
    currentDiv.insertAdjacentHTML('beforeend', `<li data-value=${item.name} id="${cardID}" class="card hvr-border-fade"><img src="assets/icons/logo.svg" draggable="false"></li>`);
    cssClassFull += `#${cardID}.open, #${cardID}.match {background-image: url("assets/images/${item.img}")}`
    if (cardCreationCount == 2) cardCreationCount = 0;
  });

  // small cheat to create flipped cards images by adding some css
  let style = document.createElement('style');
  style.type = 'text/css';
  style.id = "dynamicImages";
  style.innerHTML = cssClassFull;
  document.getElementsByTagName('head')[0].appendChild(style);
}

// just reset the board for a new game
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

  for (let i = 0; i < mixCards.length; i++) {
    board.append(mixCards[i]);
    cards[i].classList.remove('open', 'match', 'kill-click')
    cards[i].addEventListener('click', reveal);
    cards[i].addEventListener('click', check);
  };

  addHideModal();
}

function saveNewSettings() {
  clearBoard();
  gameInit();
  addHideModalSetting();
}

var timerStarted = false;
var startTime = 0;
var helpCounter = 0;

// Cards checker that holds a maximum of 2 cards
function check() {

  // creating a timer to tell the user how long they needed; can probably done better but /shrug
  timerStarted = true;
  if(timerStarted && helpCounter == 0) {
    startTime = Date.now();
    helpCounter++;
  }

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
  // if (pairs === document.getElementsByClassName('card').length / 2) {
    if (pairs === 1) {
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
  this.classList.toggle('open');
  this.classList.toggle('kill-click');
}

// Display a modal for completing the game
function winner() {
  let finalTime = Date.now() - startTime;
  // Math.abs(startTime - Date.now());
  document.getElementsByClassName("modal")[0].classList.remove("hide");
  document.getElementById("victoryText").innerHTML = `You took ${secondsToHms(Math.floor(finalTime / 1000))} to find ${pairs} pairs.`;
  helpCounter = 0;
  timerStarted = false;
}

// converts the time from seconds to min + seconds, taken from https://stackoverflow.com/questions/37096367/how-to-convert-seconds-to-minutes-and-hours-in-javascript/37096923
function secondsToHms(d) {
    d = Number(d);
    // var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    // var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    // return hDisplay + mDisplay + sDisplay;
    return mDisplay + sDisplay;
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
}

function addHideModal() {
  document.getElementsByClassName("modal")[0].classList.add("hide");
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

// fade out the loadingScreen after its done loading
function toggleLoadingScreen (){
  $("#loadingScreen").fadeOut();
  document.getElementById("main").classList.remove("hidden")
}

setTimeout(function(){
  toggleLoadingScreen()
}, 2500);

buildSettings();

// After content is loaded game reset function is called
document.addEventListener('DOMContentLoaded', gameInit());


//----------------- SERVICE WORKER STUFF -----------------------
window.addEventListener('load',main)
function main(){
    vaildateCacheIfOnline()
    .then(_=>{
    })
}

// if settings in the config.json have changed, then update the cache
function vaildateCacheIfOnline(){
    return new Promise((resolve,reject)=>{
        fetch(`config.json?cacheBust=${new Date().getTime()}`)
        .then(response => { return response.json() })
        .then(config => {

            let installedVersion = Settings.getVersion()
            if ( installedVersion== 0) {
                Settings.setVersion(config.version)
                document.querySelector('#version').innerHTML= `version ${config.version}`;
                return resolve();
            }
            else if (installedVersion != config.version) {
                console.log('Cache Version mismatch')
                fetch(`config.json?clean-cache=true&cacheBust=${new Date().getTime()}`).then(_ => {
                    //actually cleans the cache
                    Settings.setVersion(config.version);
                    localStorage.removeItem('dataCardSet');
                    console.log("Old dataset removed. Reloading for new version.")
                    window.location.reload();
                    return resolve();  // unnecessary
                });

            }else{
                // already updated
                console.log('Cache Updated')
                document.querySelector('#version').innerHTML= `version ${installedVersion}`;
                return resolve();
            }
        }).catch(err=>{
            console.log(err);
            return resolve();
            //handle offline here
        })
    })
}
//----------------- END SERVICE WORKER STUFF -----------------------
