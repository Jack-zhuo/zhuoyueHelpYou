 App({
   globalData:{
     address:{}
   },
   onLaunch: function () {
     // 初始化云环境
     wx.cloud.init({
       env: "zhuoyuebang-1gx979jw039db365"
     })
     this.getOpenid();
     this.getInfo();
   },
   getOpenid() {
     wx.cloud.callFunction({
       name: 'login',
       success: (res) => {
         console.log(res);
         wx.setStorageSync('openid', res.result.openid)
       }
     })
   },
   async getInfo() {
      // 查询本地缓存中有没有info
     let user = wx.getStorageSync('user');
     if (user) {
       return
     }
    //  查询数据库中有没有user
     const res = await wx.cloud.database().collection('user').get();
     console.log('app.js初始化', res.data[0]);
     user = res.data[0]
     if (user) {
       wx.setStorageSync('user', user)
       return
     }
     //初始化新用户头像，昵称和手机号
     user = {
       info: {
         name: '三联小可爱',
         avatar: `cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/defaultAvatar/${Math.floor(Math.random()*10)}.png`,
         phone: ''
       },
       isTakeOrderer: false,
       balance:0
     }

     // 将info分别存在，本地缓存，和数据库中
     wx.setStorageSync('user', user)
     wx.cloud.database().collection('user').add({
       data: {
         ...user
       }
     })

   },

 });