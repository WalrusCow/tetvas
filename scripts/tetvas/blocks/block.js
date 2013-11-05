/*******************************************************
 * Block class to represent a square on the game grid
 *******************************************************/

define(['util', 'globals'], function(util, globals) {
  var BORDER_COLOUR = '#000000';
  var BORDER_WIDTH = 1;

  function Block(pt, fill, borderColour) {
    /* Main object. */
    // Set the point for the block
    this.gridPoint = {};
    this.setPoint(pt);

    // Set the fill
    this.fill = fill;
    this.borderColour = borderColour || BORDER_COLOUR;
  }

  Block.prototype.setPoint = function(pt) {
    /* Set new point for the block */
    this.gridPoint = util.copyPoint(pt);
    this._x = globals.GRID_SIZE * this.gridPoint.x + globals.GRID_OFFSET.x.start;
    this._y = globals.GRID_SIZE * this.gridPoint.y + globals.GRID_OFFSET.y.start;
  };

  Block.prototype.undraw = function() {
    /* Clear the block from the canvas */
    globals.ctx.clearRect(this._x, this._y, globals.GRID_SIZE, globals.GRID_SIZE);
  };

  Block.prototype.draw = function() {
    /*
     * Draw a square with a border. Two squares are actually drawn,
     * one on top of the other, because using stroke for the outline
     * spills over, making the block larger than the specified size
     */

    // Draw border square
    globals.ctx.fillStyle = this.borderColour;
    globals.ctx.fillRect(this._x, this._y, globals.GRID_SIZE, globals.GRID_SIZE);

    // Offset for the border
    var fillPt = { x : this._x + BORDER_WIDTH, y : this._y + BORDER_WIDTH };
    var fillSize = globals.GRID_SIZE - (2 * BORDER_WIDTH);

    // Draw fill square
    globals.ctx.fillStyle = this.fill;
    globals.ctx.fillRect(fillPt.x, fillPt.y, fillSize, fillSize);
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

  return Block;
});
