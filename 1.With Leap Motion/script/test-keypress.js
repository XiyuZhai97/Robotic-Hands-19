var keypress = require('keypress');
keypress(process.stdin);

process.stdin.on('keypress', function (ch, key) {
  if (key &&  key.name == 'm') {
  	console.log("进入模仿模式");
  	process.stdin.pause();
  }else if (key &&  key.name == 'r') {
  	console.log("进入猜拳模式");
  	process.stdin.pause();
  }
});
process.stdin.setRawMode(true);
