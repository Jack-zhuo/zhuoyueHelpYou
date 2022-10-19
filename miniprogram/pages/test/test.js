let rpx
Page({
  data: {
   users:[]
  },
  onLoad(options) {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas') 
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        // ctx.setFillStyle('#123456')       
         ctx.fillRect(0, 0, 300, 100)
      })
  },

  //获取总收入
  async getIncome() {
    const res = await wx.cloud.callFunction({
      name: 'getOrdersFenye',
      data: {
        i: 0
      }
    })

    const orders = res.result.data
    console.log(orders)

    let count = 0
    let balance = 0
    for (let i = 0; i < orders.length; i++) {
      const e = orders[i];
      balance = balance + e.price
      console.log(balance)
    }
    console.log(balance)

  },
  // async InsertTotalConsume() {
  //   const res = await wx.cloud.callFunction({
  //     name: 'getOrdersFenye',
  //     data: {
  //       i: 0
  //     }
  //   })
  //   const orders = res.result.data
  //   for (let i = 0; i < orders.length; i++) {
  //     const e = orders[i];
  //     const _openid = e.address._openid
  //     const price = e.price

  //     const res = await wx.cloud.callFunction({
  //       name: 'updateTotalConsume',
  //       data: {
  //         _openid,
  //         price
  //       }
  //     })

  //     console.log(res)

  //   }

  // },
  async getUsers(){
   const res = await wx.cloud.callFunction({
      name:'getUsers',
      data:{
        orderByField:'totalConsume'
      }
    })
    console.log(res)
    let count = 0
    let users =[]
    const users_old = res.result.data
    for (let i = 0; i < users_old.length; i++) {
      const e = users_old[i];
      if(e.totalConsume){
          count++
          users = users.concat(e)
      }
    }
    this.setData({
      users
    })
    
    console.log(count)
  },
  Test(){
        this.getSystemInfo();
  },
  // 获取系统信息
  getSystemInfo() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: (f) => {
          console.log(24, f);
          rpx = f.windowWidth / 750;
          resolve();
        },
        fail: (err) => {
          resolve();
        },
      });
    });
  },
  onReady() {
   
  }
})