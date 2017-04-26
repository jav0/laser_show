/*
  Room where user can see his completed achievements
  Completed achievements are writted in green, uncopleted in gray.
  Also user can see his progress in all achievements.

  User can move up and down with `w` and `s` if list of achievements is too big
*/
var achievement_desc = [];
var viewObject;
var viewObjectVelocity = 700;
var Achievement  = {
  preload: function () {
    game.load.image('viewerImage', 'images/viewer.png');
  },
  create: function () {


    game.world.setBounds(0, 0, window.innerWidth, 3000);
    game.stage.background = 0xa5936b;
    //console.log (game.width, game.height);
    texts[1] = game.add.text(game.world.centerX, 50, "ACHIEVEMENTS", {font: "30px Courier", fill: "#000", fontWeight: "bold", align: "center"});
    texts[1].anchor.set(0.5);
    //Scrolling
    viewObject = game.add.sprite(window.innerWidth/2, window.innerHeight/2, 'viewerImage');
    game.physics.enable(viewObject, Phaser.Physics.ARCADE);
    viewObject.body.maxVelocity.setTo(1000, 1000);
    viewObject.body.collideWorldBounds = true;
    game.camera.follow(viewObject);
    game.camera.focusOnXY(0, 0);
    //Buttons
    var backButton = game.add.button(0, 0, 'button2', toLobby, this, 4, 3, 5, 5);
    backButton.scale.set(0.5);
    backButton.anchor.set(0, 0);

    keyboard = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S } );;

    var x = 0, y = 150;
    var cont_i = 0;
    console.log (achievements.length);
    for (var i = 0; i < achievements.length; i++) {
      var ret = drawAchievement(x, y, i);
      console.log(x, y, ret);
      if ( ret == 0) {
        x = 0;
        y += 150;
        i--;
        continue;
      } else if (ret == -1)
        continue;
      else {
        x += ret*30 + 20;
        //y += 500;
      }
    }
  },
  update: function() {
    if (keyboard.up.isDown) {
      viewObjectVelocity = 700;
    } else
    if (keyboard.down.isDown) {
      viewObjectVelocity = -700;
    } else {
      viewObjectVelocity = 0;
    }
    game.physics.arcade.moveToXY(viewObject, viewObject.x, viewObject.y - 10, viewObjectVelocity, 0);
  }

};
function toLobby() {
  game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
  game.state.start('lobby');
}
function drawAchievement (x, y, id) {
  var _achieve = achievement_desc[id];
  if (_achieve == undefined) return -1;
  var len = Math.max(_achieve.name.length, _achieve.description.length);
  if (x + len * 25 > window.innerWidth) return 0;

  var color = achievements[id].progress == achievements[id].goal ? "#007e00" : "#8d8a8a";
  var name_text = game.add.text(x + len / 2 * 30, y + 10, _achieve.name, {font: "30px Courier", fill: color, fontWeight: "bold", align: "center"});
  name_text.anchor.set(0.5);
  var desc_text = game.add.text(x + len / 2 * 30, y + 50, _achieve.description, {font: "20px Courier", fill: color, align: "center"});
  desc_text.anchor.set(0.5);
  var progress_text = game.add.text(x + len / 2 * 30, y + 90, achievements[id].progress + "/" + achievements[id].goal, {font: "30px Courier", fill: color, align: "center"});
  progress_text.anchor.set(0.5);
  return len;

}
socket.on('cGetAchievements', function (a) {
  for (var i = 0; i < a._achievements.length; i++) {
    achievement_desc.push(a._achievements[i]);
  }
});
