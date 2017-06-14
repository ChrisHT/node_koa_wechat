'use strict'

var Promise = require('bluebird')
var util = require('./util')
var request = Promise.promisify(require('request'))
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
var authPreifx = 'https://api.weixin.qq.com/sns/'
var fs = require('fs')
var _ = require('lodash')
var api = {
  accessToken:prefix + 'token?grant_type=client_credential',
  upload:prefix + 'media/upload?',
  menu:{
    create:prefix + 'menu/create?',
    get:prefix + 'menu/get?',
    del:prefix + 'menu/delete?',
    current:prefix + 'get_current_selfmenu_info?'
  },
 ticket:{
    get:prefix + 'ticket/getticket?'
 },
 qrcode:{
    create:prefix + 'qrcode/create?',
    show:mpPrefix + 'showqrcode?'
  },
  shortUrl:{
    create:prefix + 'shorturl?'
  },
  user:{
    remark:prefix + 'user/info/updateremark?',
    fetch:prefix + 'user/info?',
    batchFetch:prefix + 'user/info/batchget?'
  },
  oauth2:{
    getToken:authPreifx + 'oauth2/access_token?',
    getInfo:authPreifx + 'userinfo?'
  }
}

function Wechat(opts) {
  var that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken
  this.getTicket = opts.getTicket
  this.saveTicket = opts.saveTicket

  this.fetchAccessToken()
}

Wechat.prototype.isValidAccessToken = function(data){
  if(!data || !data.access_token || !data.expires_in){
    return false;
  }
  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = (new Date().getTime());

  if(now < expires_in){
    return true;
  }else{
    return false;
  }
}

Wechat.prototype.fetchAccessToken = function(data){
  var that = this
  if(this.access_token && this.expires_in){
    if(this.isValidAccessToken(this)){
      return Promise.resolve(this)
    }
  }
  return this.getAccessToken()
      .then(function(data){
        try{
          data = JSON.parse(data)
        }catch (e){
          return that.updateAccessToken()
        }

        if(that.isValidAccessToken(data)){
          return Promise.resolve(data)
        }else{
          return that.updateAccessToken()
        }
      })
      .then(function(data){
        that.saveAccessToken(data)
        return Promise.resolve(data)
      })
}

Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

  return new Promise(function (resolve, reject) {
    request({url: url, json: true}).then(function (response) {
      var data = response[1]
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;
      data.expires_in = expires_in;
      resolve(data)
    })
  })
}

