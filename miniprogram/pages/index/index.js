const db = wx.cloud.database();
Page({

  data: {
    swiperItem: [
      'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/pic/1.jpg',
      'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/pic/2.jpg',
      'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/pic/3.jpg'
    ],
    item:[
      {
        img:'../../images/express.png',
        name:'代取快递',
        url:'../helpTp/helpTp'
      },{
        img:'../../images/run.png',
        name:'万能帮',
        url:'../errand/errand'
      },{
        img:'../../images/printer.png',
        name:'打印服务',

        url:'../print/print'
      }
    ]
  },
  onLoad(e) {
    
  },

  // 轮播图跳转
  gotoAnother(e){
      console.log(e.currentTarget.dataset)
      const {index} = e.currentTarget.dataset
      if (index === 0) {
        wx.navigateTo({
          url: '../applyTakeOrderer/applyTakeOrderer',
        })
        return
      }
      if (index === 1) {
        wx.setClipboardData({
          data: 'zyjava2020',
          success:()=>{
            wx.showToast({
              title: '微信复制成功',
              icon:'success'
            })
          }
        })
        return
      }
      if (index === 2) {
        wx.navigateTo({
          url: '../aboutus/aboutus',
        })
        return
      }
  },
  
  onShareAppMessage: function (res) {
    console.log(res)
    return {
      title: '三联学院跑腿小程序上线啦，帮买，帮送，帮取，啥哈都能帮的小程序',
      path: 'pages/index/index',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },
  /*分享朋友圈 */
  onShareTimeline: function () {
    return {
      title: '三联学院跑腿小程序上线啦，帮买，帮送，帮取，啥哈都能帮的小程序',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },

  btn() {
    console.log(this.data.note)
  }


})