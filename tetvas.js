var Tetvas = (function() {

  var canvas = document.getElementById('main');
  var ctx = canvas.getContext('2d');

  var CELL_SIZE = 20;
  var CELL_BORDER = '#000000';
  var CELL_FILL = '#00FFFF';

  function drawSquare(ctx, pt) {
    // Draw border square
    ctx.fillStyle = CELL_BORDER;
    ctx.fillRect(pt.x, pt.y, CELL_SIZE, CELL_SIZE);
    // Draw fill square
    ctx.fillStyle = CELL_FILL;
    ctx.fillRect(pt.x + 1, pt.y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }

  var pt = { x : 10, y : 10 };
  drawSquare(ctx, pt);

})();
