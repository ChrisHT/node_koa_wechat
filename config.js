'use strict'

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname,'./config/wechat.txt');
var wechat_ticket_file = path.join(__dirname,'./config/wechat_ticket.txt')
var config = {
  wechat:{
    appID:'wx223a4560da9848f2',//公众号id
    appSecret:'c774257398922e77b15cf5b23ec29fe9',//公众号secret
    token:'nowdone',
    getAccessToken:function(){
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken:function(data){
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file,data)
    },
    getTicket:function(){
      return util.readFileAsync(wechat_ticket_file)
    },
    saveTicket:function(data){
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_ticket_file,data)
    }
  }
}

module.exports = config