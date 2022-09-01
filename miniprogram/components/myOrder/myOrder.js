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
   async complete(){
    const res0 = await wx.showModal({
       title:'确定送达了吗？'
     })
     if(res0.cancel) return
     
      wx.showLoading({
        title: '处理中...',
      })

      const order = this.properties.item
      const price = order.price
      const user_id = order.takeOrderer._id
      const id = order._id
     
     const res1 = await wx.cloud.callFunction({
        name:'updateBalance',
        data:{
         user_id,
         balance:price
        }
      })
      if (res1.result.stats.updated === 1){
        const res2 = await wx.cloud.callFunction({
          name:'updateOrderbyIdToCompleted',
          data:{
            id,
          }
        })
       wx.hideLoading();
       wx.showToast({
         title: '完成',
         duration:2000,
         mask:true
       })
       setTimeout(()=>{
        this.triggerEvent('refresh')
       },2000)
      }
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

    // 判断是否已经被接单
    const res8 = await wx.cloud.database().collection('orders').doc(this.properties.item._id).get();
     console.log(res8.data.status);
     if (res8.data.status === 2) {
      const res9 = await wx.showModal({
        title: '已有接单员接了你的订单，暂不可退款，请联系接单员协商，谢谢~~~',
        confirmText:'拨打'
       })
       if(res9.confirm){
        const {phone} = res8.data.takeOrderer.info
        wx.makePhoneCall({
          phoneNumber: phone,
        })
       }
      this.triggerEvent("getOrdersPaid")
       return
     }

    wx.showLoading({
      title: '退款中',
    })
    const refundOrder = "tk" + new Date().getTime()
   const price = Math.round(this.properties.item.price)  

   const res = await wx.cloud.callFunction({
      name: 'refund',
      data: {
        refundOrder,//商户退款单号
        trade:this.properties.item._id,//订单号
        price
      }
    })
    console.log(res);
    if(res.result.resultCode === "SUCCESS"){
     const resDel = await wx.cloud.callFunction({
        name:'deleteOrderById',
        data:{
          _id:this.properties.item._id
        }
      })
      this.triggerEvent("getOrdersPaid")
      wx.hideLoading()
      wx.showToast({
        title: '退款成功',
        icon:'success'
      })
    }else{
      wx.showToast({
        title: '出错了，请联系管理员处理',
        icon:'none'
      })
    }
  },

    
  }
})