var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    cache = {},
    xox = require('./lib/xox_server');

function zero(i){
        i < 10  ?  result ="0"+i  :  result = i  ;
        return result ;
    }

function showData(){
        var data = new Date(),
            h = zero(data.getHours()),
            min = zero(data.getMinutes()),
            s = zero(data.getSeconds()),
            d = zero(data.getDate()),
            mon = zero(data.getMonth()+1),
            y = data.getFullYear();
        return fullData = d+"."+mon+"."+y+" | "+h+":"+min+":"+s;
    }

function send404(response){
  response.writeHead(404, {'Content-Type':'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response,filePath,fileContents){
  response.writeHead(
                    200,
                    {"content-type": mime.lookup(path.basename(filePath)) });
  response.end(fileContents);
}

function  serveStatic(response,cache,absPath){
  if (cache[absPath]){
    sendFile(response , absPath , cache[absPath]);
  } else {
    fs.exists(absPath, function(exists){
      if(exists){
        fs.readFile(absPath,function(err,data){
          if(err){
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response,absPath,data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

var server = http.createServer(function(request,response){
  var filePath = false;

  if(request.url == '/'){
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;

  serveStatic(response,cache,absPath);
});

server.listen(8080,function(){
  console.log("server started! Listen port : 8080 "+showData());
});

xox.listen(server);