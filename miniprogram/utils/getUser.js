export const getUser = () => {
  return new Promise((resolve, reject) => {
    wx.cloud.database().collection('user').get({
      success: (result) => {
        const user = result.data[0]
        resolve(user);
      },
      fail: (err) => {
        reject(err);
      }
    })
  })
}