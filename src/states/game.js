// Enviroment
var walls = [];
const worldX  = 64;
const worldY = 64;
const worldH = 900;
const worldW = 2100;
const sectorW = 700;

// Player
var Player, Energy, Lives, cLives, cEnergy;
var EnergyBar, EnergyText;
var frame, frame_offsetX, frame_offsetY;
var bullets;
var currentSpeed = 0, myX, myY;

// Enemy
var Enemy, Enemy_lives, cELives;
var Enemyname;
var enemyBullets;
var Eframe_offsetX, Eframe_offsetY;
var enX, enY;

// Help variables
var nextFire = 0;
var fireRate = 700;
var speed = 700;
var strafe;
var keyboard;
var sBullet;

// Consts
const MaxLives = 6;
const MaxEnergy = 100;
const MaxSpeed = 1000;


var Game = {
  preload: function(){
    game.load.image('player', 'images/player.png');
    game.load.image('enemy', 'images/enemy_player.png');
    game.load.image('bullet', 'images/bullet.png');
    game.load.image('enemy_bullet', 'images/enemy_bullet.png');
    game.load.image('normal_ground', 'images/normal_ground.png');
    game.load.image('middle_ground', 'images/middle_ground.png');
    game.load.image('Frame', 'images/Frame.png');
    game.load.image('wall', 'images/walls.png')
    game.load.spritesheet('health_bar', 'images/Health_bar.png', 242, 98, 6);
    game.load.spritesheet('Ehealth_bar', 'images/Health_barE.png', 242, 98, 6);
    game.load.image('energy_bar', 'images/Energy_bar.png');
  },
  create: function(){
    //  Resize game world
    game.world.setBounds(worldX, worldY, worldW, worldH);

    socket.emit('get_player');
    /*    --Setting textures--*/
    // Enviroment
    game.add.tileSprite(worldX, worldY, sectorW, worldH, 'normal_ground');
    game.add.tileSprite(worldX + worldW - sectorW, worldY, sectorW, worldH, 'normal_ground');
    game.add.tileSprite(worldX + sectorW, worldY, sectorW, worldH, 'middle_ground');
    var wall_size = 64;
    walls[0] = game.add.tileSprite(worldX + 300, game.world.centerY - 200, wall_size, 400, 'wall');
    walls[1] = game.add.tileSprite(worldW - 300, game.world.centerY - 200, wall_size, 400, 'wall');
    walls[2] = game.add.tileSprite(worldX - wall_size, worldY - wall_size, worldW, wall_size, 'wall'); //up
    walls[3] = game.add.tileSprite(worldX - wall_size, worldY, wall_size, worldH-wall_size, 'wall'); //left
    walls[4] = game.add.tileSprite(worldW + wall_size, worldY + wall_size, wall_size, worldH, 'wall'); //right
    walls[5] = game.add.tileSprite(worldX, worldH + wall_size, worldW, wall_size, 'wall'); //bottom

    // Players
    Player = game.add.sprite(myX, myY, 'player');
    Player.anchor.setTo(0.5);
    Player.x = myX;
    Player.y = myY;
    Player.angle = -90;

    for (p in Players) {
      if (Players[p] != MyName) {
        Enemyname = Players[p];
        Enemy = game.add.sprite(enX, enY, 'enemy');
        Enemy.anchor.setTo(0.5);
        Enemy.x = enX; Enemy.y = enY;
        Enemy.angle = -90;

      }
    }
    // UI
    var frame = game.add.sprite(20 + frame_offsetX, 20 + frame_offsetY, "Frame");
    frame.fixedToCamera = true;
    var name = game.add.text(169 + frame_offsetX, 151 + frame_offsetY, MyName , { font: "15px Courier", fill: "#000 ", align: "center" });
    name.anchor.setTo(0.5);
    name.fixedToCamera = true;

    Lives = game.add.sprite(21 + frame_offsetX,25 + frame_offsetY, 'health_bar');
    Lives.fixedToCamera = true;

    EnergyBar = game.add.sprite(25 + frame_offsetX,123 + frame_offsetY, 'energy_bar');
    EnergyBar.fixedToCamera = true;
    EnergyText = game.add.text(169 + frame_offsetX, 133 + frame_offsetY, cEnergy + "/" + MaxEnergy, { font: "12px Courier", fill: "#000 ", align: "center" });
    EnergyText.anchor.setTo(0.5);
    EnergyText.fixedToCamera = true;

    Enemy_lives = game.add.sprite(21 + Eframe_offsetX,25 + Eframe_offsetY, 'Ehealth_bar');
    Enemy_lives.fixedToCamera = true;

    var Ename = game.add.text (169 + Eframe_offsetX, 130 + Eframe_offsetY, Enemyname, { font: "15px Courier", fill: "#000 ", align: "center" });
    Ename.fixedToCamera = true;

    // Bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemy_bullet', 0, false);
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    // Setting Physics
    game.physics.enable(Player, Phaser.Physics.ARCADE);
    game.physics.enable(Enemy, Phaser.Physics.ARCADE);
    Player.body.drag.set(0.2);
    Player.body.maxVelocity.setTo(MaxSpeed, MaxSpeed);
    Player.body.collideWorldBounds = true;

    for (var i = 0; i < walls.length; i++) {
      game.physics.enable(walls[i], Phaser.Physics.ARCADE);
      walls[i].body.immovable = true;
    }
    // Camera
    game.camera.follow(Player);
    game.camera.focusOnXY(worldX, worldY);
    // Keyboard input
    keyboard = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );;
  },

  update: function(){
    game.physics.arcade.collide(walls, Player);
    game.physics.arcade.overlap(bullets, walls, bulletHitWall, null, this);
    game.physics.arcade.overlap(enemyBullets, walls, bulletHitWall, null, this);
    game.physics.arcade.overlap(enemyBullets, Player, bulletHitPlayer, null, this);
    if (Enemy != undefined) game.physics.arcade.overlap(bullets, Enemy, bulletHitEnemy, null, this);

    if(game.width != window.innerWidth || game.height != window.innerHeight){
      game.width = window.innerWidth;
      game.height = window.innerHeight;
      game.scale.setGameSize(game.width, game.height);
      land.width = game.width;
      land.height = game.height;
    }
    // Controls
    strafe = 0;
    if (keyboard.left.isDown){
      strafe = -90;
      currentSpeed = speed;
      if (keyboard.up.isDown) {
        strafe = -45;
      }
      if (keyboard.down.isDown) {
        strafe = -45;
        currentSpeed = -speed;
      }
    }
    else if (keyboard.right.isDown){
      strafe = 90;
      currentSpeed = speed;
      if (keyboard.up.isDown) {
        strafe = 45;
      }
      if (keyboard.down.isDown) {
        strafe = 45;
        currentSpeed = -speed;
      }
    } else
    if (keyboard.up.isDown){
      strafe = 0;
      currentSpeed = speed;
    }else
    if(keyboard.down.isDown){
      strafe = 0;
      currentSpeed = -speed;
    }else{
      strafe = 0;
      currentSpeed = 0;
    }

    strafe = Phaser.Math.degToRad(strafe);

    var old_rot = Player.rotation;

    Player.rotation = game.physics.arcade.angleToPointer(Player);
    game.physics.arcade.velocityFromRotation(Player.rotation + strafe, currentSpeed, Player.body.velocity);

    if (old_rot != Player.rotation) {
      socket.emit('sPlayerAngle', Player.rotation);
    }
    if (currentSpeed != 0){
      socket.emit('sPlayerPosition', Player.x, Player.y);
    }

    Lives.frame = 6 - cLives;
    Enemy_lives.frame = 6 - cELives;

    EnergyBar.width = 3*Math.floor((cEnergy/MaxEnergy)*100);
    EnergyText.setText(cEnergy + '/' + MaxEnergy);

    if (game.input.activePointer.isDown)
    {
       fire();
    }
  }
}
function bulletHitWall (player, bullet) {

  bullet.kill();
}
function bulletHitPlayer (player, bullet) {

  bullet.kill();
}

