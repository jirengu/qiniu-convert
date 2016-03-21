var qiniu = require("qiniu");
var fs = require("fs");
var config = require('./config.json');

qiniu.conf.ACCESS_KEY = config.access_key;
qiniu.conf.SECRET_KEY = config.secret_key;

fs.readFile('file.txt', function (err, data) {
   if (err) {
       return console.error(err);
   }
   var files = data.toString()
                  .split('\n')
                  .map(function(item){return item.trim();})
                  .filter(function(item){return item!=='';})
                  .map(function(line) {
                    return line.split(',').map(function(item){return item.trim();});
                  });
   convert(files);
});

function convert(files){
  files.forEach(function(line){
    var key = line[0],
      saved_key = line[1],
      bucket = config.bucket, //要转码的文件所在的空间
      pipeline = config.pipeline, //转码所使用的队列名称。
      saveas_key = qiniu.util.urlsafeBase64Encode(config.saved_bucket + ':' + config.saved_key),
      fops = config.fops + '|saveas/' + saveas_key,
      opts = {
          pipeline: config.pipeline
      };
      var PFOP = qiniu.fop.pfop(bucket, key, fops, opts, function(err, ret) {
            if(!err) {
              // 上传成功， 处理返回值
              console.log('curl '+'http://api.qiniu.com/status/get/prefop?id='+ret.persistentId);
            } else {
              // 上传失败， 处理返回代码
              console.log(err);
            }
        });
  })
}
