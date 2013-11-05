/*******************************************************
 * GhostPiece piece
 *******************************************************/

function GhostPiece(shape, frozenBlocks) {
  // Inherit from Piece class
  Piece.call(this, shape);
  this.reghost(frozenBlocks);
}
// We inherit from the Piece class, so we need to copy the prototype
GhostPiece.prototype = Object.create(Piece.prototype);

// We don't want to initialize a ghost here
GhostPiece.prototype._initGhostPiece = nop;

GhostPiece.prototype._initBlocks = function() {
  // Copy initial points
  var pts = SHAPE_POINTS[this.shape];
  for (var i = 0; i < pts.length; ++i) {
    var newPoint = copyPoint(pts[i]);
    this.points.push(newPoint);
    this.blocks.push(new GhostPieceBlock(this.getCoords(newPoint)));
  }
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
