var socket = io.connect();

$(document).ready(function(){

  var xoxApp = new XoX(socket);

  var currentGun;

  socket.on('currentTrace',function(trassa){
    if(trassa.err) {
      var text = $("#you").text();
      $("#you").text(trassa.err);
      setTimeout(function(){
        $("#you").text(text);
      },1500);
    }else{
      for(var i in trassa){
        if(trassa[i]) $("#"+i).text(trassa[i]);
      }
    }
  });

  socket.on('currentGamer',function(gamer){
    if(gamer.err) $("#you").text(gamer.err);
    $("#you").text(gamer.msg);
    currentGun = gamer.val;
  });

  socket.on('message',function(msg){
    $("#you").text(msg);
    setTimeout(function(){
      location.reload();
    },1000);
  });

  $("#trassa div").on('click',function(){
   socket.emit('hod', { "val"  : $(this).prop('id'),
                        "gamer": currentGun }
   );
  });

  $("#help a").on('click',function(){
   socket.emit('beFree');
  });


});