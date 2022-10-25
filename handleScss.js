/*
 * @description: 
 * @Author: 赵志伟
 * @Date: 2022-10-25 11:53:29
 */
const CleanCSS = require("clean-css");
const sass = require("sass");
const path = require("path")
const fs = require("fs");
const UTF8 = 'utf8';
const dirPath = 'tmp';
// 先删除之前得包
function delDir(dir) {
   if (fs.existsSync(dir)) {
        var result = fs.readdirSync(dir);
        result.forEach((item) => {
            var filePath = `${dir}/${item}`;
            const stats = fs.statSync(filePath)
            if (stats.isFile()) {
                fs.unlinkSync(filePath)
            } else {
                delDir(filePath);
            }
        })
        fs.rmdirSync(dir)
    }
}
delDir(path.resolve(process.cwd(), "tmp"))

// 创建打包目录
function createBuildDir(name) {
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(name)
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}
// 压缩css以及写入css
const getMinCss = (formatContent, fileName) => {
  const minJsContent = new CleanCSS({
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      minifyCSS: true,
      removeComments: true,
      removeEmptyAttributes: true
  }).minify(formatContent).styles;
  console.log('css压缩完成')
  const cssDirPath = path.resolve(dirPath, 'css');
  if(!fs.existsSync(cssDirPath)) fs.mkdirSync(cssDirPath);
  fs.writeFileSync(path.resolve(process.cwd(), `./tmp/css/${fileName}.css`), minJsContent, UTF8);
  console.log('css写入完成')
};
// 获取scss转化过后的css集合
function handleCssResource () {
  // 所有scss资源的集合
  let sassStyleContent = ''
  const scssArr = fs.readdirSync(path.resolve(process.cwd(), './template/style/scss'))
  let count = 0
  scssArr.forEach(async (item) => {
      const fileName = item.split('.')[0];
      const sassFragment = await sass.compileAsync(path.resolve(process.cwd(), `./template/style/scss/${fileName}.scss`))
      sassStyleContent += sassFragment.css
      count++
      // 读取玩所有scss文件执行getMinCss
      if(count === scssArr.length) {
          getMinCss(sassStyleContent, 'style')
      }
  });
}
createBuildDir('tmp').then(() => {
  handleCssResource()
})