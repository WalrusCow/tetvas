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
  this._x = GRID_SIZE * this.gridPoint.x + GRID_OFFSET.x.start;
  this._y = GRID_SIZE * this.gridPoint.y + GRID_OFFSET.y.start;
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


