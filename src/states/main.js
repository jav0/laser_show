
const game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, 'Game');

// Game states
game.state.add('boot', Boot);
game.state.add('login', Login);
game.state.add('register', Register);
game.state.add('achieve', Achievement);
game.state.add('lobby', Lobby);
game.state.add('game', Game);

// Resize function
window.onresize = function(event) {
    game.scale.setGameSize(window.innerWidth, window.innerHeight);
};

game.state.start('boot');


function formatTime(s) {
  var minutes = "0" + Math.floor(s / 60);
  var seconds = "0" + (s - minutes * 60);
  return minutes.substr(-2) + ":" + seconds.substr(-2);
}
