// Canvas and context to use for everything
// TODO : Consider a background and a foreground canvas?
var canvas = document.getElementById('tetvas');
var ctx = canvas.getContext('2d');

// Key constants
var UP_ARROW = 38;
var DOWN_ARROW = 40;
var LEFT_ARROW = 37;
var RIGHT_ARROW = 39;

var SPACE_BAR = 32;
var SHIFT_KEY = 16;
var CTRL_KEY = 17;

var P_KEY = 80;
var X_KEY = 88;
var Z_KEY = 90;

// Constants for Blocks
var GRID_SIZE = 15;
var GRID_OFFSET = {
  x : { start : 90, end : 90 },
  y : { start : 2, end : 2}
};
var BLOCK_BORDER_COLOUR = '#000000';
var GHOST_BORDER_COLOUR = '#ffffff';
var GHOST_FILL = '#c3c3c3';
var BORDER_WIDTH = 1;

// Initial speed of the game ticker
var START_SPEED = 1000;

// Colours for shapes
var SHAPE_FILLS = {
  'I' : '#00ffff',
  'O' : '#ffff00',
  'T' : '#ff00ff',
  'J' : '#0000ff',
  'L' : '#ffa500',
  'S' : '#00ff00',
  'Z' : '#ff0000'
};

// Initial points (relative to piece origin) for each shape
// These completely define the shapes
var SHAPE_POINTS = {
  'I' : [
    { x : 0, y : 0 },
    { x : 1, y : 0 },
    { x : -1, y : 0 },
    { x : 2, y : 0 }
  ],
  'O' : [
    { x : 0, y : 0 },
    { x : 1, y : 0 },
    { x : 0, y : -1 },
    { x : 1, y : -1 }
  ],
  'T' : [
    { x : 0, y : 0 },
    { x : -1, y : 0 },
    { x : 0, y : -1 },
    { x : 1, y : 0 }
  ],
  'J' : [
    { x : 0, y : 0 },
    { x : -1, y : 0 },
    { x : -1, y : -1 },
    { x : 1, y : 0 }
  ],
  'L' : [
    { x : 0, y : 0 },
    { x : -1, y : 0 },
    { x : 1, y : -1 },
    { x : 1, y : 0 }
  ],
  'S' : [
    { x : 0, y : 0 },
    { x : -1, y : 0 },
    { x : 0, y : -1 },
    { x : 1, y : -1 }
  ],
  'Z' : [
    { x : 0, y : 0 },
    { x : 1, y : 0 },
    { x : 0, y : -1 },
    { x : -1, y : -1 }
  ]
};


