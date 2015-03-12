requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
  paths: {
    'tetvas' : './tetvas'
  }
});

requirejs(['tetvas/tetvas'], function(Tetvas) {
  var game = new Tetvas();
  game.start();
});
