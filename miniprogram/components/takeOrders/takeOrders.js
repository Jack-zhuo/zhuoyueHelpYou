Component({
  properties:{
    item:{
      type:Object,
      value:{} 
    }
  },
  data:{
    isShowTakeCode:false
  },
  methods:{
    call(){
      this.triggerEvent('call',{phone:this.properties.item.address.phone});
    },
    take(){
      this.triggerEvent('take',{id:this.properties.item._id})
    },
    completed(){
      this.setData({
        isShowTakeCode:true
      })
    },
    input(e){
        const inputCode = Number(e.detail.value)
        const originalCode = this.properties.item.takeGoodsCode
        if(inputCode === originalCode){
          wx.showToast({
            title: '匹配成功啦', 
            icon:'none'
          })
          wx.cloud.callFunction({
            name:'updateOrderbyIdToCompleted',
            data:{
              id:this.properties.item._id
            },
            success:(res)=>{
              wx.cloud.database().collection('user').where({
               _openid: wx.getStorageSync('user')._openid
              }).update({
                data:{
                  balance:wx.cloud.database().command.inc(this.properties.item.price)
                }
              })
              this.triggerEvent('refresh');
            }
          })
        }
        
    }
  }
})