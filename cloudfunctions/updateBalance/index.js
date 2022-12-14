// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_user = cloud.database().collection('user')

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await db_user.doc(event.user_id).update({
    data:{
      balance: cloud.database().command.inc(event.balance)
    }
  })
  return res
}