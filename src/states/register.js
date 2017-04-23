var Register = {
  create: function(){
    var mail, name, password;

    texts[0] = game.add.text(game.world.centerX, game.world.height - 100, "", { font: "40px Courier", fill: "#c00", align: "center" });
    texts[0].anchor.set(0.5);

    mail = game.add.inputField(game.world.centerX - 200, game.world.centerY - 120  , {
      font: '18px Courier',
      fill: '#212121',
      backgroundColor: '#b0fbc4',
      fontWeight: 'bold',
      width: 400,
      height: 35,
      padding: 8,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 4,
      placeHolder: 'example@example.com',
    });

    name = game.add.inputField(game.world.centerX - 200, game.world.centerY - 60  , {
      font: '18px Courier',
      fill: '#212121',
      backgroundColor: '#b0fbc4',
      fontWeight: 'bold',
      width: 400,
      height: 35,
      padding: 8,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 4,
      placeHolder: 'Ingame name',
    });

    password = game.add.inputField(game.world.centerX - 200, game.world.centerY, {
      font: '18px Courier',
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

    var button = game.add.button(game.world.centerX, game.world.centerY + 120, 'button', function(){_Register(mail.value, name.value, password.value);}, this, 1, 0, 2, 2);
    button.anchor.set(0.5);

    var back = game.add.text(game.world.centerX - 40, game.world.centerY + 180, "Back", { font: "20px Courier", fill: "#4f25b6", align: "center" });
    back.anchor.set(0.5);
    back.inputEnabled = true;
    back.events.onInputOver.add(over, this);
    back.events.onInputOut.add(out, this);
    back.events.onInputDown.add(down, this);

    function over(item) {
      item.fill = "#b7a7e0";
    }

    function out(item) {
      item.fill = "#4f25b6";
    }

    function down(item) {
      game.state.start('login');
    }
  }
}
function _Register (mail, name, pass) {

  if(mail != '' && name != '' && pass != ''){
    texts[0].setText("Registering.");
    socket.emit ('register',mail, name, pass);
  }else if (name == '' && pass != '' && mail != ''){
    texts[0].setText("Missing login!");
  }else if (name != '' && pass == '' && mail != ''){
    texts[0].setText("Missing password!");
  } else if (name != '' && pass != '' && mail == ''){
    texts[0].setText("Missing user name!");
  } else {
    texts[0].setText("Fill all fields please.");
  }

}
socket.on('UserNameExists',function() {
  texts[0].setText('User already exists');
});

socket.on('LoginNameExists',function() {
  texts[0].setText('Login already exists');
});

socket.on('RegistrationSuccesful',function() {
  texts[0].setText('Registered.');
  game.state.start('login');
});
