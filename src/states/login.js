
var Login = {
  preload: function() {
    game.load.spritesheet('button', 'images/Button-sprite.png', 314, 110);
  },
  create: function() {
    var mail, password;

    texts[0] = game.add.text(game.world.centerX, game.world.height - 100, "", { font: "40px Courier", fill: "#c00", align: "center" });
    texts[0].anchor.set(0.5);

    mail = game.add.inputField(game.world.centerX - 400, game.world.centerY - 120  , {
      font: '15px Courier',
      fill: '#212121',
      backgroundColor: '#b0fbc4',
      fontWeight: 'bold',
      width: 400,
      height: 35,
      padding: 8,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 4,
      placeHolder: 'Email',
    });
    password = game.add.inputField(game.world.centerX - 400, game.world.centerY - 60, {
      font: '15px Courier',
      fill: '#212121',
      backgroundColor: '#b0fbc4',
      fontWeight: 'bold',
      width: 400,
      height: 35,
      padding: 8,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 4,
      placeHolder: 'Password',
      type: PhaserInput.InputType.password
    });
    var button = game.add.button(game.world.centerX + 160, game.world.centerY - 70, 'button', function(){_Login(mail.value, password.value);}, this, 1, 0, 2, 2);
    button.anchor.set(0.4, 0.5);

    var register = game.add.text(game.world.centerX - 200, game.world.centerY + 10, "Register", { font: "20px Courier", fill: "#4f25b6", align: "center" });
    register.anchor.set(0.5);
    register.inputEnabled = true;
    register.events.onInputOver.add(over, this);
    register.events.onInputOut.add(out, this);
    register.events.onInputDown.add(down, this);


    function over(item) {
      item.fill = "#b7a7e0";
    }

    function out(item) {
      item.fill = "#4f25b6";
    }

    function down(item) {
      game.state.start('register');
    }
    game.stage.backgroundColor = 0xcbb688;

  }
}
function _Login (mail, pass) {

  if(mail != '' && pass != ''){
    texts[0].setText("Logging.");
    socket.emit ('login',mail, pass);
  }else if (mail == '' && pass != ''){
    texts[0].setText("Missing login!");
  }else if (mail != '' && pass == ''){
    texts[0].setText("Missing password!");
  } else {
   texts[0].setText("Missing login and password!");
  }
}
socket.on('InvalidUser',function() {
  texts[0].setText('Invalid Login Name.');
});

socket.on('InvalidPassword',function() {
  texts[0].setText('Invalid Password.');
});

socket.on('LoginSuccesful',function() {
  game.state.start('lobby');
});
