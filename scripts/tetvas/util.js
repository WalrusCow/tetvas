/*******************************************************
 * Utility functions
 *******************************************************/

define(['globals'], function(Globals) {
  var Util = {};

  Util.drawBorder = function() {
    /* Draw the border for the game. */
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // 1 is half the line width, so there is no overlap
    var y = {
      min : Globals.GRID_OFFSET.y.start - 1,
      max : canvas.height - Globals.GRID_OFFSET.y.start + 1
    };
    var x = {
      min : Globals.GRID_OFFSET.x.start - 1,
      max : canvas.width - Globals.GRID_OFFSET.x.start + 1
    };

    // Left border
    ctx.moveTo(x.min, y.min);
    ctx.lineTo(x.min, y.max);

    // Bottom border
    ctx.lineTo(x.max, y.max);

    // Right boder
    ctx.lineTo(x.max, y.min);

    ctx.stroke();
    ctx.closePath();
  };

  // We initially draw the border
  drawBorder();

  Util.nop = function() {};

  Util.rowFull = function(row) {
    /* Check if a row is full */
    for (var i = 0; i < 10; ++i) {
      if (!row[i]) return false;
    }
    return true;
  };

  Util.shuffle = function(arr) {
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
  };

  Util.makeNewRow = function() {
    /* Create a new object with columns to represent a row */
    return { '-1' : true, '10' : true };
  };

  Util.copyPoint = function(pt) {
    /* Return a copy of the point */
    return { x : pt.x, y : pt.y };
  };

  Util.pointsEqual = function() {
    /* Determine if a set of points are all equal to each other */
    var lop = arguments[0] instanceof Array ? arguments[0] : arguments;
    var first = lop[0];
    for (var i = 1; i < lop.length; ++i) {
      if (first.x !== lop[i].x || first.y !== lop[i].y) return false;
    }
    return true;
  };

  return Util;

});
