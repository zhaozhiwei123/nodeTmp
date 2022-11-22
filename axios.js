const axios = require('axios');
const cheerio = require('cheerio')
const fs = require('fs')
axios.get('http://www.meituhe.com/html/5352298/').then((res) => {
    const $ = cheerio.load(res.data)
    let list = []
    $('.list-charts').eq(1).find('li').each((idx, el) => {
    // console.log(idx, $(el).find('a').attr('href'))
        list.push('http://www.meituhe.com/' + $(el).find('a').attr('href'))
    })
    list = list.slice(0, 10)
    list.forEach((v, k) => {
        loadText(v, k)
    })
})
function loadText(url, k) {
    axios.get(url).then((res) => {
        const $ = cheerio.load(res.data)
        const title = $('.breadcrumb .active').text().split(' ')[1]
        const writeSteam = fs.createWriteStream(`./book/第${k + 1}章 ${title}.txt`)
        $('.content-ext p').each((index, el) => {
            writeSteam.write(el.children[0].data + '\n')
        })
    })
}
// axios.get('http://baodu.com').then((res) => {
//     console.log(res)
// })