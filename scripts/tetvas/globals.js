/*******************************************************
 * Global values
 *******************************************************/

define([], function() {

  var Globals = {};

  // Canvases to use
  Globals.canvas = document.getElementById('tetvas');
  Globals.ctx = Globals.canvas.getContext('2d');

  // Key constants
  Globals.UP_ARROW = 38;
  Globals.DOWN_ARROW = 40;
  Globals.LEFT_ARROW = 37; Globals.RIGHT_ARROW = 39;

  Globals.SPACE_BAR = 32;
  Globals.SHIFT_KEY = 16;
  Globals.CTRL_KEY = 17;

  Globals.P_KEY = 80;
  Globals.X_KEY = 88;
  Globals.Z_KEY = 90;

  // Constants for Blocks
  Globals.GRID_SIZE = 15;
  Globals.GRID_OFFSET = {
    x : { start : 90, end : 90 },
    y : { start : 2, end : 52}
  };

  Globals.SCORE_TEXT = {
    textAlign : 'left',
    textBaseline : 'top',
    coords : { x : 120, y : 310 }
  };

  // Scores to add based on rows cleared
  Globals.SCORES = {
    0 : 0,
    1 : 100,
    2 : 200,
    3 : 400,
    4 : 800
  };

  // Score required to increase speed
  Globals.LEVEL_SCORE = 2000;
  Globals.LEVEL_SPEED_RATIO = 0.80;

  // Initial speed of the game ticker
  Globals.START_SPEED = 1000;

  // Colours for shapes
  Globals.SHAPE_FILLS = {
    'I' : '#00ffff',
    'T' : '#ff00ff',
    'J' : '#0000ff',
    'L' : '#ffa500',
    'S' : '#00ff00',
    'Z' : '#ff0000',
    'O' : '#ffff00'
  };

  // Initial points (relative to piece origin) for each shape
  // These completely define the shapes
  Globals.SHAPE_POINTS = {
    'I' : [ { x:0, y:0 }, { x:1, y:0 }, { x:-1, y:0 }, { x:2, y:0 } ],
    'T' : [ { x:0, y:0 }, { x:-1, y:0 }, { x:0, y:-1 }, { x:1, y:0 } ],
    'J' : [ { x:0, y:0 }, { x:-1, y:0 }, { x:-1, y:-1 }, { x:1, y:0 } ],
    'L' : [ { x:0, y:0 }, { x:-1, y:0 }, { x:1, y:-1 }, { x:1, y:0 } ],
    'S' : [ { x:0, y:0 }, { x:-1, y:0 }, { x:0, y:-1 }, { x:1, y:-1 } ],
    'Z' : [ { x:0, y:0 }, { x:1, y:0 }, { x:0, y:-1 }, { x:-1, y:-1 } ],
    'O' : [ { x:0, y:0 }, { x:1, y:0 }, { x:0, y:-1 }, { x:1, y:-1 } ]
  };

  // Points by which to shift the piece when performing rotations
  Globals.WALL_KICKS = {
    'I' : [ {x:0, y:0}, {x:1, y:0}, {x:-1, y:0}, {x:2, y:0}, {x:-2, y:0} ],
    'T' : [ {x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ],
    'J' : [ {x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ],
    'L' : [ {x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ],
    'S' : [ {x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ],
    'Z' : [ {x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ],
    'O' : [ {x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ]
  };

  // Options for the label text
  Globals.LABEL_TEXT = {
    textAlign : 'left',
    textBaseline : 'top',
    font : 'bold 16px sans-serif'
  };

  // Label coordinates
  Globals.LABELS = {
    'Score: ' : { x : 60, y : 315 },
    'Hold' : { x : 20, y : 20 },
    'Next' : { x : 265, y : 20 }
  };

  return Globals;
});
