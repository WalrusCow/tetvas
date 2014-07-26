/*******************************************************
 * Main piece used for game
 *******************************************************/

define(['pieces/basePiece', 'pieces/ghostPiece'],
    function(BasePiece, GhostPiece) {

  function GamePiece(shape, frozenBlocks) {
    // Remember what we inherit from
    this._super = BasePiece.prototype;

    // Call base constructor
    BasePiece.call(this, shape, frozenBlocks);

    this.draw();
  }

  GamePiece.prototype = Object.create(BasePiece.prototype);

  GamePiece.prototype._initBlocks = function(frozenBlocks) {
    // Create a ghost for this piece
    this.ghost = new GhostPiece(this.shape, frozenBlocks);
    this._super._initBlocks.call(this);
  };

  GamePiece.prototype.draw = function() {
    this.ghost.draw();
    this._super.draw.call(this);
  };

  GamePiece.prototype.undraw = function() {
    this._super.undraw.call(this);
    this.ghost.undraw();
  };

  GamePiece.prototype._move = function(frozenBlocks, axis, mag) {
    var success = this._super._move.call(this, frozenBlocks, axis, mag);

    if (success) {
      // Move the ghost (if we have one)
      this.ghost.moveUp(this._origin);
      this.ghost._move(frozenBlocks, axis, mag);
      this.ghost.drop(frozenBlocks);
    }

    this.draw();

    return success;
  };

  GamePiece.prototype.freeze = function(frozenBlocks) {
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

  GamePiece.prototype._rotate = function(frozenBlocks, dir, recur) {
    var success = this._super._rotate.call(this, frozenBlocks, dir, recur);

    if (!recur && success) {
      // Rotate the ghost if we have one (but not if we failed the last time)
      this.ghost.moveUp(this._origin);
      this.ghost._rotate(frozenBlocks, dir, recur);
      this.ghost.drop(frozenBlocks);
    }

    this.draw();
    return success;
  };

  return GamePiece;
});
