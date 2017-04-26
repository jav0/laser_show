/*
  Game
*/
/*
  texts[1] - text at the end of the game
  texts[2] - timer text

*/
// Enviroment
var walls = [];
const worldX  = 64;
const worldY = 64;
const worldH = 900;
const worldW = 1800;
const sectorW = 600;
var zones = [];

// Player
var Player, Energy, Lives, cLives, cEnergy;
var EnergyBar, EnergyText;
var frame, frame_offsetX, frame_offsetY;
var bullets;
var currentSpeed = 0, myX, myY;
// 0,1 reserved for normal ones
// 2 - +1 life
// 3 - 100% energy
var eBonus = [];

// Enemy
var Enemy, Enemy_lives, cELives;
var Enemyname;
var enemyBullets;
var Eframe_offsetX, Eframe_offsetY;
var enX, enY;

// Help variables
var nextFire = 0;
var nextBonus = 0;
var fireRate = 700;
var speed = 700;
var adSpeed = 700;
var strafe;
var keyboard;
var sBullet;
var timer, _timer = 300;

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
    game.load.image('wall', 'images/walls.png');
    game.load.spritesheet('health_bar', 'images/Health_bar.png', 242, 98, 7);
    game.load.spritesheet('Ehealth_bar', 'images/Health_barE.png', 242, 98, 7);
    game.load.image('energy_bar', 'images/Energy_bar.png');
    game.load.image('bonus', 'images/energy.png');
    game.load.image('heartBonus', 'images/heart.png');
    game.load.image('energyBonus', 'images/battery.png');
  },
  create: function(){
    //  Resize game world
    game.world.setBounds(worldX, worldY, worldW, worldH);
    game.stage.backgroundColor = 0x000000;
    //canvasNode.width = window.innerWidth;
    //canvasNode.height = window.innerHeight;

    socket.emit('get_player');
    /* Setting enviroment variables */
    // 0 - normal ground on the left
    // 1 - normal ground on the right
    // 2 - middle ground

    zones.push({
      x: worldX,
      y: worldY,
      w: sectorW,
      h: worldH});
    zones.push({
      x: worldX + worldW - sectorW,
      y: worldY,
      w: sectorW,
      h: worldH});
    zones.push({
      x: worldX + sectorW,
      y: worldY,
      w: sectorW,
      h: worldH});
    /*    --Setting textures--*/
    // Enviroment
    game.add.tileSprite(zones[0].x, zones[0].y, zones[0].w, zones[0].h, 'normal_ground');
    game.add.tileSprite(zones[1].x, zones[1].y, zones[1].w, zones[1].h, 'normal_ground');
    game.add.tileSprite(zones[2].x, zones[2].y, zones[2].w, zones[2].h,  'middle_ground');

    var wall_size = 64;
    walls[0] = game.add.tileSprite(worldX + 300, game.world.centerY - 200, wall_size, 400, 'wall');
    walls[1] = game.add.tileSprite(worldW - 300, game.world.centerY - 200, wall_size, 400, 'wall');
    //walls[2] = game.add.tileSprite(worldW + wall_size, worldY + 1, wall_size, worldH + wall_size, 'wall'); //right
    //walls[3] = game.add.tileSprite(worldX, worldH + wall_size + 1, worldW, wall_size, 'wall'); //bottom

    // Init all bonuses and generate only normal one on my side.
    // If im room owner (im playing on the left) then generate special bonuses every x sec
    var generatexy;
    if (myX < sectorW)  generatexy = 0;
    else generatexy = 1;
    eBonus.push(new normalBonus(zones[0], generatexy ? 0 : 1));
    eBonus.push(new normalBonus(zones[1], generatexy));
    socket.emit('sMyBonus', eBonus[generatexy].object.x, eBonus[generatexy].object.x, generatexy);
    eBonus.push(new heartBonus(zones[2], 0));
    eBonus.push(new batteryBonus(zones[2], 0));
    //console.log (eBonus1.object.sector);

    // Players
    Player = game.add.sprite(myX, myY, 'player');
    Player.anchor.setTo(0.5);
    Player.x = myX;
    Player.y = myY;

    for (p in Players) {
      if (Players[p] != MyName) {
        Enemyname = Players[p];
        Enemy = game.add.sprite(enX, enY, 'enemy');
        Enemy.anchor.setTo(0.5);
        Enemy.x = enX; Enemy.y = enY;

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

    if (Enemy != undefined) {
      var Ename = game.add.text (169 + Eframe_offsetX, 130 + Eframe_offsetY, Enemyname, { font: "15px Courier", fill: "#000 ", align: "center" });
      Ename.fixedToCamera = true;
    }
    // End game text
    texts[1] = game.add.text(game.world.centerX, game.world.height - 100, "", { font: "40px Courier", fill: "#c00", align: "center" });
    texts[1].anchor.set(0.5);
    // Timer
    texts[2] = game.add.text(game.world.centerX - 50, window.innerHeight , "", { font: "40px Courier", fill: "#fff", align: "center" });
    //texts[2].anchor.set(0.5);
    _timer = 300;
    timer = setInterval(function() {
      texts[2].setText(formatTime(_timer));
      _timer -- ;
      // Generate special bonus every 30 seconds
      if (_timer%30 == 0 && myX < sectorW) {
        // 20% for heart bonus, 80% for battery
        var random = game.rnd.integerInRange(2, 6);
        if (random < 5) random = 2; else random = 3;
        eBonus[random].object.x = game.rnd.integerInRange(eBonus[random].object.sector.x, eBonus[random].object.sector.x + eBonus[random].object.sector.w-64);
        eBonus[random].object.y = game.rnd.integerInRange(eBonus[random].object.sector.y, eBonus[random].object.sector.y + eBonus[random].object.sector.h-64);
        socket.emit('sMyBonus', eBonus[random].object.x, eBonus[random].object.y, random);
      }
    }, 1000);

    // Bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(50, 'enemy_bullet', 0, false);
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    // Setting Physics
    game.physics.enable(Player, Phaser.Physics.ARCADE);
    Player.body.setCircle(64);
    if (Enemy != undefined) {
      game.physics.enable(Enemy, Phaser.Physics.ARCADE);
      Enemy.body.setCircle(64);
    }
    Player.body.drag.set(0.2);
    Player.body.maxVelocity.setTo(MaxSpeed, MaxSpeed);
    Player.body.collideWorldBounds = true;

    for (var i = 0; i < walls.length; i++) {
      game.physics.enable(walls[i], Phaser.Physics.ARCADE);
      walls[i].body.immovable = true;
    }
    // Camera
    game.camera.follow(Player);
    game.camera.focusOnXY(Player.x, Player.y);
    // Keyboard input
    keyboard = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );;
  },

  update: function(){
    //game.physics.arcade.collide(walls, Player);
    game.physics.arcade.overlap(walls, Player, playerInWall, null, this);
    for (var i = 0; i < eBonus.length; i++)
      game.physics.arcade.overlap(eBonus[i].object, Player, function(bonus, player){playerInBonus(bonus, player, i)}, null, this);
    game.physics.arcade.overlap(bullets, walls, bulletHitWall, null, this);
    game.physics.arcade.overlap(enemyBullets, walls, bulletHitWall, null, this);
    game.physics.arcade.overlap(enemyBullets, Player, bulletHitPlayer, null, this);
    if (Enemy != undefined) game.physics.arcade.overlap(bullets, Enemy, bulletHitEnemy, null, this);
    // Controls
    /* 1. Option for controls
      in this one player will follow the mouse and move forward by
      pressing 'w' or backward by 's', also player can strafe by pressing 'a' or 'd'
      */
    /*strafe = 0;
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
    var old_rot = Player.rotation;

    Player.rotation = game.physics.arcade.angleToPointer(Player);
    strafe = Phaser.Math.degToRad(strafe);
    game.physics.arcade.velocityFromRotation(Player.rotation + strafe, currentSpeed, Player.body.velocity);
    // End of 1. Option for controls
  */
  /* 2. Option for controls
    Player can move by 'w' - up,'a' - down,'s' - left,'d' - right
    and also with all these keys combined.
    */
    adSpeed = 0;
    currentSpeed = speed;
    var point = {
      x: Player.x,
      y: Player.y
    }
    if (keyboard.left.isDown){
      //strafe = -90;
      point.x -= 10;
    }
    if (keyboard.right.isDown){
      point.x += 10;
    }
    if (keyboard.up.isDown){
      point.y -= 10;
    }
    if(keyboard.down.isDown){
      point.y += 10;
    }
    if (point.x == Player.x && point.y == Player.y) {
      currentSpeed = 0;
    }
    game.physics.arcade.moveToXY(Player, point.x, point.y, currentSpeed, 0);
    var old_rot = Player.rotation;

    Player.rotation = game.physics.arcade.angleToPointer(Player);
    // End of 2. Option for controls
    if (old_rot != Player.rotation) {
      socket.emit('sPlayerAngle', Player.rotation);
    }
    if (currentSpeed != 0 || adSpeed != 0){
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
// Collision event functions
function playerInWall (player, wall) {
  if (cEnergy > 0)
    cEnergy -= 1;
}
function bulletHitWall (wall, bullet) {

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
// Function handling end of the game
function endText(win) {
  var wait = 2;
  if (win == 1) {
    texts[1].setText("You won");
    // Check for achievevements
    achieveTrack(0, 1);
    achieveTrack(1, 1);
    achieveTrack(3, 300-_timer);
    achieveTrack(4, cLives);

  }
  if (!win) texts[1].setText("You lost");
  if (win == 2) texts[1].setText("Draw");
  var waiting = setInterval(function() {
    if (wait == 0) {
      game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
      delete Players;

      // Check for achievements
      achieveTrack(2, win);
      // Clear all timers and return to lobby
      clearInterval(waiting);
      clearInterval(timer);
      game.state.start('lobby');
    }
    wait--;
  }, 1000);
}
socket.on ('sAddLive', function (value) {
  cELives += value;
  if (cElives > 6) cElives = 6;
});
socket.on('cMyBonus', function (x, y, i) {
  eBonus[i].object.x = x;
  eBonus[i].object.y = y;
});
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
// Game ended with timeout, calculate if i won
socket.on ('Timeout', function() {
  if (cELives > cLives) {
    socket.emit('GameOver', 0);
  } else if (cELives < cLives) {
    socket.emit('GameOver', 1);
  } else {
    socket.emit('GameOver', 2);
  }
});
// Game ended, handle the event
socket.on('GameEnd',function(win) {
  endText(win);
});
// Game started, set my position and all other variables
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
    frame_offsetX = window.innerWidth - 550;
    Eframe_offsetX = 0;
  } else {
    myX = _myX;
    myY = _myY;
    enX = _enX;
    enY = _enY;
    frame_offsetX = 0;
    Eframe_offsetX = window.innerWidth - 550;
  }
  cLives = 3;
  cELives = 3;
  cEnergy = 0;
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
