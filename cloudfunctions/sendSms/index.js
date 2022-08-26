// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
 try {
   const res = await cloud.openapi.cloudbase.sendSms({
      env:'zhuoyuebang-1gx979jw039db365',
      content: event.content,
      path:'/index.html',
      phoneNumberList:[
        "+86" + event.phone
      ]
   })
   return res
 } catch (error) {
   return error
 }
}