function bulletHitEnemy (player, bullet) {

  bullet.kill();
  socket.emit ('sHitEnemy');
  cELives -= 1;
  if (cELives == 0)
  {
    socket.emit ('GameOver', 1);
  }

}

function fire () {

  if (game.time.now > nextFire && bullets.countDead() > 0 && cEnergy >= 25){

    cEnergy -= 25;

    nextFire = game.time.now + fireRate;

    var bullet = bullets.getFirstExists(false);

    bullet.reset(Player.x, Player.y);

    bullet.rotation = game.physics.arcade.angleToPointer(bullet);
    game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 0);
    sBullet = {
      x : Player.x,
      y : Player.y,
      tX : game.input.activePointer.worldX,
      tY : game.input.activePointer.worldY,
      r : bullet.rotation
    };
    socket.emit('sFire', sBullet);
  }
}
socket.on('cFire', function(_bullet) {

  var bullet = enemyBullets.getFirstExists(false);
  bullet.reset(_bullet.x, _bullet.y);
  bullet.rotation = _bullet.r;
  game.physics.arcade.moveToXY(bullet, _bullet.tX, _bullet.tY, 1000, 0);
});
socket.on ('cHitEnemy', function() {
  cELives -= 1;
  if (cELives == 0) {
    socket.emit('GameOver', 1);
  }
});
socket.on ('cHitPlayer', function() {
  cLives -= 1;
  if (cLives == 0) {
    socket.emit('GameOver', 0);
  }
});
socket.on ('Timeout', function() {
  if (cELives > Lives)
    socket.emit('GameOver', 0);
  else if (cELives < Lives)
    socket.emit('GameOver', 1);
  else
    socket.emit('GameOver', 2);
});
socket.on('GameEnd',function() {
  game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
  delete Players;
  game.state.start('lobby');
});

socket.on('GameStart',function(players, enemy) {
  var _enX, _enY, _myX, _myY;
  _myX = worldX + 200;
  _myY = worldY + (worldH/2);
  _enX = worldX + worldW - 200;
  _enY = _myY;
  frame_offsetY = Eframe_offsetY = 0;
  if (!enemy) {
    myX = _enX;
    myY = _enY;
    enX = _myX;
    enY = _myY;
    frame_offsetX = worldW - 550;
    Eframe_offsetX = 0;
  } else {
    myX = _myX;
    myY = _myY;
    enX = _enX;
    enY = _enY;
    frame_offsetX = 0;
    Eframe_offsetX = worldW - 550;
  }
  cLives = cELives = 3;
  cEnergy = MaxEnergy;
});

socket.on('cPlayerAngle',function(angle) {
  if (Enemy != undefined)
    Enemy.rotation = angle;
});


socket.on('cPlayerPosition',function(x, y) {
  if (Enemy != undefined) {
    Enemy.x = x;
    Enemy.y = y;
  }
});
