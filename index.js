/*
  Server is using node.js and mysql, running on port 3000
  As connection it uses socket.io

  Server keeps track on players online, players in queue and
  all games being played.
  Online players are indexed with their socket ids for easier use.

  Server starts by using `node index.js` command.
  There is sql dump with some accounts and data for testing purposes.
  Testing accounts are: User1, User2
  Login for these accounts are:
  Login name: 1 Password: 1 for User1
  Login name: 2 Password: 1 for User2
*/

var express = require('express');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');

var app = express();
var port = 3000;

const saltRounds = 7;

var pool = mysql.createPool ({
  connectionLimit : 100,
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'test',
  debug : false
});

app.use(express.static(__dirname + '/src'));

var sc = require ('socket.io').listen(app.listen (process.env.PORT || port, function () {
  console.log ('Listening on port ' + port);
}));

var online = 0;
var OnlineUsers = []
var Queue = [];
var Games = [];
var Achievements = loadAchievements();



sc.on ('connection', function(socket) {
  //console.log("new connection");

  function disconnect_user (socketid) {
    online -= 1;
    var index = 0;
    //Remove user from the queue
    if (Queue.length > 0) {
      for (var j = 0; j < Queue.length; j++) {
        if (Queue[j].ID == OnlineUsers[socketid].ID) {
          break;
        }
        index++;
      }
    }
    Queue.splice(index, 1);
    //User is no longer online
    delete OnlineUsers[socketid];
  }
  /*
    Creates Gameroom with 2 players from the que. First player is always
    the one who joined the que first. Second one is player with
    closes MMR to the first player.

    Every game has limit of 5 minutes.
  */
  function CreateGame () {
    var Players = [];
    var GameName;
    var userNames = [];
    var userN_index = 0;
    var MMRdiff = 10000000;
    var MMRi = 0;
    var currentMMR = Queue[0].MMR;

    //Name after socket of first player in the Game
    GameName = Queue[0].SocketID;

    //Find Closest mmr to first player in the queue
    for (var i = 1; i < Queue.length; i++) {
      if (Queue[i] != undefined) {
        if (Math.abs(Queue[i].MMR - currentMMR) < MMRdiff) {
          MMRdiff = Math.abs(Queue[i].MMR - currentMMR);
          MMRi = i;
        }
      }
    }
    var player1, player2;

    if (MMRi != 0) {
      //We have found a player, dequeue him
      player2 = Queue[MMRi];
      if (player2 != undefined) {
        // Cant create room for offline users
        if (OnlineUsers[player2.SocketID] == undefined) return;
        Players.push(player2);
        userNames[userN_index] = player2.Name;
        OnlineUsers[player2.SocketID].InGame = GameName;
        userN_index++;
      }
      Queue.splice(MMRi, 1);
    }
    player1 = Queue.shift();
    if (player1 != undefined) {
      if (OnlineUsers[player1.SocketID] == undefined) return;
      //Dequeue first player in the queue
      Players.push(player1);
      userNames[userN_index] = player1.Name;
      OnlineUsers[player1.SocketID].InGame = GameName;
    }
    for (var i = 0; i < Players.length; i++) {
      sc.to(Players[i].SocketID).emit('GameStart', userNames, i);
    }
    var Game  = {
      _Players : []
    }
    Game.Name = GameName;
    Game._Players = Players;
    Games[GameName] = Game;

    //Limit game to 5 mins
    Games[GameName].Timer = setTimeout(function() {
      for (var i = 0; i < Players.length; i++) {
        sc.to(Players[i].SocketID).emit('Timeout');
      }
    }, 300000);

    console.log("Game " + GameName + " started");
  }
  function online_players (_socket) {
    if (_socket == -1) socket.emit('online_players', online, Queue.length);
    else sc.to(_socket).emit('online_players', online, Queue.length);
  }
  function UserInfo (id) {
    var sql = "SELECT * FROM users WHERE ?? = ?";
		var inserts = ['ID', id];
		sql = mysql.format(sql, inserts);

		pool.query(sql,function(error, rows, fields){
			if(!!error){
				console.log("Error in the query");
			}else{
				if(rows.length == 0){
          return false;
				}else{
					var User =  {
                  Name: rows[0].name
               };
               socket.emit('info_user', User);
            }
			}
		});
  }
  function GetPlayer (id, inrom) {
    var sql = "SELECT * FROM players WHERE ?? = ?";
		var inserts = ['ID', id];
		sql = mysql.format(sql, inserts);

		pool.query(sql,function(error, rows, fields){
			if(!!error){
				console.log("Error in the query");
			}else{
				if(rows.length == 0){
            CreateNewPlayer(id);
            GetPlayer(id, inrom);
				}else{
					var Player = {
                  games: rows[0].games,
                  won: rows[0].won,
                  lost: rows[0].lost,
                  mmr: rows[0].mmr
               };

               if(!inrom)socket.emit('info_player', Player);
               else socket.emit('game_player', Player);
            }
			}
		});
  }
  function CreateNewPlayer(id) {
    var sql = "INSERT INTO players (games, won, lost, mmr) " +
         "VALUES (0, 0, 0, 1000)";
    var inserts = [];
    sql = mysql.format(sql, inserts);

    pool.query(sql,function(error, rows, fields){
       if(!!error){
          console.log("Error in the query");
       }
    });
  }
  function CreateUser (socket, Email, Name, Password) {
    var sql = "INSERT INTO users (mail, name, password) " +
					 "VALUES (?, ?, ?)";
		bcrypt.genSalt(saltRounds, function(err, salt) {
			 bcrypt.hash(Password, salt, function(err, hash) {
				 var inserts = [Email, Name, hash];
				 sql = mysql.format(sql, inserts);

				 pool.query(sql,function(error, rows, fields){
					 if(!!error){
						 console.log("Error in the query");
					 }else{
						 sc.to(socket).emit('RegistrationSuccesful');
					 }
				 });
			 });
		});
  }
  /*
    Loads achievements for given player and sends the data
    structure containing (Achievement_ID, Player's progress, Achievement's goal)
  */
  function loadUserAchieves(userID, socketID) {
    var userAchievements = [];
    var sql = "SELECT * FROM users WHERE ?? = ?";
    var inserts = ['ID', userID];
    sql = mysql.format(sql, inserts);

    pool.query(sql,function(error, rows, fields){
       if(!!error){
          console.log("Error in the query");
       } else if (rows.length != 0){
         sql = "SELECT * FROM user_achieve WHERE ?? = ?"
         inserts = ['user_id', userID];
         sql = mysql.format(sql, inserts);

         pool.query(sql,function(error, row, fields){
           if(!!error){
              console.log("Error in the query");
           } else {
             for (var i = 0; i < Achievements.length; i++) {
               var achieve = {
                 ID: row[i] == undefined ? Achievements[i].ID : row[i].achieve_ID,
                 progress: row[i] == undefined ? 0 : row[i].progress,
                 goal: row[i] == undefined ? Achievements[i].goal : Achievements[row[i].achieve_ID-1].goal
               }

               userAchievements.push(achieve);
             }
             userAchievements.sort(function (a, b) {return a.ID - b.ID});

             var wrapper = {
               _achievements: userAchievements
             }
             socket.emit('cinitAchieve', wrapper);
           }
         });
       }
    });
  }
  /* DISCONNECTING */
  socket.on ('try_disconnect', function () {
    if (OnlineUsers[socket.id] != undefined) {
      //User can safely disconnect
      sc.to(socket.id).emit('disconnect_allowed');
      disconnect_user(socket.id);
    }
  });
  socket.on('disconnect', function () {
    if (OnlineUsers[socket.id] != undefined) {
      sc.to(socket.id).emit('disconnect_allowed');
      disconnect_user(socket.id);
    }
  });

  /* LOGING / REGISTERING */
  socket.on('register', function (Email, Name, Password) {
    if(Email == '' || Name == '' || Password == '') return;

		var sql = "SELECT * FROM users WHERE ?? = ?";
		var inserts = ['mail', Email];
		sql = mysql.format(sql, inserts);

		pool.query(sql,function(error, rows, fields){
			if(!!error){
				console.log("Error in the query");
			}else{
				if(rows.length == 0){
          //Nobody with this UserNameExists
					var sql = "SELECT * FROM users WHERE ?? = ?";
					var inserts = ['name', Name];
					sql = mysql.format(sql, inserts);

					pool.query(sql,function(error, rows, fields){
						if(!!error){
							console.log("Error in the query");
						}else{
							if(rows.length == 0){
                //Nobody with this UserNameExists
								CreateUser(socket.id, Email, Name, Password);
                CreateNewPlayer();
							}else{
								sc.to(socket.id).emit('LoginNameExists');
								return;
							}
						}
					});
				}else{
					sc.to(socket.id).emit('UserNameExists');
					return;
				}
			}
		});
  });
  socket.on('login' , function(Email, Password){

		if(Email == '' || Password == '') return;

		var sql = "SELECT * FROM users WHERE ?? = ?";
		var inserts = ['mail', Email];
		sql = mysql.format(sql, inserts);

		pool.query(sql,function(error, rows, fields){
			if(!!error){
				console.log("Error in the query");
			}else{
        // User name doesnt exist
				if(rows.length == 0){
					sc.to(socket.id).emit('InvalidUser');
				}else{
					bcrypt.compare(Password, rows[0].password, function(err, res) {
						if(res===true){

              sql = "SELECT * FROM players WHERE ?? = ?";
              inserts = ['ID', rows[0].ID];
          		sql = mysql.format(sql, inserts);
              // Load user's game information
              pool.query(sql,function(error, row, fields){
          			if(!!error){
          				console.log("Error in the query");
          			}else{
                  // Add user to online users
                  online += 1;
                  OnlineUsers[socket.id] = {
                    ID:rows[0].ID,
                    InGame: -1,
                    Name: rows[0].name,
                    mmr: row[0].mmr
                  };
                }
             });
             // Load achievements for user and send all other users message
             // that new player logged in
							sc.to(socket.id).emit('LoginSuccesful');
              loadUserAchieves(rows[0].ID, socket.id);
              online_players(-1);
						}else{
							sc.to(socket.id).emit('InvalidPassword');
						}
					});
				}
			}
		});
	});
  /* GAME HANDLING FUNCTIONS */
  socket.on ('leave_que', function() {
    // Remove player from the que
    if (OnlineUsers[socket.id] == undefined) return;
    if (OnlineUsers[socket.id].InGame != -1) return;
    for (var i = 0; i < Queue.length; i++) {
      if (Queue[i].SocketID == socket.id)  {
        Queue.splice(i, 1);
        return;
      }
    }
  });
  socket.on ('to_queue', function() {
    if (OnlineUsers[socket.id] == undefined) return;
    //Add user to queue
    Queue.push({
      ID : OnlineUsers[socket.id].ID,
      SocketID: socket.id,
      Name: OnlineUsers[socket.id].Name,
      MMR: OnlineUsers[socket.id].mmr
    })
    //Make new match every (wait) seconds, wait to players to queue so they have better chance
    //meeting same mmr players
    var wait;
    if (Queue.length < 5) wait = 4;
    else if (Queue.length < 10) wait = 2;
    else if (Queue.length < 100) wait = 1;
    else if (Queue.length >= 100) wait = 0;
    var waiting = setInterval(function() {
      if (wait == 0) {
        clearInterval(waiting);
        if (Queue.length >= 2) {
          CreateGame();
        }
      }
      wait --;
    }, 1000);
  });
  /*
    Handles the game over event.
    First it sends all players in the game that game has ended
    then it calculates MMRs of both players depending on `win` param
    If any player disconnects during the game MMRs are not calculated,
    but new win/lost game statistics are still written in database.

    There are 2 catches on `GameOver` at the end of the match - one from each player
    The server just handles the first that comes and ignores all after that.
  */
  socket.on ('GameOver', function (win) {
    if (OnlineUsers[socket.id] == undefined) return;

    var GameName = OnlineUsers[socket.id].InGame;
    var Game = Games[GameName];

    if (Game == undefined) return;

    var mmr1 = -1, mmr2 = -1, id1 = -1, id2 = -1, factor = 0.3, minReward = 5;

    //Announce to players that game ended
    for (var i = 0; i < Game._Players.length; i++){
      if (OnlineUsers[Game._Players[i].SocketID] != undefined)
        OnlineUsers[Game._Players[i].SocketID].InGame = -1;

      if(Game._Players[i].SocketID == socket.id){
        id1 = i;
        sc.to(Game._Players[i].SocketID).emit('GameEnd', win);
      } else if(Game._Players[i].SocketID != socket.id){
        id2 = i;
        if (!win) sc.to(Game._Players[i].SocketID).emit('GameEnd', 1);
        if (win == 1) sc.to(Game._Players[i].SocketID).emit('GameEnd', 0);
        else sc.to(Game._Players[i].SocketID).emit('GameEnd', win);
      }
    }
    var calculate = 1;
    //Calculate new mmrs, if one of players disconnects dont calculate anything
    if (OnlineUsers[Game._Players[id1].SocketID] != undefined && id1 != -1)
      mmr1 = OnlineUsers[Game._Players[id1].SocketID].mmr;
    else
      calculate = 0;
    if (OnlineUsers[Game._Players[id2].SocketID] != undefined && id2 != -1)
      mmr2 = OnlineUsers[Game._Players[id2].SocketID].mmr;
    else
      calculate = 0;
    if (calculate) {
      var new_mmr = Math.abs(mmr1 - mmr2) * factor;
      if (new_mmr < minReward) new_mmr = minReward;
      if (win == 1) {
        if (mmr1 > mmr2) {
          mmr1 += 1;
          mmr2 -= minReward;
        } else if (mmr1 < mmr2) {
          mmr1 += new_mmr;
          mmr2 -= new_mmr;
        } else {
          mmr1 += minReward;
          mmr2 -= minReward;
        }
      }
      if (win == 0) {
        if (mmr1 < mmr2) {
          mmr1 -= minReward;
          mmr2 += 1;
        } else if (mmr1 > mmr2) {
          mmr1 -= new_mmr;
          mmr2 += new_mmr;
        } else {
          mmr1 -= minReward;
          mmr2 += minReward;
        }
      }

      OnlineUsers[Game._Players[id1].SocketID].mmr = mmr1;
      OnlineUsers[Game._Players[id2].SocketID].mmr = mmr2;
    }
    id1 = Game._Players[id1].ID;
    id2 = Game._Players[id2].ID;
    //Write to database
    var sql = "SELECT * FROM players WHERE ?? = ?";
    var inserts = ['ID', id1];
    sql = mysql.format(sql, inserts);
    pool.query(sql,function(error, rows, fields){
      if(!!error){
        console.log("Error in the query");
      }else{
        var Player = {
          games: rows[0].games,
          won: rows[0].won,
          lost: rows[0].lost
        };
        if (win == 1) Player.won += 1;
        else if (win == 0) Player.lost += 1;
        if (calculate) {
          sql = "UPDATE players SET `games` = ?, `won` = ?, `lost` = ?, `mmr` = ? WHERE `ID` = ?";
          inserts = [(Player.games + 1), Player.won, Player.lost, mmr1, id1];
        } else {
          sql = "UPDATE players SET `games` = ?, `won` = ?, `lost` = ? WHERE `ID` = ?";
          inserts = [(Player.games + 1), Player.won, Player.lost, id1];
        }
        sql = mysql.format(sql, inserts);
        pool.query(sql,function(error, row, fields){
          if(!!error)
            console.log("Error in the query");
        });
       }
    });

    sql = "SELECT * FROM players WHERE ?? = ?";
    inserts = ['ID', id2];
    sql = mysql.format(sql, inserts);
    pool.query(sql,function(error, rows, fields){
      if(!!error){
        console.log("Error in the query");
      }else{
        var Player = {
          games: rows[0].games,
          won: rows[0].won,
          lost: rows[0].lost
        };
        if (win == 1) Player.lost += 1;
        else if (win == 0) Player.won += 1;
        if (calculate) {
          sql = "UPDATE players SET `games` = ?, `won` = ?, `lost` = ?, `mmr` = ? WHERE `ID` = ?";
          inserts = [(Player.games + 1), Player.won, Player.lost, mmr2, id2];
        } else {
          sql = "UPDATE players SET `games` = ?, `won` = ?, `lost` = ? WHERE `ID` = ?";
          inserts = [(Player.games + 1), Player.won, Player.lost, id2];
        }
        sql = mysql.format(sql, inserts);
        pool.query(sql,function(error, row, fields){
        if(!!error)
          console.log("Error in the query");
        });
       }
    });
    //Clear timeouts and delete Game
    clearTimeout (Games[GameName].Timer);
    delete Games[GameName];
    console.log ("Game " + GameName + " ended");
  });
  /* ACHIEVEMENTS */
  socket.on('sAchieveComplete', function(userName, achieve_id) {
    var sql = "SELECT * FROM users WHERE ?? = ?";
		var inserts = ['name', userName];
		sql = mysql.format(sql, inserts);

		pool.query(sql,function(error, rows, fields){
			if(!!error){
				console.log("Error in the query");
			} else if (rows.length != 0){

        sql = "UPDATE user_achieve SET `progress` = ? WHERE `user_ID` = ? and `achieve_ID` = ?";
        inserts = [Achievements[achieve_id - 1].goal, rows[0].ID, achieve_id];
        sql = mysql.format(sql, inserts);
        pool.query(sql,function(error, row, fields){
          //console.log(row);
           if(!!error){
              console.log("Error in the query");
           } else if (row.changedRows == 0) {
             sql = "INSERT INTO user_achieve (user_ID, achieve_ID, progress) " +
                  "VALUES (?, ?, ?)";
             inserts = [rows[0].ID, achieve_id, Achievements[achieve_id - 1].goal];
             //console.log (sql);
             sql = mysql.format(sql, inserts);
             pool.query(sql,function(error, rows, fields){
                if(!!error){
                   console.log("Error in the query1");
                }
             });
           }
        });

      }
    });
  });
  socket.on('sAchieveReset', function(userName, achieve_id) {
    var sql = "SELECT * FROM users WHERE ?? = ?";
    var inserts = ['name', userName];
    sql = mysql.format(sql, inserts);

    pool.query(sql,function(error, rows, fields){
      if(!!error){
        console.log("Error in the query");
      } else if (rows.length != 0){

        sql = "UPDATE user_achieve SET `progress` = ? WHERE `user_ID` = ? and `achieve_ID` = ?";
        inserts = [0, rows[0].ID, achieve_id];
        sql = mysql.format(sql, inserts);
        pool.query(sql,function(error, row, fields){
          //console.log(row, sql);
           if(!!error){
              console.log("Error in the query");
           } else if (row.changedRows == 0) {
             sql = "INSERT INTO user_achieve (user_ID, achieve_ID, progress) " +
                  "VALUES (?, ?, ?)";
             inserts = [rows[0].ID, achieve_id, 0];
             sql = mysql.format(sql, inserts);
             //console.log (sql);
             pool.query(sql,function(error, rows, fields){
                if(!!error){
                   console.log("Error in the query1");
                }
             });
           }
        });

      }
    });
  });
  socket.on('sAchieveProgress', function(userName, achieve_id, progress) {
    var sql = "SELECT * FROM users WHERE ?? = ?";
    var inserts = ['name', userName];
    sql = mysql.format(sql, inserts);

    pool.query(sql,function(error, rows, fields){
      if(!!error){
        console.log("Error in the query");
      } else if (rows.length != 0){

        sql = "UPDATE user_achieve SET `progress` = ? WHERE `user_ID` = ? and `achieve_ID` = ?";
        inserts = [progress, rows[0].ID, achieve_id];
        sql = mysql.format(sql, inserts);
        pool.query(sql,function(error, row, fields){
          //console.log(row);
           if(!!error){
              console.log("Error in the query");
           } else if (row.changedRows == 0) {
             sql = "INSERT INTO user_achieve (user_ID, achieve_ID, progress) " +
                  "VALUES (?, ?, ?)";
             inserts = [rows[0].ID, achieve_id, progress];
             sql = mysql.format(sql, inserts);
             //console.log (sql);
             pool.query(sql,function(error, rows, fields){
                if(!!error){
                   console.log("Error in the query1");
                }
             });
           }
        });

      }
    });
  });
  socket.on('sGetAchievement', function(id) {
    var achieve = {
      ID: Achievements[id].ID,
      name: Achievements[id].name,
      desc: Achievements[id].description
    }
    sc.to(socket.id).emit('cGetAchievement', achieve);
  });
  /* GAME HELPING FUNCTIONS */
  socket.on ('online_players', function () {
    if (OnlineUsers[socket.id] != undefined) {
      online_players(socket.id);
    }
  });
  socket.on ('user_information', function () {
    if (OnlineUsers[socket.id] != undefined) {
      UserInfo(OnlineUsers[socket.id].ID);
      GetPlayer(OnlineUsers[socket.id].ID, 0);
    }
  });
  socket.on ('get_player', function () {
    if (OnlineUsers[socket.id] != undefined)
      GetPlayer(OnlineUsers[socket.id].ID, 1);
  });
  socket.on ('sPlayerAngle', function(angle) {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('cPlayerAngle', angle);
      }
  });
  socket.on('sPlayerPosition', function(x, y) {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('cPlayerPosition', x, y);
      }
  });
  socket.on('sHitEnemy', function () {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('cHitPlayer');
      }
  });
  socket.on('sHitPlayer', function() {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('cHitEnemy');
      }
  });
  socket.on ('sFire', function(bullet) {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('cFire', bullet);
      }
  });
  socket.on ('sMyBonus', function(x, y, _i) {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('cMyBonus', x, y, _i);
      }
  });
  socket.on ('cAddLive', function(value) {
    if (OnlineUsers[socket.id] == undefined) return;
    var Game = Games[OnlineUsers[socket.id].InGame];
    if (Game == undefined) return;
    for (var i = 0; i < Game._Players.length; i++)
      if (Game._Players[i].SocketID != socket.id) {
        sc.to(Game._Players[i].SocketID).emit('sAddLive', value);
      }
  });
  socket.on ('sGetAchievements', function() {
    if (OnlineUsers[socket.id] == undefined) return;
    var a = {
      _achievements: Achievements
    }
    sc.to(socket.id).emit('cGetAchievements', a);
  });
});

// Load all achievements into memory right as server starts
function loadAchievements () {
  var ach = [];
  var sql = "SELECT * FROM achievement";
  var inserts = [];
  sql = mysql.format(sql, inserts);

  pool.query(sql,function(error, rows, fields){
     if(!!error){
        console.log("Error in the query");
     } else {
       for (var i = 0; i < rows.length; i++) {
         ach.push (rows[i]);
       }
     }
  });
  return ach;
}
