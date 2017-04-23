socket = io.connect ();

var warning;
var MyName, Players;
// Texts needed to be redrawn during one screen projection like warnings etc.
// texts[0] is always reserved for warnings
var texts = [];

var Boot = {
  create: function(){
    game.plugins.add(PhaserInput.Plugin);
    game.stage.disableVisibilityChange = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.height = window.innerHeight;
    game.width = window.innerWidth;
    game.state.start('login');

  }
}
