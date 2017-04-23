//import Boot from 'boot';
//import Login from 'login';
//import Register from './states/register';
//import Lobby from './states/lobby';
//import Game from 'game';

var worldH = 900;
var worldW = 1800;

const game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, 'Game');


game.state.add('boot', Boot);
game.state.add('login', Login);
game.state.add('register', Register);
game.state.add('lobby', Lobby);
game.state.add('game', Game);

window.onresize = function(event) {
    game.scale.setGameSize(window.innerWidth, window.innerHeight);
};

game.state.start('boot');
