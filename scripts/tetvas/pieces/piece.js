/*******************************************************
 * Piece class
 *******************************************************/

define(['require', 'globals', 'util', 'blocks/block'],
    function(require, globals, util, Block) {

  function Piece(shape, frozenBlocks) {
    /*
     * Make a new piece of the specified shape.
     * Shapes : I, O, T, J, L, S, Z
     */

    // Colour of this piece
    this.fill = globals.SHAPE_FILLS[shape];

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

    // We need to require the ghost piece (circular)
    var self = this;
    require(['pieces/ghostPiece'], function(GhostPiece) {
      self.ghost = new GhostPiece(self.shape, frozenBlocks);
    });
  };

  Piece.prototype._initBlocks = function() {
    /* Initialize the blocks */

    // Copy initial points
    var pts = globals.SHAPE_POINTS[this.shape];
    for (var i = 0; i < pts.length; ++i) {
      var newPoint = util.copyPoint(pts[i]);
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

    this.ghost && this.ghost.draw();
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].draw();
    }
  };

  Piece.prototype.undraw = function() {
    /* Undraw the piece */
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].undraw();
    }
    this.ghost && this.ghost.undraw();
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
    return Object.keys(rows);

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

  return Piece;

});
