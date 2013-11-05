requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
  baseUrl : 'scripts/tetvas',
  paths : { 'require' : '..' }
});

requirejs(['tetvas'], function(Tetvas) {
  var game = new Tetvas();
  game.start();
});
