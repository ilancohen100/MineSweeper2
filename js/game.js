"use strict";
var MINE = "💣";
//var EMPTY = "0";
var FLAGED = "🚩";
var UNREVEALED = "⬜";
var SAD = "🤕";
var HAPPY ="😃";
var SUNGLASSES="😎";
var MINES_AROUND = [" ","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"]
//globals
//Matrix contains cell objects
//var cell = {isRevealed : false,isMine : false,isMarked: false}
var gBoard = [];
// This is an object by which the board size is set
//(in this case: 4*4), and how many mines to put
// var gLevel = { SIZE: 4, MINES: 2 };
// var gLevel = { SIZE: 5, MINES: 8 };
var gLevel = { SIZE: 4, MINES: 2};

//This is an object in which you can keep and update the current game state: isOn – boolean, when true we let the user play shownCount: how many cells are shown markedCount: how many cells are marked (with a flag)
//secsPassed: how many seconds passed
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var gHintMode = false;
var gHintsClicked = 0;

// { minesAroundCount: 4, isShown: true, isMine: false, isMarked: true, }
// This is called when page loads
function initGame() {
  gBoard = buildBoard();
  renderBoard(gBoard);
}
function smileyClick(){
  initGame();
  gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
  gHintMode = false;
  gHintsClicked = 0;
  document.querySelector(".smiley").innerText = HAPPY;
}
// Builds the board Set mines at random locations Call
// setMinesNegsCount() Return the created board
function buildBoard() {
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        isRevealed: false,
        isMine: false,
        isFlaged: false,
        neighborsCount: 0,
        isHintRevealed: false
      };
    }
  }
  return board;
}
function checkIfNeighbors(i1,j1,i2,j2)
{
  return ((i1-i2)*(i1-i2) +(j1-j2)*(j1-j2) )>2? false:true;
}
function plantMines(board, isRandom, clickI, clickJ) {
  if (isRandom) {
    for (var i = 0; i < gLevel.MINES; i++) {
      var isRandomedPosOk = false;
      while (!isRandomedPosOk) {
        var iRand = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var jRand = getRandomIntInclusive(0, gLevel.SIZE - 1);
        //make sure empty around
        if(!checkIfNeighbors(iRand,jRand,clickI,clickJ)){
        //if (!(iRand === clickI && jRand === clickJ)) {
          //   if(!iRand-clickI)==1) && (Math.abs(jRand-clickJ)==1))&&gGame.isOn ===true)
          isRandomedPosOk = true;
          board[iRand][jRand].isMine = true;
        }
      }
    }
  } else {
    board[1][2].isMine = true;
    board[3][2].isMine = true;
  }
  return board;
}
function countNeighborsMines(board, iLoc, jLoc) {
  var counter = 0;
  var iStart = iLoc === 0 ? iLoc : iLoc - 1;
  var iEnd = iLoc === gLevel.SIZE - 1 ? iLoc : iLoc + 1;
  var jStart = jLoc === 0 ? jLoc : jLoc - 1;
  var jEnd = jLoc === gLevel.SIZE - 1 ? jLoc : jLoc + 1;
  for (var i = iStart; i < iEnd + 1; i++) {
    for (var j = jStart; j < jEnd + 1; j++) {
      if (i == iLoc && j == jLoc) {
        continue;
      } else {
        if (board[i][j].isMine) {
          counter++;
        }
      }
    }
  }
  return counter;
}
// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var negsCount = countNeighborsMines(board, i, j);
      board[i][j].neighborsCount = negsCount;
    }
  }
  return board;
}
// Render the board as a <table> to the page
function renderBoard(board) {
  var strHTML = '<table border="1"><tbody>';
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < gLevel.SIZE; j++) {
      strHTML += renderCellString(i, j, board[i][j]);
    }
    strHTML += "</tr>";
  }
  strHTML += "</tbody></table>";
  var elContainer = document.querySelector(".board-container");
  elContainer.innerHTML = strHTML;
}
function renderCellString(i, j, cell) {
  var strHTML = "";
  var dataset = `data-i = ${i} data-j = ${j}`;
  var eventSt = `onmousedown = "cellClicked(this, ${i}, ${j},event)"`;
  var buttonHTML = `<button> ?</button>`;
  strHTML += `<td ${eventSt} class= "cell cell-${i}-${j}" ${dataset} > ${UNREVEALED}</td>`;
  return strHTML;
}
function renderCell(elCell, i, j) {
  if (elCell === null) {
    elCell = document.querySelector(`.cell-${i}-${j}`);
  }

  if (!gBoard[i][j].isRevealed && !gBoard[i][j].isHintRevealed) {
    elCell.innerHTML = UNREVEALED;
    return;
  }
  if (gBoard[i][j].isMine) {
    elCell.innerHTML = MINE;
  } else {
  //  if (gBoard[i][j].neighborsCount > 0) {
      elCell.innerHTML = MINES_AROUND[gBoard[i][j].neighborsCount];
    // }
    // //empty
    // else {
    //   elCell.innerHTML = EMPTY;
    //   // expandShown(gBoard,elCell,i,j);
    // }
  }
}
// Called when a cell (td) is clicked
function cellClicked(elCell, i, j, e) {
  //leftclick
  if (e.button === 0) {
    //make sure no mines on first click
    if (gGame.isOn === false) {
      gBoard = plantMines(gBoard, true, i, j);
      gBoard = setMinesNegsCount(gBoard);
      gGame.isOn = true;
      gGame.secsPassed = Date.now() / 1000;
    }
    if (gHintMode === true && gHintsClicked === 0) {
      gHintsClicked = 1;
      revealNegs(i, j);
      setTimeout(unRevealHint, 1000, i, j);
      return;
    }

    if (gBoard[i][j].isFlaged) return;
    if (gBoard[i][j].isMine) {
      steppedOnMine(elCell);
    } else {
      gBoard[i][j].isRevealed = true;
      gGame.shownCount++;
      renderCell(elCell, i, j);
      expandShown(gBoard, null, i, j);
    }
    checkGameOver();
  }
  //rightclick
  else if (e.button === 2) {
    if (gBoard[i][j].isRevealed) return;
    if (gBoard[i][j].isFlaged) {
      //unflag
      elCell.innerHTML = UNREVEALED;
      gBoard[i][j].isFlaged = false;
      gGame.markedCount--;
    } else {
      elCell.innerHTML = FLAGED;
      gBoard[i][j].isFlaged = true;
      gGame.markedCount++;
    }
    checkGameOver();
  }
}
function win() {
  console.log("win");
}
// Called on right click to mark a cell (suspected to be a mine)
//  Search the web (and implement) how to hide the context menu
//  on right click
function cellMarked(elCell) {}
// Game ends when all mines are marked and all the other cells
//  are shown
function checkGameOver() {
  //  console.log("gGame.markedCount=",gGame.markedCount," gGame.shownCount=",gGame.shownCount);
  if (
    gGame.markedCount === gLevel.MINES &&
    gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES
  ) {
    document.querySelector(".smiley").innerText = SUNGLASSES;
  }
}
function steppedOnMine() {
  //reveal all cells
  var board = gBoard;
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j].isRevealed = true;
      renderCell(null, i, j);
    }
  }
  document.querySelector(".smiley").innerText = SAD;
  gGame.isOn = false;
}
function hintClicked() {
  var elHintsCountContainer = document.querySelector(".hintsCountContainer");
  if (elHintsCountContainer.innerText > 0) {
    gHintMode = true;
    elHintsCountContainer.innerText = elHintsCountContainer.innerText - 1;
    document.querySelector(".hintSafeModeSpan").innerText =
      "Now its safe to click anywhere";
  }
}
function revealNegs(iLoc, jLoc) {
  var iStart = iLoc === 0 ? iLoc : iLoc - 1;
  var iEnd = iLoc === gLevel.SIZE - 1 ? iLoc : iLoc + 1;
  var jStart = jLoc === 0 ? jLoc : jLoc - 1;
  var jEnd = jLoc === gLevel.SIZE - 1 ? jLoc : jLoc + 1;
  for (var i = iStart; i < iEnd + 1; i++) {
    for (var j = jStart; j < jEnd + 1; j++) {
      gBoard[i][j].isHintRevealed = true;
      renderCell(null, i, j);
    }
  }
}
function unRevealHint(iLoc, jLoc) {
  var iStart = iLoc === 0 ? iLoc : iLoc - 1;
  var iEnd = iLoc === gLevel.SIZE - 1 ? iLoc : iLoc + 1;
  var jStart = jLoc === 0 ? jLoc : jLoc - 1;
  var jEnd = jLoc === gLevel.SIZE - 1 ? jLoc : jLoc + 1;
  for (var i = iStart; i < iEnd + 1; i++) {
    for (var j = jStart; j < jEnd + 1; j++) {
      gBoard[i][j].isHintRevealed = false;
      renderCell(null, i, j);
    }
  }
  gHintMode = false;
  gHintsClicked = 0;
  document.querySelector(".hintSafeModeSpan").innerText = "Beware of Mines!!";
}

