/*
  texts[1] - online players
  texts[2] - queue players

*/



var Lobby = {
  preload: function(){
    game.load.spritesheet('button', 'images/Button-sprite.png', 314, 110);
    game.load.spritesheet('button2', 'images/Button-sprite2.png', 314, 110);
  },

  create: function(){

    game.stage.backgroundColor = 0xd0bd93;

    texts[0] = game.add.text(game.world.width - 300, 50, "", { font: "25px Courier", fill: "#000", align: "center" });
    texts[0].anchor.set(0.5);
    texts[1] = game.add.text(game.world.x + 50, 50, "", { font: "30px Courier", fill: "#000", align: "center" });
    texts[2] = game.add.text(game.world.x + 50, 90, "", { font: "30px Courier", fill: "#000", align: "center" });

    socket.emit('user_information');
    socket.emit('online_players');

    var playbutton = game.add.button(game.world.centerX, game.height - 100, 'button', Play, this, 1, 0, 2, 2);
    playbutton.anchor.set(0.4);
    var playbutton_text = game.add.text(game.world.centerX, game.height - 90, "Start game", { font: "35px Courier", fill: "#000", align: "center" });
    playbutton_text.anchor.set(0.5);

    var logout = game.add.button(100, game.height - 70, 'button2', Logout, this, 4, 3, 5, 5);
    logout.width = 150;
    logout.anchor.set(0.5);
    var logout_text = game.add.text(100, game.height - 70, "Logout", { font: "20px Courier", fill: "#000", align: "center" });
    logout_text.anchor.set(0.5);

    }
}

function Play(){
   socket.emit('to_queue');
   socket.emit('online_players');
   texts[0].setText("Searching for a player...");

}
function Logout() {
    socket.emit('try_disconnect');
}
socket.on('disconnect_allowed', function() {
    game.state.start('login');
});
socket.on('info_player',function(player) {
    var text = game.add.text(game.world.centerX, 250, "MMR: "+ player.mmr, { font: "40px Courier", fill: "#000", align: "center" });
    text.anchor.set(0.5);
    game.add.text(300, game.height - 300, "Games: "+ player.games, { font: "40px Courier", fill: "#000", align: "center" });
    game.add.text(game.world.centerX - 50, game.height - 300, "Won: "+ player.won, { font: "40px Courier", fill: "#000", align: "center" });
    game.add.text(game.width - 300, game.height - 300, "Lost: "+ player.lost, { font: "40px Courier", fill: "#000", align: "center" });

});

socket.on('GameStart', function(players, index){
   Players = players;
   game.state.start('game');
});

socket.on('info_user',function(user) {
   var text = game.add.text(game.world.centerX, 150, user.Name, { font: "40px Courier", fill: "#000", align: "center" });
   text.anchor.set(0.5);
   MyName = user.Name;
});
socket.on('online_players', function(p, q) {
  texts[1].setText("Players online: " + p);
  texts[2].setText("Players in queue: "+ q);
});