Wechat.prototype.uploadMaterial = function(type,filepath){
  var that = this
  var form = {
    media:fs.createReadStream(filepath)
  }

  return new Promise(function(resolve,reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.upload + 'access_token=' + data.access_token + '&type=' + type
          request({method:'POST',url:url,formData:form,json:true}).then(function(response){
            var _data = response[1]
            console.log(form)

            if(_data){
              resolve(_data)
            }else{
              throw new Error('Upload material fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.createMenu = function(menu){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.menu.create + 'access_token='+ data.access_token
          request({method: 'POST', url: url,body: menu, json: true}).then(function(response){
            var _data= response[1]

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Create menu fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.getMenu = function(menu){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.menu.get + 'access_token='+ data.access_token

          request({url: url,json: true}).then(function(response){
            var _data= response[1]

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Get menu fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.deleteMenu = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.menu.del + 'access_token='+ data.access_token

          request({url: url,json: true}).then(function(response){
            var _data= response[1]

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Delete menu fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.getCurrentMenu = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.menu.current + 'access_token='+ data.access_token

          request({url: url,json: true}).then(function(response){
            var _data= response[1]

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Get current menu fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.fetchTicket = function(access_token){
  var that = this;
  return this.getTicket()
      .then(function(data){
        try{
          data = JSON.parse(data)
        }catch (e){
          return that.updateTicket(access_token)
        }

        if(that.isValidTicket(data)){
          return Promise.resolve(data)
        }else{
          return that.updateTicket(access_token)
        }
      })
      .then(function(data){
        that.saveTicket(data)
        return Promise.resolve(data)
      })
}

Wechat.prototype.updateTicket = function(access_token) {
  //var appID = this.appID;
  //var appSecret = this.appSecret;
  var url = api.ticket.get + 'access_token=' + access_token + '&type=jsapi';
  return new Promise(function (resolve, reject) {
    request({url: url, json: true}).then(function (response) {
      var data = response[1]
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;
      data.expires_in = expires_in;
      resolve(data)
    })
  })
}

Wechat.prototype.isValidTicket = function(data){
  if(!data || !data.ticket || !data.expires_in){
    return false;
  }
  var ticket = data.access_token;
  var expires_in = data.expires_in;
  var now = (new Date().getTime());

  if(ticket && now < expires_in){
    return true;
  }else{
    return false;
  }
}

Wechat.prototype.createQrcode = function(qr){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.qrcode.create + 'access_token='+ data.access_token

          request({method :'POST',url: url,body:qr,json: true}).then(function(response){
            var _data= response[1]
            var ticket = _data.ticket;
            console.log(api.qrcode.show + 'ticket=' + encodeURI(ticket));

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Create qrcode fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}


Wechat.prototype.showQrcode = function(ticket){
  return api.qrcode.show + 'ticket=' + encodeURI(ticket);
}



Wechat.prototype.createShorturl = function(action,url){
  action = action || 'long2short'
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.shortUrl.create + 'access_token='+ data.access_token
          var form = {
            action:action,
            long_url:url
          }

          request({method :'POST',url: url,body:form,json: true}).then(function(response){
            var _data= response[1]

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Create shorturl fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}


Wechat.prototype.remarkUser = function(openId,remark){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.user.remark + 'access_token='+ data.access_token
          var form = {
            openid:openId,
            remark:remark
          }

          request({method :'POST',url: url,body:form,json: true}).then(function(response){
            var _data= response[1]
            var ticket = _data.ticket;

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Remark user fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.fetchUsers = function(openIds,lang){
  var that = this;
  lang = lang || 'zh_CN'
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var options = {
            json:true
          }
          if(_.isArray(openIds)){
            options.url = api.user.batchFetch + 'access_token=' + data.access_token
            options.body = {
              user_list:openIds
            }
            options.method = 'POST'
          }else{
            options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang
          }

          request(options).then(function(response){
            var _data= response[1]
            var ticket = _data.ticket;

            if (_data) {
              resolve(_data)
            }else{
              throw new Error('Batch Fetch user fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.getCode = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){


          request({url: url,json: true}).then(function(response){
            var _data= response[1]
            console.log(_data)

            if (_data) {
              resolve(_data)
            }else{
              throw new Error(' Get oauth2 code fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}


Wechat.prototype.getWebToken = function(){
  var that = this;
  var appID = this.appID
  var appSecret = this.appSecret
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.oauth2.getToken + 'appid='+ appID + '&secret=' + appSecret + '&code=' + code + '&grant_type=authorization_code'

          request({url: url,json: true}).then(function(response){
            var _data= response[1]
            console.log(_data)

            if (_data) {
              resolve(_data)
            }else{
              throw new Error(' Get oauth2 access_token fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.getWebUserInfo = function(){
  var that = this;
  return new Promise(function(resolve, reject){
    that
        .fetchAccessToken()
        .then(function(data){
          var url = api.auth.getInfo + 'access_token=' + data.access_token + '&openid=' + openid + '&lang=zh_CN'

          request({url: url,json: true}).then(function(response){
            var _data= response[1]
            console.log(_data)

            if (_data) {
              resolve(_data)
            }else{
              throw new Error(' Get oauth2 info fails')
            }
          }).catch(function(err){
            reject(err)
          })
        })
  })
}

Wechat.prototype.reply = function(){
  var content = this.body
  var message = this.weixin
  var xml = util.tpl(content, message)

  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}

module.exports = Wechat