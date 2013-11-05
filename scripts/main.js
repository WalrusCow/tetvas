requirejs.config({
  baseUrl : 'scripts'
});

requirejs(['tetvas'], function(Tetvas) {
  var game = new Tetvas();
  game.start();
});
