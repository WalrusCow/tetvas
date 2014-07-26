/*******************************************************
 * Class to represent a ghost piece
 *******************************************************/

define(['blocks/ghostBlock', 'pieces/basePiece'],
    function(GhostBlock, BasePiece) {

  function GhostPiece(shape, frozenBlocks) {
    // Remember inheritance
    this._super = BasePiece.prototype;

    // Inherit from BasePiece class
    BasePiece.call(this, shape, frozenBlocks);

    // We have no fill
    delete this.fill;
    this.drop(frozenBlocks);
  }

  // We inherit from the BasePiece class, so we need to copy the prototype
  GhostPiece.prototype = Object.create(BasePiece.prototype);

  GhostPiece.prototype._initBlock = function(coords) {
    this.blocks.push(new GhostBlock(coords));
  };

  GhostPiece.prototype.moveUp = function(_origin) {
    // Move the ghost to where the original piece is from
    this._origin.y = _origin.y;
  };

  GhostPiece.prototype.drop = function(frozenBlocks) {
    // Undraw the blocks
    this.undraw();

    // Update the blocks to their new positions
    this.updateBlocks();
    while(this.moveDown(frozenBlocks));

    // Draw!
    this.draw();
  };

  return GhostPiece;
});
