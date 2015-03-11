requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
  baseUrl : 'tetvas'
});

requirejs(['tetvas'], function(Tetvas) {
  var game = new Tetvas();
  game.start();
});
