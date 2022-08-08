function getFormatIime(date){
  //获取年份
  var YY = date.getFullYear();
  //获取月份
  var MM = (date.getMonth() + 1 < 10 ? '0'+(date.getMonth() + 1) : date.getMonth() + 1);
  //获取日期
  var DD = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate());
  //获取小时
  var hh = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours());
  //获取分
  var mm = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes());
  ///获取秒
  var ss = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
  //返回时间格式： 2020-11-09 13:14:52
  return YY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss;
}