/*******************************************************
 * Base piece class - all pieces inherit from here
 *******************************************************/

define(['globals', 'util', 'blocks/block'],
    function(globals, util, Block) {

  function BasePiece(shape) {
    /*
     * Make a new piece of the specified shape.
     * Shapes : I, O, T, J, L, S, Z
     *
     * Take optional extra arguments to pass to _initBlocks
     */

    var args = Array.prototype.slice.call(arguments);

    // Colour of this piece
    this._fill = globals.SHAPE_FILLS[shape];

    // Shape of piece
    this.shape = shape;

    // Origin of the piece (points are relative to this)
    this._origin = { x : 4, y : 0 };

    // Initialize the blocks
    this._initBlocks.apply(this, args.slice(1));
  }

  BasePiece.prototype._initBlock = function(coords) {
    /* Initialize a block. For overriding. */
    this.blocks.push(new Block(coords, this._fill));
  };

  BasePiece.prototype._initBlocks = function() {
    /* Initialize the blocks */

    // Points for the piece
    this.points = [];

    // Block objects that make up this piece
    this.blocks = [];

    // Copy initial points
    var pts = globals.SHAPE_POINTS[this.shape];
    for (var i = 0; i < pts.length; ++i) {
      var newPoint = util.copyPoint(pts[i]);
      this.points.push(newPoint);
      this._initBlock(this.getCoords(newPoint));
    }
  };

  BasePiece.prototype.getCoords = function(pt) {
    /* Get the grid coordinates for a point relative to this piece's origin */
    return { x : this._origin.x + pt.x, y : this._origin.y + pt.y };
  };

  BasePiece.prototype.draw = function() {
    /* Draw the piece */
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].draw();
    }
  };

  BasePiece.prototype.undraw = function() {
    /* Undraw the piece */
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].undraw();
    }
  };

  BasePiece.prototype.updateBlocks = function() {
    /* Update the blocks to have positions based on the origin of the piece */
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].setPoint(this.getCoords(this.points[i]));
    }
  };

  BasePiece.prototype.intersects = function(frozenBlocks) {
    /* Determine if this piece intersects any frozen blocks */
    for (var i = 0; i < this.blocks.length; ++i) {
      var coords = this.blocks[i].gridPoint;
      if (frozenBlocks[coords.y][coords.x]) {
        return true;
      }
    }

    return false;
  };

  BasePiece.prototype._move = function(frozenBlocks, axis, mag) {
    /*
     * Move the piece along the specified axis mag spaces
     * Returns true if the move is successful (no intersection with frozenBlocks)
     * Returns false if the move is unsuccessful
     */

    // Move along the axis
    this._origin[axis] += mag;

    // Undraw the blocks, since we might move (but we might not)
    this.undraw();
    // Update the blocks to their new positions
    this.updateBlocks();

    // Check for intersection
    if (this.intersects(frozenBlocks)) {
      // It does intersect. Undo the move
      this._origin[axis] -= mag;

      this.updateBlocks();
      this.draw();
      return false;
    }

    // No intersection
    this.draw();
    return true;
  };

  /* Functions to move various directions */
  BasePiece.prototype.moveLeft = function(frozenBlocks) {
    return this._move(frozenBlocks, 'x', -1);
  };
  BasePiece.prototype.moveRight = function(frozenBlocks) {
    return this._move(frozenBlocks, 'x', 1);
  };

  BasePiece.prototype.moveDown = function(frozenBlocks) {
    return this._move(frozenBlocks, 'y', 1);
  };

  BasePiece.prototype._rotate = function(frozenBlocks, dir, recur) {
    /* Rotate the piece in the specified direction. */

    // This one doesn't need to be rotated
    if (this.shape === 'O') return true;

    // Actually do the rotation
    function __rotate() {
      if (this.shape === 'I') {
        // For I shape just swap x and y
        for (var i = 0; i < this.points.length; ++i) {
          // Swap x and y
          this.points[i] = { x : this.points[i].y, y : this.points[i].x };
          this.blocks[i].setPoint(this.getCoords(this.points[i]));
        }

      } else {
        // We are doing a normal rotation
        for (var i = 0; i < this.points.length; ++i) {
          var p = this.points[i];
          // Swap and make negative (2x2 rotation matrix for pi/2 rotation)
          this.points[i] = { x : -p.y * dir, y : p.x * dir };
          this.blocks[i].setPoint(this.getCoords(this.points[i]));
        }
      }
    }

    function _boundOrigin(pt) {
      // Ensure that the origin does not go out of bounds
      pt.x = util.bound(pt.x, 0, 9);
      pt.y = util.bound(pt.y, 0, 20);
      return pt;
    }

    // Only undraw the shape if we are not undoing a previous rotation
    this.undraw();

    // Save the original origin here
    var oldOrigin = this._origin;
    var wallKicks = globals.WALL_KICKS[this.shape];

    // Perform initial rotation
    __rotate.call(this);

    for (var i = 0; i < wallKicks.length; ++i) {
      // Move the origin
      this._origin = util.copyPoint(oldOrigin);
      this._origin.x += wallKicks[i].x * dir;
      this._origin.y += wallKicks[i].y;

      this._origin = _boundOrigin(this._origin);

      // Update blocks to shifted origin
      this.updateBlocks();

      // We successfully rotated, so we are done
      if (!this.intersects(frozenBlocks)) {
        // No intersection - return success
        this.draw();
        return true;
      }
    }

    // Reset the origin
    this._origin = oldOrigin;
    this.updateBlocks();

    // No successful rotation - undo the rotation
    dir *= -1;
    __rotate.call(this);
    this.draw();
    return false;
  };

  // Rotate right and left
  BasePiece.prototype.rotateRight = function(frozenBlocks) { this._rotate(frozenBlocks, 1); };
  BasePiece.prototype.rotateLeft = function(frozenBlocks) { this._rotate(frozenBlocks, -1); };

  return BasePiece;
});
