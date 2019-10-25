var socketio = require('socket.io'),
    io,activeGamerTimer,
    gamers = {"x":"","o":""},
    trassa    = {
      "1":"","2":"","3":"",
      "4":"","5":"","6":"",
      "7":"","8":"","9":""
    },
    activeGamer = "";

    resZN = function(){
      gamers = {"x":"","o":""},
      trassa = {
      "1":"","2":"","3":"",
      "4":"","5":"","6":"",
      "7":"","8":"","9":""
      },
      activeGamer = ""
    };

    //setInterval(resZN,10000);

function is_WIN(trassa){
  if ( (trassa[1] == trassa[2]) && (trassa[1] == trassa[3]) && (trassa[1] != "") && (trassa[2] != "") && (trassa[3] != "") || // 1--
       (trassa[4] == trassa[5]) && (trassa[4] == trassa[6]) && (trassa[4] != "") && (trassa[5] != "") && (trassa[6] != "") || // 2--
       (trassa[7] == trassa[8]) && (trassa[7] == trassa[9]) && (trassa[7] != "") && (trassa[8] != "") && (trassa[9] != "") || // 3--
       (trassa[1] == trassa[4]) && (trassa[1] == trassa[7]) && (trassa[1] != "") && (trassa[4] != "") && (trassa[7] != "") || // 1|
       (trassa[2] == trassa[5]) && (trassa[2] == trassa[8]) && (trassa[2] != "") && (trassa[5] != "") && (trassa[8] != "") || // 2|
       (trassa[3] == trassa[6]) && (trassa[3] == trassa[9]) && (trassa[3] != "") && (trassa[6] != "") && (trassa[9] != "") || // 3|
       (trassa[1] == trassa[5]) && (trassa[1] == trassa[9]) && (trassa[1] != "") && (trassa[5] != "") && (trassa[9] != "") || // \
       (trassa[3] == trassa[5]) && (trassa[3] == trassa[7]) && (trassa[3] != "") && (trassa[5] != "") && (trassa[7] != "")    // /

  ){
    return true;
  }
}

function is_DRAW(trassa){
  if ( ( trassa[1] && trassa[2] && trassa[3] && trassa[4] && trassa[5] && trassa[6] && trassa[7] && trassa[8] && trassa[9] ) != ""){
    return true;
  }
}

function Gamer(socket,gamers){

    if ( ( gamers["x"].indexOf(socket.request.connection.remoteAddress) === -1 ) && (gamers["o"].indexOf(socket.request.connection.remoteAddress) === -1) ){
          switch( true ){
          case gamers["x"] == "":
            gamers["x"] = socket.request.connection.remoteAddress;
            return {"val":"x","msg":"Вы игрок X"};
            break;
          case gamers["o"] == "":
            gamers["o"] = socket.request.connection.remoteAddress;
            return {"val":"o","msg":"Вы игрок O"};
            break;

          default:
            return {"err":"Сейчас занято... попробуйте позже..."};
          break;
        }
    } else {
      for(var i in gamers){
        if ( gamers[i] == socket.request.connection.remoteAddress ) return {"val":i,"msg":"Вы игрок "+i.toUpperCase()};
      }
    }

}

exports.listen = function(server){
  io = socketio.listen(server);

  io.sockets.on('connection',function(socket){

    socket.emit('currentTrace', trassa);
    socket.emit('currentGamer', Gamer(socket,gamers) );

    socket.on('beFree', function(){
      if ( activeGamer == ""){
        socket.emit('message', "игра прервана!");
        socket.broadcast.emit('message', "игра прервана!");
        setTimeout(resZN,0);
      } else {
        socket.emit('message', "Нельзя прервать активную игру!");
        console.log(":"+activeGamer);
      }
    });


    socket.on('hod',function(hod){
      if(trassa[hod.val] == "" ){
        if(activeGamer != socket.request.connection.remoteAddress){
          trassa[hod.val] = hod.gamer;
          if ( is_WIN(trassa) ){

            if(socket.request.connection.remoteAddress != activeGamer){
              socket.emit('currentTrace', trassa);
              socket.emit('message', "Ты победил!");
              setTimeout(resZN,0);
            }

            socket.broadcast.emit('currentTrace', trassa);
            socket.broadcast.emit('message', "неудача, ничего повезет еще!");
            setTimeout(resZN,0);
          }
          else if( is_DRAW(trassa) ){
            socket.emit('currentTrace', trassa);
            socket.broadcast.emit('currentTrace', trassa);
            socket.emit('message', "ничья!");
            socket.broadcast.emit('message', "ничья!");
            setTimeout(resZN,0);
          } else {
            if (activeGamerTimer) clearInterval(activeGamerTimer);
            activeGamer = socket.request.connection.remoteAddress;
            activeGamerTimer = setTimeout(function(){
              activeGamer = "";
            },15000);
            socket.emit('currentTrace', trassa);
            socket.broadcast.emit('currentTrace', trassa);
          }
        } else {
          socket.emit('currentTrace', {"err":"сейчас не твой ход!"});
        }
      } else {
        socket.emit('currentTrace', {"err":"клеточка не пустая!"});
      }

    });


  socket.on('disconnect',function(){
    /*for(var i in gamers){
      if(gamers[i] == socket.request.connection.remoteAddress){
        gamers[i] = "";
        resZN();
        socket.emit('currentTrace', trassa);
      }
    }*/


  });

  });
};