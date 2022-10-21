/*
 * @description: 
 * @Author: 赵志伟
 * @Date: 2022-09-23 14:41:55
 */
const path = require('path')
const fs = require('fs')
let sum = 0
function a (filePath, distPath) {
  // 创建可读流
  var readFile = fs.createReadStream(filePath, "utf-8");
  // 创建可写流
  var writeFile = fs.createWriteStream(distPath, 'utf-8');
  //  读取流文件
  readFile.on("data", (chunk) => {
    writeFile.write(chunk)
  })
  // 读取结束，写入文件并处触发完成写入事件
  readFile.on("close", () => {
    writeFile.end();
  })
  //  监听写入文件完成，根据场景可触发回调
  writeFile.on('finish',function (a) {
    console.log('finish', a, sum)
  })
}
a(path.resolve(process.cwd(), "tmp/js/common.js"), path.resolve(process.cwd(), '1.js'))