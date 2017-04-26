/*
  Bonus handling functions, generating special bonuses and handling the collisions
*/

normalBonus = function(sector, generatexy) {

  this.object = game.add.sprite (-100, -100, 'bonus');
  game.physics.enable(this.object, Phaser.Physics.ARCADE);
  this.object.sector = {x: sector.x, y: sector.y, w: sector.w, h: sector.h};
  this.object.body.setCircle(32);
  // Generate the coordinates if generatexy == 1
  if (generatexy)
    for (;;) {
      this.object.x = game.rnd.integerInRange(sector.x, sector.x + sector.w-64);
      this.object.y = game.rnd.integerInRange(sector.y, sector.y + sector.h-64);
      // Check if coordinates are valid
      if (!collidingWithWalls(this.object.x, this.object.y)) break;
    }
  this.object.bonus = 0;
  this.object.value = 15;

};
heartBonus = function(sector, generatexy) {

  this.object = game.add.sprite (-100, -100, 'heartBonus');
  game.physics.enable(this.object, Phaser.Physics.ARCADE);
  this.object.sector = {x: sector.x, y: sector.y, w: sector.w, h: sector.h};
  this.object.body.setCircle(32);
  if (generatexy)
    for (;;) {
      this.object.x = game.rnd.integerInRange(sector.x, sector.x + sector.w-64);
      this.object.y = game.rnd.integerInRange(sector.y, sector.y + sector.h-64);

      if (!collidingWithWalls(this.object.x, this.object.y)) break;
    }
  this.object.bonus = 1;
  this.object.value = 1;

};
batteryBonus = function(sector, generatexy) {

  this.object = game.add.sprite (-100, -100, 'energyBonus');
  game.physics.enable(this.object, Phaser.Physics.ARCADE);
  this.object.sector = {x: sector.x, y: sector.y, w: sector.w, h: sector.h};
  this.object.body.setCircle(32);
  if (generatexy)
    for (;;) {
      this.object.x = game.rnd.integerInRange(sector.x, sector.x + sector.w-64);
      this.object.y = game.rnd.integerInRange(sector.y, sector.y + sector.h-64);

      if (!collidingWithWalls(this.object.x, this.object.y)) break;
    }
  this.object.bonus = 2;
  this.object.value = 100;

};
function playerInBonus(bonus, player, i) {
  // Player collides with bonus, timer is here
  // because funtion is not called only once but multiple times
  // This prevets adding bonuses multiple times.
  if (game.time.now > nextBonus) {
    nextBonus = game.time.now + 300;

    if (bonus.bonus == 0) {
      cEnergy += bonus.value;
      if (cEnergy > 100) cEnergy = 100;
      for (;;) {
        bonus.x = game.rnd.integerInRange(bonus.sector.x, bonus.sector.x + bonus.sector.w-64);
        bonus.y = game.rnd.integerInRange(bonus.sector.y, bonus.sector.y + bonus.sector.h-64);

        if (!collidingWithWalls(bonus.x, bonus.y)) break;
      }
    }
    if (bonus.bonus == 1) {
      cLives += bonus.value;
      if (cLives > 6) cLives = 6;
      socket.emit('cAddLive', bonus.value);
      bonus.x = bonus.y = -100;
    }
    if (bonus.bonus == 2) {
      cEnergy += bonus.value;
      if (cEnergy > 100) cEnergy = 100;
      bonus.x = bonus.y = -100;
    }
    socket.emit('sMyBonus', bonus.x, bonus.y, i);
  }
}
function collidingWithWalls (x, y) {
  for (var i = 0; i < walls.length; i++) {
    if ((x + 64 > walls[i].x && x <= walls[i].x + walls[i].width) &&
        (y + 64 > walls[i].y && y <= walls[i].y + walls[i].height)) {
      return true;
    }
  }
  return false;
}
