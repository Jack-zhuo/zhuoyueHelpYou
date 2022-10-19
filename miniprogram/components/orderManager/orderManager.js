Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },
  data: {
    inputCode: ''
  },
  methods: {
    call(e) {
      console.log(e)
      wx.makePhoneCall({
        phoneNumber:  e.currentTarget.dataset.phonenumber,
      })
    },
    previewImg(e){ 
      console.log(e)
       wx.previewImage({
         urls: [e.currentTarget.dataset.src],
       })
    },
    async deleteOrder() {
     const res2 = await wx.showModal({
        title:'确定删除吗？',
      })
      if (res2.cancel) return
      const _id = this.properties.item._id
      const res = await wx.cloud.callFunction({
        name: 'deleteOrderById',
        data: {
          _id
        }
      })
      console.log(res)
      if (res.errMsg === 'cloud.callFunction:ok') {
        wx.showToast({
          title: '删除成功',
        })
        this.triggerEvent('orders_notake')
      }
    },
    // 复制订单号
    copyId(e) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.id,
        success: () => {
          wx.showToast({
            title: '订单号已复制',
            icon: 'success'
          })
        }
      })
    },
    take() {
      this.triggerEvent('take', {
        item: this.properties.item
      })
    },
    async completed(e) {
      const res0 = await wx.showModal({
        title: '时间超过两天了吗'
      })
      if (res0.cancel) return
      wx.showLoading({
        title: '处理中...',
      })
      const {order} = e.currentTarget.dataset
      const price = Math.round(order.price * 0.8)
      const user_id = order.takeOrderer._id
      const id = order._id
      const _openid = order._openid

      const res1 = await wx.cloud.callFunction({
        name: 'updateBalance',
        data: {
          user_id,
          balance: price
        }
      })

      const res = await wx.cloud.callFunction({
        name: 'updateTotalConsume',
        data: {
          _openid,
          price:order.price
        }
      })

      if (res1.result.stats.updated === 1) {
        const res2 = await wx.cloud.callFunction({
          name: 'updateOrderbyIdToCompleted',
          data: {
            id,
          }
        })
        wx.hideLoading();
        wx.showToast({
          title: '完成',
          duration: 2000,
          mask: true
        })
        setTimeout(() => {
          this.triggerEvent('refresh')
        }, 2000)
      }
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
        success: (res2) => {
          console.log(res2)
          wx.hideLoading()
          wx.showToast({
            title: '下载成功',
          })
          wx.openDocument({
            filePath: res2.savedFilePath,
            showMenu: true
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({
            title: '下载失败',
          })
        }
      })

    }
  }
})