//When user clicks a cell with no mines around, we need to open
//  not only that cell, but also its neighbors. NOTE: start with
//  a basic implementation that only opens the non-mine 1st degree
//  neighbors BONUS: if you have the time later, try to work more like
//  the real algorithm (see description at the Bonuses section below)
function expandShown(board, elCell, iLoc, jLoc) {
  if (board[iLoc][jLoc].neighborsCount > 0) {
    return;
  }
  var iStart = iLoc === 0 ? iLoc : iLoc - 1;
  var iEnd = iLoc === gLevel.SIZE - 1 ? iLoc : iLoc + 1;
  var jStart = jLoc === 0 ? jLoc : jLoc - 1;
  var jEnd = jLoc === gLevel.SIZE - 1 ? jLoc : jLoc + 1;
  for (var i = iStart; i < iEnd + 1; i++) {
    for (var j = jStart; j < jEnd + 1; j++) {
      if (i == iLoc && j == jLoc) {
        continue;
      } else {
        if (board[i][j].neighborsCount >= 0) {
          if (board[i][j].isMine === false) {
            if (board[i][j].isRevealed === false) {
              board[i][j].isRevealed = true;
              gGame.shownCount++;
              renderCell(null, i, j);
              if (board[i][j].neighborsCount === 0) {
                expandShown(board, null, i, j);
              }
            }
          }
        }
      }
    }
  }
}
