 Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  }, 
  data: {
    inputCode:''
  },
  methods: {
    call() {
      this.triggerEvent('call', {
        phone: this.properties.item.address.phone
      });
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
    take() {
      this.triggerEvent('take', {
        item: this.properties.item
      })
    },
    completed() {
      const inputCode = Number(this.data.inputCode)
      const originalCode = this.properties.item.takeGoodsCode
      if (inputCode === originalCode) {
        wx.showToast({
          title: '恭喜你，成功完成这一单！',
          icon: 'none'
        })
        wx.cloud.callFunction({
          name: 'updateOrderbyIdToCompleted',
          data: {
            id: this.properties.item._id
          },
          success: (res) => {
            const {price} = this.properties.item
            console.log(price)
            wx.cloud.database().collection('user').where({
              _openid: "这是bug吗？"
            }).update({
              data: {
                balance: wx.cloud.database().command.inc(price)
              }
            })
            this.triggerEvent('refresh');
          }
        })
      }else{
        wx.showToast({
          title: '核销码错误',
          icon:'error',
          duration:2000,
          mask:true
        })
      }
    },
    input(e) {
      const inputCode = Number(e.detail.value)
      const originalCode = this.properties.item.takeGoodsCode
      this.setData({
        inputCode
      })
      

    },
    async downloadFile() {
      wx.showLoading({
        title: '正在下载中',
      })
      const {
        fileID
      } = this.properties.item

      const res = await wx.cloud.downloadFile({
        fileID
      })
      console.log(res.tempFilePath)
      const fileManager = wx.getFileSystemManager();
      fileManager.saveFile({
        tempFilePath: res.tempFilePath,
        success:(res2)=>{
          console.log('文件路径：',res2)
          wx.hideLoading()
          wx.showToast({
            title: '下载成功',
          })
          wx.openDocument({
            filePath: res2.savedFilePath,
            showMenu:true
          })
        },
        fail:()=>{
          wx.hideLoading()
          wx.showToast({
            title: '下载失败',
          })
        }
      })
   
    },
    showTakeImg(){
      console.log('jjjj')
      wx.previewImage({
        urls: [this.properties.item.takeImg],
      })
    }
  }
})