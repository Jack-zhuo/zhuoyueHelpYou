Component({
  properties:{
    item:{
      type:Object,
      value:{}
    }
  },
  methods:{
    getWeChat(){
        wx.setClipboardData({
          data: 'zyjava2020',
          success: () => {
            wx.showToast({
              title: '复制客服微信成功！',
              icon: 'none'  
            })
          }
        })
    },
    call(){
      wx.makePhoneCall({
        phoneNumber: this.properties.item.takeOrderer.info.phone,
      })
    },
    // 复制订单号
    copyId(e){
     wx.setClipboardData({
       data: e.currentTarget.dataset.id,
       success:()=>{
         wx.showToast({
           title: '订单号已复制',
           icon:'success'
         })
       }
     })
    },
   //退款
  async refund() {
    const resTip = await wx.showModal({
      'title':'确定退款吗？',
      'content':'有任何疑问都可以联系微信 zyjava2020'
    })
    if(resTip.cancel) return
    wx.showLoading({
      title: '退款中',
    })
    const refundOrder = "tk" + new Date().getTime()
   const price = Math.round(this.properties.item.price*100)  

   const res = await wx.cloud.callFunction({
      name: 'refund',
      data: {
        refundOrder,//商户退款单号
        trade:this.properties.item._id,//订单号
        price
      }
    })
    console.log(res);
    if(res.result.returnCode === "SUCCESS"){
     const resDel = await wx.cloud.callFunction({
        name:'deleteOrderById',
        data:{
          _id:this.properties.item._id
        }
      })
      wx.hideLoading()
      wx.showToast({
        title: '退款成功',
        icon:'success'
      })
    }
  },

    
  }
})