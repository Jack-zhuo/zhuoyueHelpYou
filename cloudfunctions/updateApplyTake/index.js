// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_apply_take = cloud.database().collection('apply_take')
// 云函数入口函数
exports.main = async (event, context) => {
  const res = await db_apply_take.where({
    _openid: event.openid
  }).update({
    data: {
      isPass: true
    }
  });
  return res
}