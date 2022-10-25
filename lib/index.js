var fs = require("fs");
const { minify } = require("html-minifier");
const path = require("path");
const CleanCSS = require("clean-css");
const sass = require("sass");
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
// 压缩html以及写入html
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
};

const getMinJs = (formatContent, fileName) => {
    const minJsContent = UglifyJS.minify(formatContent).code;
    console.log('js压缩完成')
    const jsDirPath = path.resolve(dirPath, 'js');
    if(!fs.existsSync(jsDirPath)) fs.mkdirSync(jsDirPath);
    fs.writeFileSync(path.resolve(process.cwd(), `./tmp/js/${fileName}`), minJsContent, UTF8);
    console.log('js写入完成')
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
    getMinJs(jsContent, 'common.js')
}

createBuildDir("tmp").then(() => {
    // copy原来得目录
    console.log('创建文件完后')
    fs.access('template', (err) => {
        if (err) {
            console.log('访问模板文件夹报错')
            throw err
        }
        handleHtmlResource()
        handleCssResource()
        handleJsResource()
    })
})