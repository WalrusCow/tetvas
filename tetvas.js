var Tetvas = (function() {
  /*
   * Grid should be 20 high and 10 across
   */

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

    // Constants for Blocks
    var SIZE = 15;
    var BORDER_COLOUR = '#000000';
    var BORDER_WIDTH = 1;

    // Return object
    var Block = {};

    Block.setPoint = function(pt) {
      /* Set new point for the block */
      this.gridPoint = copyPoint(pt);
      this._x = SIZE * this.gridPoint.x;
      this._y = SIZE * this.gridPoint.y;
    };

    // Set the point for the block
    Block.gridPoint = {};
    Block.setPoint(pt);

    // Set the fill
    Block.fill = fill;

    Block.undraw = function() {
      /* Clear the block from the canvas */
      ctx.clearRect(this._x, this._y, SIZE, SIZE);
    };

    Block.draw = function() {
      /*
       * Draw a square with a border. Two squares are actually drawn,
       * one on top of the other, because using stroke for the outline
       * spills over, making the block larger than the specified size
       */

      // Draw border square
      ctx.fillStyle = BORDER_COLOUR;
      ctx.fillRect(this._x, this._y, SIZE, SIZE);

      // Offset for the border
      var fillPt = { x : this._x + BORDER_WIDTH, y : this._y + BORDER_WIDTH };
      var fillSize = SIZE - (2 * BORDER_WIDTH);

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

    var SHAPE_FILLS = {
      'I' : '#00FFFF',
      'O' : '#FFFF00',
      'T' : '#FF00FF',
      'J' : '#0000FF',
      'L' : '#FFA500',
      'S' : '#00FF00',
      'Z' : '#FF0000'
    };

    // Return object
    var Piece = {};

    // Colour of this piece
    Piece.fill = SHAPE_FILLS[shape]; // Origin of the piece (points are relative to this)
    Piece.origin = { x : 2, y : 2 };

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

    Piece.moveDown = function(frozenBlocks) {
      /*
       * Move the piece down one block
       * Returns true if the move is successful (no intersection with frozenBlocks)
       * Returns false if the move is unsuccessful
       */

      // Move origin; set new points for blocks
      this.origin.y += 1;
      this.undraw();
      this.updateBlocks();

      // Check if the new position intersects with any of the frozen blocks
      if (this.intersects(frozenBlocks)) {
        // It does intersect. Undo the move
        this.origin.y -= 1;
        this.updateBlocks();
        this.draw();
        return false;
      }

      this.draw();
      return true;
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

    return Piece;
  }

  /*******************************************************
   * Main driver area
   *******************************************************/

  // Initial speed of the game ticker
  var START_SPEED = 1000;

  // Return object (game driver)
  var Tetvas = {};

  Tetvas.speed = START_SPEED;

  // Initial index
  Tetvas.pieceIndex = 0;

  // List of possible pieces to use to generate the next piece
  Tetvas.pieceGen = [ 'I', 'O', 'T', 'J', 'L', 'S', 'Z'];

  // Blocks that have been frozen, organized by columns and rows
  // Initialize to empty objects

  // Actually this should be initialized to a border of the game !!!
  // TODO
  Tetvas.frozenBlocks = {};
  for (var i = 0; i < 10; ++i) {
    Tetvas.frozenBlocks[i] = {};
  }

  Tetvas.getNextPiece = function() {
    /* Get the next piece to generate */
    if (!this.pieceIndex) { shuffle(this.pieceGen); }
    return this.pieceGen[this.pieceIndex++ % this.pieceGen.length];
  };

  Tetvas.tick = function() {
    /* Function to represent one game tick */

    // Move the piece down (or try to)
    if(!this.currentPiece.moveDown(this.frozenBlocks)) {

      // Move failed.  Freeze the piece and generate a new one
      var blocks = this.currentPiece.blocks;
      for (var i = 0; i < blocks.length; ++i) {
        var coords = blocks[i].gridPoint;
        this.frozenBlocks[coords.x][coords.y] = blocks[i];
      }

      // Generate a new piece
      this.currentPiece = new Piece(this.getNextPiece());
    }

  };

  Tetvas.start = function() {
    // Start the game
    var self = this;
    this.currentPiece = new Piece(this.getNextPiece());
    this.gameTicker = window.setInterval(function() {
      self.tick();
    }, this.speed);
  };

  Tetvas.start();
  return Tetvas;
})();
