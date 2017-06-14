'use strict';

var Koa = require('koa');
var wechat = require('./wechat/g');
var Wechat = require('./wechat/wechat');
var path = require('path');
var config = require('./config');
var reply = require('./wx/reply');
var ejs = require('ejs');
var heredoc = require('heredoc');
var crypto = require('crypto');

var tpl = heredoc(function(){/*
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
 <title>首页</title>
 <script src="http://zeptojs.com/zepto-docs.min.js"></script>
 <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
 <style scoped>
 #banner1,#banner2{
 width: 375px;
 height: 200px;
 text-align: center;
 border-radius: 20px;
 background-color: #dcdcdc;
 margin-top: 100px;
 }
 #game,#pay{
 font-size: 50px;
 text-align: center;
 margin-top: 100px;
 }
 a{
 text-decoration: none;
 }
 </style>
 </head>
 <body>
 <div id="container">
 <div id="banner1">
 <p id="game"><a href="./view/follow.html">我要游戏</a></p>
 </div>
 <div id="banner2">
 <p id="pay">我要充值</p>
 </div>
 </div>
 <script>
 wx.config({
 debug: true,
 appId: 'wx223a4560da9848f2',
 timestamp: '<%= timestamp %>',
 nonceStr: '<%= noncestr %>',
 signature: '<%= signature %>',
 jsApiList: [
 'translateVoice',
 'startRecord',
 'stopRecord',
 'onVoiceRecordEnd'
 ]
 })
 </script>
 </body>
 </html>*/
})

var createNonce = function(){
  return Math.random().toString(36).substr(2,15)
};

var createTimestamp = function(){
  return parseInt(new Date().getTime()/1000,10) + ''
};

var _sign = function(noncestr,ticket,timestamp,url){
  var params = [
      'noncestr=' + noncestr,
      'jsapi_ticket=' + ticket,
      'timestamp=' + timestamp,
      'url=' + url
  ];
  var str = params.sort().join('&');
  var shasum = crypto.createHash('sha1');
  shasum.update(str);
  return shasum.digest('hex')
};

function sign(ticket,url) {
  var noncestr = createNonce();
  var timestamp = createTimestamp();
  var signature = _sign(noncestr,ticket,timestamp,url);
  console.log(ticket);
  console.log(url);
  return{
    noncestr:noncestr,
    timestamp:timestamp,
    signature:signature
  }
}

var app = new Koa();

app.use(function *(next){
  if(this.url.indexOf('/index') > -1){
    var wechatApi = new Wechat(config.wechat);
    var data = yield wechatApi.fetchAccessToken();
    var access_token = data.access_token;
    var ticketData = yield wechatApi.fetchTicket(access_token);
    var ticket = ticketData.ticket;
    var url = this.href;
    var params = sign(ticket,url);
    console.log(params);

    this.body = ejs.render(tpl,params);
    return next
  }
  yield next
});

app.use(wechat(config.wechat,reply.reply));

app.listen(8000);
console.log('listening:8000');