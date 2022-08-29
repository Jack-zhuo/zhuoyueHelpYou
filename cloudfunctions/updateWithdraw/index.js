// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_withdraw = cloud.database().collection('withdraw')

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await db_withdraw.doc(event._id).update({
    data:{
      isWithdraw:true
    }
  })
  return res
}