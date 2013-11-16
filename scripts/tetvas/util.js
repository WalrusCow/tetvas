/*******************************************************
 * Utility functions
 *******************************************************/

define(['globals'], function(globals) {
  var Util = {};

  // For shorthand
  var ctx = globals.ctx;
  var canvas = globals.canvas;

  Util.clearCanvas = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  Util.drawBorders = function() {
    /* Draw the border for the game. */
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // 1 is half the line width, so there is no overlap
    var y = {
      min : globals.GRID_OFFSET.y.start - 1,
      max : canvas.height - globals.GRID_OFFSET.y.end + 1
    };
    var x = {
      min : globals.GRID_OFFSET.x.start - 1,
      max : canvas.width - globals.GRID_OFFSET.x.end + 1
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

  Util.writeText = function(text, coords, options) {
    options = options || {};
    var ctx = globals.ctx;
    ctx.textAlign = options.textAlign || 'center';
    ctx.textBaseline = options.textBaseline || 'bottom';
    ctx.font = options.font || 'bold 24px sans-serif';
    ctx.fillStyle = options.fillStyle || '#000000';
    ctx.fillText(text, coords.x, coords.y);
  };

  Util.bound = function(i, min, max) {
    // Force `i` between `min` and `max`
    return i < min ? min : i > max ? max : i;
  };

  return Util;

});

