const axios = require('axios');
const cheerio = require('cheerio')
const fs = require('fs')
const path = require("path")
axios.get('http://www.banzhuren.cn/jiaoxuejiaoan/16663721401070242.html').then((res) => {
    const $ = cheerio.load(res.data)
    const state = false
    let chunkContent = ''
    let title = ''
    const filePath = path.join(__dirname, './poetry')
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath)
    }
    $('#newsnr *').each((index, el) => {
        if (el.name === 'h3') {
            if (title) {
                const writeSteam = fs.createWriteStream(`./poetry/${title}.txt`)
                writeSteam.write(chunkContent)
                title = ''
                chunkContent = ''
            }
            title = el.children[0].data 
        }
        if (index > 2 && el.name === 'p') {
            el.children.forEach((v) => {
                if (v.type === 'text') {
                    chunkContent += v.data
                }
            })
        }
    })
})
