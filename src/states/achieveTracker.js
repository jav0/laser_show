/*
  Tracker which tracks all achievements during game.
  If any completes, it sends message to server.

*/



// Data structure of achievement
// Consist of id, progress and goal.
var achievements = [];
/*
  List of achievements so far:
  (ID: name - description)
  0: Getting Started - Win 1 game.
  1: This was easy - Win 10 games.
  2: Hot Streak - Win 10 games in a row
  3: Quick game. - Win under 1 minute
  4: I had it all the time*cough*. - Win with 1 live remaining
*/
function achieveTrack (id, params) {
  if (achievements[id].progress == achievements[id].goal) return;

  switch (id) {
    case 0:
    case 1:
      achieveCompleteOrProgress(id, params);
      break;
    case 3:
      if (achievements[id].progress + params <= achievements[id].goal) {
        socket.emit('sAchieveComplete', MyName, id + 1);
        achievements[id].progress = achievements[id].goal;
      }
      break;
    case 4:
    case 2:
      if (params == 1)
        achieveCompleteOrProgress(id, params);
      else
        achieveReset(id, params);
      break;
    default:
      break;
  }
}

function initAchieve(_achievements) {
  achievements.splice(0, achievements.length);
  for (var i = 0; i < _achievements.length; i++) {
    achievements.push(_achievements[i]);
  }
}
function achieveCompleteOrProgress (id, params) {
  if (achievements[id].progress + params == achievements[id].goal) {
    socket.emit('sAchieveComplete', MyName, id + 1);
    achievements[id].progress = achievements[id].goal;
  } else {
    socket.emit('sAchieveProgress', MyName, id + 1, achievements[id].progress + params);
    achievements[id].progress += params;
  }
}
function achieveReset (id, params) {
  if (achievements[id].progress > 0) {
    socket.emit('sAchieveReset', MyName, id + 1);
    achievements[id].progress = 0;
  }
}

socket.on('cinitAchieve', function(achieve) {

  initAchieve(achieve._achievements);
});
