requirejs.config({
  baseUrl : 'scripts/tetvas',
  paths : { 'require' : '..' }
});

requirejs(['tetvas'], function(Tetvas) {
  var game = new Tetvas();
  game.start();
});
