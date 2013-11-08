/*******************************************************
 * Class to represent a ghost piece
 *******************************************************/

define(['util', 'globals', 'blocks/ghostBlock', 'pieces/piece'],
    function(util, globals, GhostBlock, Piece) {

  function GhostPiece(shape, frozenBlocks) {
    // Inherit from Piece class
    Piece.call(this, shape, frozenBlocks);

    // Inherit!
    this._super = Piece.prototype;
    this.reghost(frozenBlocks);
  }

  // We inherit from the Piece class, so we need to copy the prototype
  GhostPiece.prototype = Object.create(Piece.prototype);

  GhostPiece.prototype._initBlock = function(coords) {
    this.blocks.push(new GhostBlock(coords));
  };

  GhostPiece.prototype.moveUp = function(origin) {
    // Move the ghost to where the original piece is from
    this.origin.y = origin.y;
  };

  GhostPiece.prototype.reghost = function(frozenBlocks) {
    // Undraw the blocks
    this.undraw();

    // Update the blocks to their new positions
    this.updateBlocks();
    while(this.moveDown(frozenBlocks));
  };

  return GhostPiece;

});
