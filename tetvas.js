var Tetvas = (function() {
  /*
   * Grid should be 20 high and 10 across
   */

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
  var BORDER_COLOUR = '#000000';
  var BORDER_WIDTH = 1;

  // Initial speed of the game ticker
  var START_SPEED = 1000;

  // Colours for shapes
  var SHAPE_FILLS = {
    'I' : '#00FFFF',
    'O' : '#FFFF00',
    'T' : '#FF00FF',
    'J' : '#0000FF',
    'L' : '#FFA500',
    'S' : '#00FF00',
    'Z' : '#FF0000'
  };

  // Canvas and context to use for everything
  // TODO : Consider a background and a foreground canvas?
  var canvas = document.getElementById('tetvas');
  var ctx = canvas.getContext('2d');

  /*******************************************************
   * Utility functions
   *******************************************************/

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

  function addPoints() {
    /* Sum a list of points up */
    var newPoint = { x : 0, y : 0 };
    var lop;
    var lop = arguments[0] instanceof Array ? arguments[0] : arguments;

    for (var i = 0; i < lop.length; ++i) {
      newPoint.x += lop[i].x;
      newPoint.y += lop[i].y;
    }
    return newPoint;
  }

  /*******************************************************
   * Useful classes
   *******************************************************/

  function Block(pt, fill) {
    /*
     * Block object to represent a square on the grid
     */

    // Return object
    var Block = {};

    Block.setPoint = function(pt) {
      /* Set new point for the block */
      this.gridPoint = copyPoint(pt);
      this._x = GRID_SIZE * this.gridPoint.x;
      this._y = GRID_SIZE * this.gridPoint.y;
    };

    // Set the point for the block
    Block.gridPoint = {};
    Block.setPoint(pt);

    // Set the fill
    Block.fill = fill;

    Block.undraw = function() {
      /* Clear the block from the canvas */
      ctx.clearRect(this._x, this._y, GRID_SIZE, GRID_SIZE);
    };

    Block.draw = function() {
      /*
       * Draw a square with a border. Two squares are actually drawn,
       * one on top of the other, because using stroke for the outline
       * spills over, making the block larger than the specified size
       */

      // Draw border square
      ctx.fillStyle = BORDER_COLOUR;
      ctx.fillRect(this._x, this._y, GRID_SIZE, GRID_SIZE);

      // Offset for the border
      var fillPt = { x : this._x + BORDER_WIDTH, y : this._y + BORDER_WIDTH };
      var fillSize = GRID_SIZE - (2 * BORDER_WIDTH);

      // Draw fill square
      ctx.fillStyle = this.fill;
      ctx.fillRect(fillPt.x, fillPt.y, fillSize, fillSize);
    };

    Block.move = function(pt) {
      /* Move a block to a new point */
      this.undraw();
      this.setPoint(pt);
      this.draw();
    };

    Block.instersects = function() {
      /* Check if Block intersects other blocks */
      var lob = arguments[0] instanceof Array ? arguments[0] : arguments;
      for (var i = 0; i < lob.length; ++i) {
        if (pointsEqual(this.gridBlock, lob[i].gridBlock)) {
          return true;
        }
      }
      return false;

    };

    // Draw the new block
    Block.draw();
    return Block;
  }

  function Piece(shape) {
    /*
     * Make a new piece of the specified shape.
     * Shapes : I, O, T, J, L, S, Z
     */

    // Initial points (relative to piece origin) for each shape
    var SHAPE_POINTS = {
      'I' : [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : -1, y : 0 }, { x : 2, y : 0 } ],
      'O' : [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : 0, y : -1 }, { x : 1, y : -1 } ],
      'T' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : 0, y : -1 }, { x : 1, y : 0 } ],
      'J' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : -1, y : -1 }, { x : 1, y : 0 } ],
      'L' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : 1, y : -1 }, { x : 1, y : 0 } ],
      'S' : [ { x : 0, y : 0 }, { x : -1, y : 0 }, { x : 0, y : -1 }, { x : 1, y : -1 } ],
      'Z' : [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : 0, y : -1 }, { x : -1, y : -1 } ]
    };

    // Return object
    var Piece = {};

    // Colour of this piece
    Piece.fill = SHAPE_FILLS[shape]; // Origin of the piece (points are relative to this)

    // Shape of piece
    Piece.shape = shape;

    // Starting point for the piece
    Piece.origin = { x : 4, y : 0 };

    Piece.getCoords = function(pt) {
      /* Get the grid coordinates for a point relative to this piece's origin */
      return { x : this.origin.x + pt.x, y : this.origin.y + pt.y };
    };

    // Points for the piece
    Piece.points = [];

    // Block objects that make up this piece
    Piece.blocks = [];

    // Copy initial points
    var pts = SHAPE_POINTS[shape];
    for (var i = 0; i < pts.length; ++i) {
      var newPoint = copyPoint(pts[i]);
      Piece.points.push(newPoint);
      Piece.blocks.push(new Block(Piece.getCoords(newPoint), Piece.fill));
    }

    Piece.draw = function() {
      /* Draw the piece */
      for (var i = 0; i < this.blocks.length; ++i) {
        this.blocks[i].draw();
      }
    };

    Piece.undraw = function() {
      /* Undraw the piece */
      for (var i = 0; i < this.blocks.length; ++i) {
        this.blocks[i].undraw();
      }
    };

    Piece.updateBlocks = function() {
      /*
       * Update the blocks to have new positions based on
       * the origin of the piece
       */
      for (var i = 0; i < this.blocks.length; ++i) {
        this.blocks[i].setPoint(this.getCoords(this.points[i]));
      }
    };


    Piece.intersects = function(frozenBlocks) {
      /*
       * Determine if this piece intersects any frozen blocks
       */

      for (var i = 0; i < this.blocks.length; ++i) {
        var coords = this.blocks[i].gridPoint;
        if (frozenBlocks[coords.x][coords.y]) {
          return true;
        }
      }

      return false;
    };

    Piece._move = function(frozenBlocks, axis, mag) {
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

      // No intersection
      this.draw();
      return true;
    };

    /* Functions to move various directions */
    Piece.moveLeft = function(frozenBlocks) {
      return this._move(frozenBlocks, 'x', -1);
    };
    Piece.moveRight = function(frozenBlocks) {
      return this._move(frozenBlocks, 'x', 1);
    };
    Piece.moveDown = function(frozenBlocks) {
      /* If the move failed then the piece freezes. */
      var ret = this._move(frozenBlocks, 'y', 1);
      return ret || this.freeze(frozenBlocks);
    };

    Piece.drop = function(frozenBlocks) {
      /* Drop the piece. */
      while(this.moveDown(frozenBlocks));
    };

    Piece.freeze = function(frozenBlocks) {
      /* Freeze the piece. */
      for (var i = 0; i < this.blocks.length; ++i) {
        var coords = this.blocks[i].gridPoint;
        frozenBlocks[coords.x][coords.y] = this.blocks[i];
      }
    };

    Piece._rotate = function(frozenBlocks, dir, recur) {
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

      // No intersection - return success
      this.draw();
      return true;

    };

    Piece.rotateRight = function(frozenBlocks) {
      this._rotate(frozenBlocks, 1);
    };
    Piece.rotateLeft = function(frozenBlocks) {
      this._rotate(frozenBlocks, -1);
    };

    return Piece;
  }

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

  // Blocks that have been frozen, organized by columns and rows
  // We also have rows for the border, to make stopping the pieces
  // at the border automatic
  Tetvas.frozenBlocks = {};
  for (var i = -1; i < 11; ++i) {
    Tetvas.frozenBlocks[i] = {};
  }

  // Build the left and right columns (to stop blocks)
  for (var i = -1; i < 20; ++i) {
    Tetvas.frozenBlocks[-1][i] = true;
    Tetvas.frozenBlocks[10][i] = true;
  }
  // Build the bottom row (to stop blocks)
  for (var i = 0; i < 10; ++i) {
    Tetvas.frozenBlocks[i][20] = true;
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

    // Move the piece down (or try to)
    if(!this.piece.moveDown(this.frozenBlocks)) {

      this.piece.freeze(this.frozenBlocks);


      // Generate a new piece
      this.piece = new Piece(this.getNextPiece());
    }
  };

  Tetvas.keyStroke = function(key) {
    /* Handle a keystroke */

    switch(key) {
      case LEFT_ARROW:
        this.piece.moveLeft(this.frozenBlocks);
        break;

      case RIGHT_ARROW:
        this.piece.moveRight(this.frozenBlocks);
        break;

      case DOWN_ARROW:
        this.piece.moveDown(this.frozenBlocks);
        break;

      case UP_ARROW:
      case X_KEY:
        this.piece.rotateRight(this.frozenBlocks);
        break;

      case Z_KEY:
        this.piece.rotateLeft(this.frozenBlocks);
        break;

      case CTRL_KEY:
      case SPACE_BAR:
        this.piece.drop(this.frozenBlocks);
        break;

      case P_KEY:
        this.togglePause();
        break;
    }
  };

  Tetvas.registerListeners = function() {
    /* Register the keyboard listener for the game. */

    var self = this;
    // We listen to keydown event
    document.addEventListener('keydown', function() {
      self.keyStroke(event.keyCode);
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
    this.piece = new Piece(this.getNextPiece());

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

  // Testing ...
  Tetvas.start();
  return Tetvas;
})();
