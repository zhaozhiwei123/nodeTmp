/*
 * @description: 
 * @Author: 赵志伟
 * @Date: 2022-10-25 11:36:50
 */
const { minify } = require("html-minifier"); // 用来压缩html第三方库
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
const getMinHtml = (formatContent, fileName) => {
    const minHtmlContent = minify(formatContent, {
        removeComments: true,
        collapseWhitespace: true
    });
    console.log(`${fileName}压缩完成`)
    const htmlDirPath = path.resolve(dirPath, 'html');
    if(!fs.existsSync(htmlDirPath)) fs.mkdirSync(htmlDirPath);
    fs.writeFileSync(path.resolve(process.cwd(), `./tmp/html/${fileName}`), minHtmlContent, UTF8);
    console.log(`${fileName}写入完成`)
}
function handleHtmlResource () {
    // 获取html文件夹下所有文件名称的数组集合
    let htmlArr = []
    try {
        htmlArr = fs.readdirSync(path.resolve(process.cwd(), './template/html'))
    } catch (err) {
        htmlArr = []
    }
     
    // 通过遍历读取其中每html个文件，只保留body标签之中的内容，在进行压缩处理
    htmlArr.forEach((item) => {
        const htmlPath = path.resolve('./template/html', item)
        fs.access(htmlPath, (err) => {
            if (err) throw err
            const newFileContent = fs.readFileSync(path.resolve(process.cwd(), `./template/html/${item}`), UTF8);
            const reg = /<body>([\s\S]+?)<\/body>/;
            const dataContent = newFileContent.match(reg)[0].replace('<body>', '').replace('</body>', '')
            getMinHtml(dataContent, item)
        })
    });
}
createBuildDir('tmp').then(() => {
  handleHtmlResource()
})

