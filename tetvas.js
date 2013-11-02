/*
 * Grid should be 20 high and 10 across
 */

var Tetvas = (function() {
  // Encapsulate a game

  // Key constants
  var UP_ARROW = 38;
  var DOWN_ARROW = 40;
  var LEFT_ARROW = 37;
  var RIGHT_ARROW = 39;

  var SPACE_BAR = 32;
  var CTRL_KEY = 17;

  var P_KEY = 80;
  var X_KEY = 88;
  var Z_KEY = 90;

  // Constants for Blocks
  var GRID_SIZE = 15;
  var BLOCK_BORDER_COLOUR = '#000000';
  var GHOST_BORDER_COLOUR = '#ffffff';
  var GHOST_FILL = '#c3c3c3';
  var BORDER_WIDTH = 1;

  // Initial speed of the game ticker
  var START_SPEED = 1000;

  // Colours for shapes
  var SHAPE_FILLS = {
    'I' : '#00ffff',
    'O' : '#ffff00',
    'T' : '#ff00ff',
    'J' : '#0000ff',
    'L' : '#ffa500',
    'S' : '#00ff00',
    'Z' : '#ff0000'
  };

  // Initial points (relative to piece origin) for each shape
  // These completely define the shapes
  var SHAPE_POINTS = {
    'I' : [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : -1, y : 0 }, { x : 2, y : 0 } ],
    'O' : [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : 0, y : -1 }, { x : 1, y : -1 } ],
    'T' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : 0, y : -1 }, { x : 1, y : 0 } ],
    'J' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : -1, y : -1 }, { x : 1, y : 0 } ],
    'L' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : 1, y : -1 }, { x : 1, y : 0 } ],
    'S' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : 0, y : -1 }, { x : 1, y : -1 } ],
    'Z' : [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : 0, y : -1 }, { x : -1, y : -1 } ]
  };

  // Canvas and context to use for everything
  // TODO : Consider a background and a foreground canvas?
  var canvas = document.getElementById('tetvas');
  var ctx = canvas.getContext('2d');

  /*******************************************************
   * Utility functions
   *******************************************************/

  function nop() {};

  function rowFull(row) {
    /* Check if a row is full */
    for (var i = 0; i < 10; ++i) {
      if (!row[i]) return false;
    }
    return true;
  }

  function shuffle(arr) {
    /* Randomly order an array */
    var index = arr.length;
    var nextSwap;
    var temp;

    while(index) {
      // Choose a random element
      nextSwap = Math.floor((Math.random() * index));

      // One less item to choose from now
      index -= 1;

      // Swap this item with a randomly chosen item
      temp = arr[index];
      arr[index] = arr[nextSwap];
      arr[nextSwap] = temp;
    }

    // Might as well return something
    return arr;
  }

  function undrawRow(row) {
    /* Safely undraw a row (but not the edge blocks) */
    for (var i = 0; i < 10; ++i) {
      if (row[i] && row[i].undraw) row[i].undraw();
    }
  }

  function makeNewRow() {
    /* Create a new object with columns to represent a row */
    return { '-1' : true, '10' : true };
  }

  function clearRow(frozenBlocks, i) {
    // Undraw the row
    undrawRow(frozenBlocks[i]);

    var rowToMove, newPoint;

    // Move the rows above down by one
    for (var j = i - 1; j >= 0 ; --j) {
      rowToMove = frozenBlocks[j];

      // Move each block in the row down one space
      for (var k = 0; k < 10; ++k)  {
        if (!rowToMove[k]) continue;
        newPoint = rowToMove[k].gridPoint;
        newPoint.y += 1;
        rowToMove[k].move(newPoint);
      }

      // Update the object to point to the correct rows
      frozenBlocks[j + 1] = rowToMove;
      // Remove the row we just moved
      frozenBlocks[j] = makeNewRow();
    }
  }

  function copyPoint(pt) {
    /* Return a copy of the point */
    return { x : pt.x, y : pt.y };
  }

  function pointsEqual() {
    /* Determine if a set of points are all equal to each other */
    var lop = arguments[0] instanceof Array ? arguments[0] : arguments;
    var first = lop[0];
    for (var i = 1; i < lop.length; ++i) {
      if (first.x !== lop[i].x || first.y !== lop[i].y) return false;
    }
    return true;
  }

  /*******************************************************
   * Useful classes
   *******************************************************/

  /*******************************************************
   * Block class
   *******************************************************/

  function Block(pt, fill, borderColour) {
    /*
     * Block object to represent a square on the grid
     */

    // Set the point for the block
    this.gridPoint = {};
    this.setPoint(pt);

    // Set the fill
    this.fill = fill;
    this.borderColour = borderColour || BLOCK_BORDER_COLOUR;
  }

  Block.prototype.setPoint = function(pt) {
    /* Set new point for the block */
    this.gridPoint = copyPoint(pt);
    this._x = GRID_SIZE * this.gridPoint.x;
    this._y = GRID_SIZE * this.gridPoint.y;
  };

  Block.prototype.undraw = function() {
    /* Clear the block from the canvas */
    ctx.clearRect(this._x, this._y, GRID_SIZE, GRID_SIZE);
  };

  Block.prototype.draw = function() {
    /*
     * Draw a square with a border. Two squares are actually drawn,
     * one on top of the other, because using stroke for the outline
     * spills over, making the block larger than the specified size
     */

    // Draw border square
    ctx.fillStyle = this.borderColour;
    ctx.fillRect(this._x, this._y, GRID_SIZE, GRID_SIZE);

    // Offset for the border
    var fillPt = { x : this._x + BORDER_WIDTH, y : this._y + BORDER_WIDTH };
    var fillSize = GRID_SIZE - (2 * BORDER_WIDTH);

    // Draw fill square
    ctx.fillStyle = this.fill;
    ctx.fillRect(fillPt.x, fillPt.y, fillSize, fillSize);
  };

  Block.prototype.move = function(pt) {
    /* Move a block to a new point */
    this.undraw();
    this.setPoint(pt);
    this.draw();
  };

  Block.prototype.instersects = function() {
    /* Check if Block intersects other blocks */
    var lob = arguments[0] instanceof Array ? arguments[0] : arguments;
    for (var i = 0; i < lob.length; ++i) {
      if (pointsEqual(this.gridBlock, lob[i].gridBlock)) {
        return true;
      }
    }
    return false;

  };

  /*******************************************************
   * Ghost block class
   *******************************************************/

  function GhostBlock(pt) {
    // It's exactly a normal block, but with a different fill and border
    Block.call(this, pt, GHOST_FILL, GHOST_BORDER_COLOUR);
  }
  GhostBlock.prototype = Object.create(Block.prototype);

  /*******************************************************
   * Piece class
   *******************************************************/

  function Piece(shape, frozenBlocks) {
    /*
     * Make a new piece of the specified shape.
     * Shapes : I, O, T, J, L, S, Z
     */

    // Colour of this piece
    this.fill = SHAPE_FILLS[shape];

    // Shape of piece
    this.shape = shape;

    // Starting point for the piece
    // Origin of the piece (points are relative to this)
    this.origin = { x : 4, y : 0 };

    // Points for the piece
    this.points = [];

    // Initialize the ghost for this piece
    this._initGhost(frozenBlocks);

    // Block objects that make up this piece
    this.blocks = [];
    this._initBlocks();

  }

  Piece.prototype._initGhost = function(frozenBlocks) {
    /* Initialize the ghost of the piece */
    this.ghost = new Ghost(this.shape, frozenBlocks);
  };

  Piece.prototype._initBlocks = function() {
    /* Initialize the blocks */

    // Copy initial points
    var pts = SHAPE_POINTS[this.shape];
    for (var i = 0; i < pts.length; ++i) {
      var newPoint = copyPoint(pts[i]);
      this.points.push(newPoint);
      this.blocks.push(new Block(this.getCoords(newPoint), this.fill));
    }

    this.draw();
  };

  Piece.prototype.getCoords = function(pt) {
    /* Get the grid coordinates for a point relative to this piece's origin */
    return { x : this.origin.x + pt.x, y : this.origin.y + pt.y };
  };

  Piece.prototype.draw = function() {
    /* Draw the piece */

    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].draw();
    }
  };

  Piece.prototype.undraw = function() {
    /* Undraw the piece */
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].undraw();
    }
  };

  Piece.prototype.updateBlocks = function() {
    /*
     * Update the blocks to have new positions based on
     * the origin of the piece
     */
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].setPoint(this.getCoords(this.points[i]));
    }
  };


  Piece.prototype.intersects = function(frozenBlocks) {
    /*
     * Determine if this piece intersects any frozen blocks
     */

    for (var i = 0; i < this.blocks.length; ++i) {
      var coords = this.blocks[i].gridPoint;
      if (frozenBlocks[coords.y][coords.x]) {
        return true;
      }
    }

    return false;
  };

  Piece.prototype._move = function(frozenBlocks, axis, mag) {
    /*
     * Move the piece along the specified axis mag spaces
     * Returns true if the move is successful (no intersection with frozenBlocks)
     * Returns false if the move is unsuccessful
     */

    // Move along the axis
    this.origin[axis] += mag;

    // Undraw the blocks, since we might move (but we might not)
    this.undraw();
    // Update the blocks to their new positions
    this.updateBlocks();

    // Check for intersection
    if (this.intersects(frozenBlocks)) {
      // It does intersect. Undo the move
      this.origin[axis] -= mag;

      this.updateBlocks();
      this.draw();
      return false;
    }

    // Move the ghost (if we have one)
    if (this.ghost) {
      this.ghost.moveUp(this.origin);
      this.ghost._move(frozenBlocks, axis, mag);
      this.ghost.reghost(frozenBlocks);
    }

    // No intersection
    this.draw();
    return true;
  };

  /* Functions to move various directions */
  Piece.prototype.moveLeft = function(frozenBlocks) {
    return this._move(frozenBlocks, 'x', -1);
  };
  Piece.prototype.moveRight = function(frozenBlocks) {
    return this._move(frozenBlocks, 'x', 1);
  };

  Piece.prototype.moveDown = function(frozenBlocks) {
    /* If the move failed then the piece freezes. */
    return this._move(frozenBlocks, 'y', 1);
  };

  Piece.prototype.freeze = function(frozenBlocks) {
    /* Freeze the piece. Also remove full rows. */

    // Track which rows the piece was in when frozen
    // Use an object as a set
    var rows = {};

    // Add all blocks to frozenBlocks
    for (var i = 0; i < this.blocks.length; ++i) {
      var coords = this.blocks[i].gridPoint;
      frozenBlocks[coords.y][coords.x] = this.blocks[i];

      rows[coords.y] = true;
    }

    // We just want the keys
    rows = Object.keys(rows);

    // Check to see about removing lines
    // We have to check each row to see if it's full
    for (var i = 0; i < rows.length; ++i) {
      if (rowFull(frozenBlocks[rows[i]])) {
        clearRow(frozenBlocks, rows[i]);
      }
    }

  };

  Piece.prototype._rotate = function(frozenBlocks, dir, recur) {
    /* Rotate the piece in the specified direction. */

    // This one doesn't need to be rotated
    if (this.shape === 'O') return true;

    // Only undraw the shape if we are not undoing
    // a previous rotation
    if (!recur) this.undraw();

    if (this.shape === 'I') {
      // For I shape just swap x and y
      for (var i = 0; i < this.points.length; ++i) {
        // Swap x and y
        this.points[i] = { x : this.points[i].y, y : this.points[i].x };
        this.blocks[i].setPoint(this.getCoords(this.points[i]));
      }

    } else {
      // We are doing a normal rotation
      var p;
      for (var i = 0; i < this.points.length; ++i) {
        p = this.points[i];
        // Swap and make negative (2x2 rotation matrix for pi/2 rotation)
        this.points[i] = { x : -p.y * dir, y : p.x * dir };
        this.blocks[i].setPoint(this.getCoords(this.points[i]));
      }
    }

    // Check for intersection
    if (!recur && this.intersects(frozenBlocks)) {
      // If we intersected then we undo the rotation
      this._rotate(frozenBlocks, -dir, true);
      return false;
    }

    if (this.ghost && !recur) {
      // Rotate the ghost if we have one (but not if we failed the last time)
      this.ghost.moveUp(this.origin);
      this.ghost._rotate(frozenBlocks, dir, recur);
      this.ghost.reghost(frozenBlocks);
    }

    // No intersection - return success
    this.draw();
    return true;

  };

  // Rotate right and left
  Piece.prototype.rotateRight = function(frozenBlocks) { this._rotate(frozenBlocks, 1); };
  Piece.prototype.rotateLeft = function(frozenBlocks) { this._rotate(frozenBlocks, -1); };

  /*******************************************************
   * Ghost piece
   *******************************************************/

  function Ghost(shape, frozenBlocks) {
    // Inherit from Piece class
    Piece.call(this, shape);
    this.reghost(frozenBlocks);
  }
  // We inherit from the Piece class, so we need to copy the prototype
  Ghost.prototype = Object.create(Piece.prototype);

  // We don't want to initialize a ghost here
  Ghost.prototype._initGhost = nop;

  Ghost.prototype._initBlocks = function() {
    // Copy initial points
    var pts = SHAPE_POINTS[this.shape];
    for (var i = 0; i < pts.length; ++i) {
      var newPoint = copyPoint(pts[i]);
      this.points.push(newPoint);
      this.blocks.push(new GhostBlock(this.getCoords(newPoint)));
    }
  };

  Ghost.prototype.moveUp = function(origin) {
    // Move the ghost to where the original piece is from
    this.origin.y = origin.y;
  };

  Ghost.prototype.reghost = function(frozenBlocks) {
    // Undraw the blocks
    this.undraw();

    // Update the blocks to their new positions
    this.updateBlocks();
    while(this.moveDown(frozenBlocks));
  };

  /*******************************************************
   * Main driver area
   *******************************************************/

  // Return object (game driver)
  var Tetvas = {};

  // Initial speed
  Tetvas.speed = START_SPEED;

  // Boolean to indicate if the game is ongoing
  Tetvas.playing = false;

  // Initial index
  Tetvas.pieceIndex = 0;

  // List of possible pieces to use to generate the next piece
  Tetvas.pieceGen = [ 'I', 'O', 'T', 'J', 'L', 'S', 'Z'];

  // Blocks that have been frozen, organized by rows then columns
  // We also have rows for the border, to make stopping the pieces
  // at the border automatic
  Tetvas.frozenBlocks = {};

  // Build the rows
  for (var i = -1; i < 21; ++i) {
    Tetvas.frozenBlocks[i] = makeNewRow();
  }

  // Build the bottom row (to stop blocks)
  for (var i = 0; i < 10; ++i) {
    Tetvas.frozenBlocks[20][i] = true;
  }

  Tetvas.getNextPiece = function() {
    /* Get the next piece to generate */
    if (!this.pieceIndex) { shuffle(this.pieceGen); }

    var ret = this.pieceGen[this.pieceIndex];

    // Increment index;
    this.pieceIndex += 1;
    this.pieceIndex %= this.pieceGen.length;

    return ret;
  };

  Tetvas.tick = function() {
    /* Function to represent one game tick */

    // More may be added later
    this.moveDown();
  };

  Tetvas.moveDown = function() {
    /* Move the piece down. Return true if successful move. */
    if (!this.piece.moveDown(this.frozenBlocks)) {
      this.piece.freeze(this.frozenBlocks);
      this.piece = new Piece(this.getNextPiece(), this.frozenBlocks);
      return false;
    }
    return true;
  };

  Tetvas.keyStroke = function(key) {
    /* Handle a keystroke */

    switch(key) {
      // Move piece left
      case LEFT_ARROW:
        this.piece.moveLeft(this.frozenBlocks);
        break;

      // Move piece right
      case RIGHT_ARROW:
        this.piece.moveRight(this.frozenBlocks);
        break;

      // Move piece down
      case DOWN_ARROW:
        this.piece.moveDown(this.frozenBlocks);
        break;

      // Rotate CW
      case UP_ARROW:
      case X_KEY:
        this.piece.rotateRight(this.frozenBlocks);
        break;

      // Rotate CCW
      case Z_KEY:
        this.piece.rotateLeft(this.frozenBlocks);
        break;

      // Hard drop
      case CTRL_KEY:
      case SPACE_BAR:
        while(this.moveDown());
        break;

      // Pause game
      case P_KEY:
        this.togglePause();
        break;
    }
  };

  Tetvas.registerListeners = function() {
    /* Register the keyboard listener for the game. */

    var self = this;
    // We listen to keydown event
    document.addEventListener('keydown', function(e) {
      self.keyStroke(e.keyCode);
    }, true);

  };

  Tetvas.start = function() {
    /* Begin the game */

    // Don't start the game if it has already started
    if (this.playing) return;

    // Start the game
    var self = this;
    this.playing = true;

    this.registerListeners();

    // Create the first piece
    this.piece = new Piece(this.getNextPiece(), this.frozenBlocks);

    // Start the ticker
    this.togglePause();
  };

  Tetvas.togglePause = function() {
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

  // Play! ( Testing ... )
  Tetvas.start();
  return Tetvas;
})();
