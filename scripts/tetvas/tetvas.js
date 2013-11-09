define(['globals', 'util', 'pieces/gamePiece', 'pieces/basePiece'],
    function(globals, util, GamePiece, BasePiece) {

  var GAME_OVER_TEXT = 'Game Over';
  var GAME_TEXT_POINT = { x : 165, y : 130 };

  function Tetvas() {

    // Initial speed
    this.speed = globals.START_SPEED;

    // Boolean to indicate if the game is ongoing
    this.playing = false;

    this.gameTicker = null;

    // List of possible pieces to use to generate the next piece
    this._pieceGen = util.shuffle(Object.keys(globals.SHAPE_FILLS));

    // The next pieces to generate
    this.nextPieces = util.shuffle(this._pieceGen.slice());

    // Array of next pieces (to display in game)
    this.showPieces = [];

    // Blocks that have been frozen, organized by rows then columns
    // We also have rows for the border, to make stopping the pieces
    // at the border automatic
    this.frozenBlocks = {};

    // Build the rows
    for (var i = -1; i < 21; ++i) {
      this.frozenBlocks[i] = util.makeNewRow();
    }

    // Build the bottom row (to stop blocks)
    for (var i = 0; i < 10; ++i) {
      this.frozenBlocks[20][i] = true;
    }

  };

  Tetvas.prototype.getNextPiece = function() {
    /* Get the next piece to generate */

    // If there are no more pieces in the generator then refill it
    if (!this._pieceGen.length) {
      this._pieceGen = util.shuffle(this.nextPieces.slice());
    }

    // Add new piece to the end of the "queue"
    this.nextPieces.push(this._pieceGen.shift());

    // Pop and return next piece
    var nextPiece = this.nextPieces.shift();

    // Update next pieces showcase
    this.showNextPieces();

    return nextPiece;

  };

  Tetvas.prototype.showNextPieces = function() {
    // Height to begin showing at
    var START_HEIGHT = 4;
    var BOX_HEIGHT = 3;
    var NUM_PIECES = 5;
    var X_COORD = 12;

    // First one is next piece
    var nextPiece = this.showPieces.shift();
    // Remove the next piece, since it's now in game
    nextPiece && nextPiece.undraw();

    var showPiece;
    // Show next pieces
    for (var i = 0; i < NUM_PIECES; ++i) {

      // Where to put it
      var coords = {
        x : X_COORD,
        y : START_HEIGHT + BOX_HEIGHT * i
      };
      var newPiece = false;

      // Get display piece
      if (!this.showPieces[i]) {
        newPiece = true;
        showPiece = new BasePiece(this.nextPieces[i]);
      } else {
        showPiece = this.showPieces[i];
      }

      // Undraw to move
      showPiece.undraw();

      // Move to new place
      showPiece._origin = util.copyPoint(coords);
      showPiece.updateBlocks();
      showPiece.draw();

      if (newPiece) this.showPieces.push(showPiece);
    }
  };

  Tetvas.prototype.tick = function() {
    /* Function to represent one game tick */

    // More may be added later
    this.moveDown();
  };

  Tetvas.prototype.checkFullRows = function(rows) {
    // Check certain rows
    // We have to check each row to see if it's full
    for (var i = 0; i < rows.length; ++i) {
      if (util.rowFull(this.frozenBlocks[rows[i]])) {
        this.clearRow(rows[i]);
      }
    }
  };

  Tetvas.prototype.undrawRow = function(row) {
    /* Safely undraw a row (but not the edge blocks) */
    for (var i = 0; i < 10; ++i) {
      if (row[i] && row[i].undraw) row[i].undraw();
    }
  }

  Tetvas.prototype.clearRow = function(i) {
    // Undraw the row
    this.undrawRow(this.frozenBlocks[i]);

    var rowToMove, newPoint;

    // Move the rows above down by one
    for (var j = i - 1; j >= 0 ; --j) {
      rowToMove = this.frozenBlocks[j];

      // Move each block in the row down one space
      for (var k = 0; k < 10; ++k)  {
        if (!rowToMove[k]) continue;
        newPoint = rowToMove[k].gridPoint;
        newPoint.y += 1;
        rowToMove[k].move(newPoint);
      }

      // Update the object to point to the correct rows
      this.frozenBlocks[j + 1] = rowToMove;
      // Remove the row we just moved
      this.frozenBlocks[j] = util.makeNewRow();
    }
  }

  Tetvas.prototype.moveDown = function() {
    /* Move the piece down. Return true if successful move. */
    if (!this.piece.moveDown(this.frozenBlocks)) {
      var rows = this.piece.freeze(this.frozenBlocks);

      // This piece just froze, so we can hold again
      this.heldThisPiece = false;

      this.checkFullRows(rows);
      this.piece = this.createPiece();
      return false;
    }
    return true;
  };

  Tetvas.prototype.createPiece = function(shape) {
    /* Create a new piece for the game. Return null if it intersects. */
    var piece = new GamePiece(shape || this.getNextPiece(), this.frozenBlocks);
    // Check for game over
    if (piece.intersects(this.frozenBlocks)) this.gameOver();
    return piece;
  };

  Tetvas.prototype.gameOver = function() {
    /* Do the game over stuff. */

    // Write game over text
    util.writeText(GAME_OVER_TEXT, GAME_TEXT_POINT);

    // Stop the game ticker
    window.clearInterval(this.gameTicker);

    // Clear event listeners
    document.removeEventListener('keydown', this._keydown, true);

    // Reset all properties
    Tetvas.call(this);
  };

  Tetvas.prototype.keyStroke = function(key) {
    /* Handle a keystroke */

    switch(key) {
      // Move piece left
      case globals.LEFT_ARROW:
        this.piece.moveLeft(this.frozenBlocks);
        break;

      // Move piece right
      case globals.RIGHT_ARROW:
        this.piece.moveRight(this.frozenBlocks);
        break;

      // Move piece down
      case globals.DOWN_ARROW:
        this.piece.moveDown(this.frozenBlocks);
        break;

      // Rotate CW
      case globals.UP_ARROW:
      case globals.X_KEY:
        this.piece.rotateRight(this.frozenBlocks);
        break;

      // Rotate CCW
      case globals.Z_KEY:
        this.piece.rotateLeft(this.frozenBlocks);
        break;

      case globals.SHIFT_KEY:
        this.holdPiece();
        break;

      // Hard drop
      case globals.CTRL_KEY:
      case globals.SPACE_BAR:
        while(this.moveDown());
        break;

      // Pause game
      case globals.P_KEY:
        this.togglePause();
        break;
    }
  };

  Tetvas.prototype.registerListeners = function() {
    /* Register the keyboard listener for the game. */

    var self = this;
    // We listen to keydown event
    this._keydown = function(e) { self.keyStroke(e.keyCode); };
    document.addEventListener('keydown', this._keydown, true);

    var startButton = document.getElementById('tetvas-start');
    startButton.addEventListener('click', function(e) {
      self.start();
    });

  };

  Tetvas.prototype.holdPiece = function() {
    /* Put a piece on hold for later use. */

    // We can't keep holding repeatedly
    if (this.heldThisPiece) return;

    // Put the current piece on hold
    var temp = this.hold || {};

    this.hold && this.hold.undraw();
    this.hold = new BasePiece(this.piece.shape);

    // Undraw current piece
    this.piece.undraw();

    // Create a new piece
    var pieceShape = temp.shape || this.getNextPiece();
    this.piece = this.createPiece(pieceShape);

    // Put it off to the side
    this.hold._origin = { x : -4, y : 4 };
    this.hold.updateBlocks();
    this.hold.draw();

    // We can only hold a piece once
    this.heldThisPiece = true;
  };

  Tetvas.prototype.start = function() {
    /* Begin the game */

    // Don't start the game if it has already started
    if (this.playing) return;

    // Initialize the playing space
    this._initCanvas();

    // Start the game
    var self = this;
    this.playing = true;

    this.registerListeners();

    // Create the first piece
    this.piece = this.createPiece();

    // Start the ticker
    this.togglePause();
  };

  Tetvas.prototype.togglePause = function() {
    /* Toggle game pause */
    var self = this;

    if (this.gameTicker) {
      // It is playing - pause it
      window.clearInterval(this.gameTicker);
      this.gameTicker = null;

    } else {
      // Start the ticker
      this.gameTicker = window.setInterval(function() {
        self.tick();
      }, this.speed);
    }
  };

  Tetvas.prototype._initCanvas = function() {
    util.clearCanvas();
    util.drawBorders();
  };

  return Tetvas;
});
