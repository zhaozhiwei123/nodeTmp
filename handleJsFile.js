/*
 * @description: 
 * @Author: 赵志伟
 * @Date: 2022-10-25 13:38:59
 */
const path = require("path")
const fs = require("fs");
const UglifyJS = require('uglify-js')
const babel = require("@babel/core");
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
const getMinJs = (formatContent, fileName) => {
  const minJsContent = UglifyJS.minify(formatContent).code;
  console.log('js压缩完成')
  const jsDirPath = path.resolve(dirPath, 'js');
  if(!fs.existsSync(jsDirPath)) fs.mkdirSync(jsDirPath);
  fs.writeFileSync(path.resolve(process.cwd(), `./tmp/js/${fileName}`), minJsContent, UTF8);
  console.log('js写入完成')
};
function handleJsResource () {
  // 所有js资源的集合
  const jsArr = fs.readdirSync(path.resolve(process.cwd(), './template/js'))
  let jsContent = ''
  jsArr.forEach(fileName => {
      const data = fs.readFileSync(path.resolve(process.cwd(), `./template/js/${fileName}`), UTF8);
      debugger
      var {ast} = babel.transformSync(data, {
          ast: true,
          presets: [['@babel/preset-env', {
              "useBuiltIns": "usage",
              "corejs": 3
          }]]
      })
      console.log(ast, 'ast')
      const { code } = babel.transformFromAstSync(ast, data, {
      });
      jsContent += code
  });
  jsContent = `window.onload = function() {${jsContent}}`
  getMinJs(jsContent, 'common.js')
}
createBuildDir('tmp').then(() => {
  handleJsResource()
})