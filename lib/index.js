var fs = require("fs");
const { minify } = require("html-minifier");
var path = require("path");
var CleanCSS = require("clean-css");
var cssMinify = new CleanCSS();
var UglifyJS = require('uglify-js')
var babel = require("@babel/core");
require("@babel/polyfill");
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
// copy目录
function copyDir(dir, dist, cb) {
    fs.access(dir, (err) => {
        if (err) {
            throw err;
        };
        var count = 0;
        var file = fs.readdirSync(dir);
        if(!file.length){
            cb()
        }

        var handleCb = function () {
            count++;
            count == file.length && cb && cb()
        }

        file.forEach((v, i) => {
            var filePath = path.resolve(dir,v)
            var distPath = path.resolve(dist,v)
            var stat = fs.statSync(filePath, true);
            if (stat.isFile()) {
                var readFile = fs.createReadStream(filePath, "utf-8");
                var chunkContent = '';
                var writeFile = fs.createWriteStream(distPath);
                readFile.on("data", (chunk) => {
                    chunkContent += chunk;
                })
                readFile.on("close", () => {
                    console.log('读写文件完成')
                    writeFile.write(chunkContent)
                    writeFile.end();
                })
                writeFile.on('finish',function () {
                    console.log('写入文件完成')
                    cb && cb()
                })

            } else {
                fs.mkdirSync(distPath);
                copyDir(filePath, distPath, handleCb)
            }
        })
    })
}

// 处理
function handleTmp(dir) {
    fs.access(dir, (err) => {
        if (err) throw err;
        var file = fs.readdirSync(dir);
        file.forEach((v) => {
            // var filePath = `${dir}/${v}`;
            var filePath = path.resolve(dir, v)
            var stat = fs.statSync(filePath)
            if (stat.isFile()) {
                var extName = path.extname(filePath);
                try{
                    if (/.html/.test(extName)) {
                        handleHtml(filePath)
                    }
                }catch(e){
                    console.log('处理html报错', e)
                }
                try{
                    if (/.css/.test(extName)) {
                        handleCss(filePath)
                    }
                }catch(e){

                }
                try{
                    if (/.js/.test(extName)) {
                        handleJs(filePath)
                    }
                }catch(e){
                    console.log('处理js报错', e)
                }
                
            } else {
                handleTmp(filePath)
            }
        })
    })
}
function handleHtml(dir) {
    fs.access(dir, (err) => {
        if (err) throw err;
        var file = fs.readFile(dir, 'utf-8', (err, data) => {
            if (err) throw err;
            var content = minify(data, {
                collapseWhitespace: true,
                collapseInlineTagWhitespace: true,
                minifyCSS: true,
                removeComments: true,
                removeEmptyAttributes: true
            });
            var reg = /<body>.*<\/body>/g;
            // var content = data.replace(reg,'$1')
            var dataContent = content.match(reg)[0].replace("<body>", '').replace("</body>", '')
            fs.writeFile(dir, dataContent, () => {
            })


        })
    })
}
function handleCss(dir) {
    fs.access(dir, (err) => {
        if (err) throw err;
        var file = fs.readFile(dir, 'utf-8', (err, data) => {
            if (err) throw err;
            var output = new CleanCSS({}).minify(data).styles;
            fs.writeFileSync(dir, output)
        })
    })
}
function handleJs(dir) {
    fs.access(dir, (err) => {
        if (err) throw err;
        var file = fs.readFile(dir, 'utf-8', (err, data) => {
            if (err) throw err;
            var {ast} = babel.transformSync(data, {
                ast: true,
                presets: ['@babel/preset-env']
            })
            
            const { code } = babel.transformFromAstSync(ast, data, {
            });
            const result = UglifyJS.minify(code).code;
            fs.writeFileSync(dir,result,'utf-8')
             
            // console.log(output,111)
        })
    })
}
createBuildDir("tmp").then(() => {
    // copy原来得目录
    copyDir(path.resolve(process.cwd(), "template"), path.resolve(process.cwd(), "tmp"), () => {
        handleTmp(path.resolve(process.cwd(), "tmp"))
        // console.log(fs.existsSync(path.resolve(process.cwd(),"tmp")),89)
    });
})