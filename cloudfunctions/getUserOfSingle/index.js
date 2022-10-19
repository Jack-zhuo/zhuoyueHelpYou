// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_user = cloud.database().collection('user')

// 云函数入口函数
exports.main = async (event, context) => {
    const user = await db_user.where({
      _openid:event._openid
    }).get()
    return user
}