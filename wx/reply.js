'use strict'

var config = require('../config')
var Wechat = require('../wechat/wechat')
var wechatApi = new Wechat(config.wechat)
var menu = require('./menu')
var path = require('path')

wechatApi.deleteMenu().then(function(){
  return wechatApi.createMenu(menu)
}).then(function(msg){
  console.log(msg)
})

exports.reply = function *(next) {
  var message = this.weixin

  if(message.MsgType === 'event'){
    if(message.Event === 'subscribe'){
      if(message.EventKey){
        console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
        console.log(parseInt(message.EventKey))
      }
      this.body = '感谢订阅,回复666领取游戏币\r\n'
    }else if(message.Event === 'unsubscribe'){
      console.log('取消关注')
      this.body = ''
    }
    else if (message.Event === 'LOCATION'){
      this.body = '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
    }
    else if(message.Event === 'CLICK'){
      this.body = '您点击了菜单：' + message.EventKey
    }
    else if(message.Event === 'SCAN'){
      console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket)
      this.body = '扫一下哦'
    }
    else if(message.Event === 'VIEW'){
      this.body = '您点击了菜单中的链接；' + message.EventKey
    }else if(message.Event === 'scancode_push'){
      console.log(message.ScanCodeInfo.ScanType)
      console.log(message.ScanResult.ScanResult)
      this.body= '您点击了菜单的链接：'+ message.EventKey
    }else if(message.Event === 'scancode_waitmsg'){
      console.log(message.ScanCodeInfo.ScanType)
      console.log(message.ScanResult.ScanResult)
      this.body= '您点击了菜单的链接：'+ message.EventKey
    }else if(message.Event === 'pic_sysphoto'){
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      this.body= '您点击了菜单的链接：'+ message.EventKey
    }else if(message.Event === 'pic_photo_or_album'){
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      this.body= '您点击了菜单的链接：'+ message.EventKey
    }else if(message.Event === 'pic_weixin'){
      console.log(message.ScanCodeInfo.PicList)
      console.log(message.ScanResult.Count)
      this.body= '您点击了菜单的链接：'+ message.EventKey
    }else if(message.Event === 'location_select'){
      console.log(message.ScanCodeInfo.Location_X)
      console.log(message.ScanCodeInfo.Location_Y)
      console.log(message.ScanCodeInfo.Scale)
      console.log(message.ScanCodeInfo.Label)
      console.log(message.ScanCodeInfo.Poiname)
      this.body= '您点击了菜单的链接：'+ message.EventKey
    }
  }
  else if(message.MsgType === 'text'){
    var content = message.Content
    var reply = '额，听不懂您说的' + message.Content +'是什么意思呢'

    if(content === '666'){
      reply = '<a href=\"http://www.baidu.com\"\>百度\</a>'
    }
    else if(content === '1'){
      reply = '一一一'
    }
    else if(content === '2'){
      reply = '鹅鹅鹅'
    }
    else if(content === '3'){
      reply = '闪闪'
    }
    else if(content === '4'){
      reply = [{
        title: '技术改变世界',
        description: '科技世界',
        picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
        url: 'https://github.com'
      },{
        title: 'nodejs 开发微信',
        description: '简单粗暴',
        picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1431337192/index-img2_fvzeow.png',
        url: 'https://nodejs.org'
      }]
    }
    else if(content === '5'){
      var data= yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'))
      reply = {
      type:'image',
      mediaId:data.media_id
      }
      //console.log(reply)
    }
    else if(content === '18'){
      var tempQr = {
        expire_seconds:40000,
        action_name:'QR_SCENE',
        action_info:{
          scene:{
            scene_id:456
          }
        }
      }
      var permQr = {
        action_name:'QR_LIMIT_SCENE',
        action_info:{
          scene:{
            scene_id:123
          }
        }
      }
      var permStrQr = {
        action_name:'QR_LIMIT_STR_SCENE',
        action_info:{
          scene:{
            scene_str:'abc'
          }
        }
      }
      var qr1 = yield wechatApi.createQrcode(tempQr);
      var qr2 = yield wechatApi.createQrcode(permQr);
      var qr3 = yield wechatApi.createQrcode(permStrQr);
      console.log(qr1);
    }
    else if(content === '33'){
      var user = yield wechatApi.fetchUsers(message.FromUserName)
      console.log(user)
      var openIds = [
        {
          openid:message.FromUserName,
          lang:'zh_CN'
        }
      ]
      var users = yield wechatApi.fetchUsers(openIds)
      console.log(users)
    }
    else if(content === '66'){
      var oauth2token = yield wechatApi.getAuthToken()
      console.log(oauth2token)
    }
    else if(content === '67'){
      var oauth2info = yield wechatApi.getAuthInfo()
      console.log(oauth2info)
    }
    else if(content === '88'){
      reply = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx223a4560da9848f2\&redirect_uri=127.0.0.1:8080\&response_type=code\&scope=snsapi_userinfo\&state=789456#wechat_redirect'
    }
  /*  else if(content === '20'){
      var Qr = yield wechatApi.showQrcode(ticket);
      console.log(Qr)
    }
    else if(content === '19'){
      var longUrl = 'http://www.imooc.com/'
      var shortData = yield wechatApi.createShorturl(null,longUrl)
      reply = shortData.short_url
    }*/
    this.body = reply
  }
  yield next
}