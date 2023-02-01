//Coverte o timestamp para a data normal
function convertDate(timestampCode){
    var date = new Date(timestampCode *1000); 
    return date.toLocaleDateString("pt-BR"); 
}

//pega o stock de cada empresa listada na bolsa
async function getStocksList(){
    const res = await fetch("https://brapi.dev/api/quote/list")
    const json = await res.json()
    
    const enterprises = []

    json.stocks.forEach(entry =>{
        let enterprise = {}
        enterprise.logo = entry.logo
        enterprise.stock = entry.stock

        enterprises.push(enterprise)
    })
    
    return enterprises
}

//pega os dados detalhados da empresa pelo stock
async function getStockInfo(stockCode = String()) {
    const res = await fetch(`https://brapi.dev/api/quote/${stockCode}`)
    const json = await res.json()
    return json.results[0]
}

//pegar dados 
async function getDataList(){
    const enterprises = await getStocksList()

    const enterprisesList = []

    enterprises.forEach(async enterprise =>{
        const stockInfo = await getStockInfo(enterprise.stock)
        
        let object = {
            logo: enterprise.logo,
            stock: enterprise.stock,
            name: stockInfo.shortName,
            current: stockInfo.regularMarketPrice,
            percent: stockInfo.regularMarketChangePercent
        }

        enterprisesList.push(object)
    })

    return enterprisesList
}

async function orderList(){
    const list = await getDataList()
    setTimeout(()=>{
        list.sort(function(a, b){
            return a.percent - b.percent
        })
        
        getListLows(list)
        getListHighs(list)

        
    }, 2000)
}

function getListLows(list){
    const lows = []

    for(let i = 0; i < 20; i++){
        lows.push(list[i])
    }
    setList(lows, 'list-low')
    
    // return lows
}

function getListHighs(list) {
    const highs = []

    for (let i = list.length-1; i >= list.length - 20; i--) {
        highs.push(list[i])
    }
    
    setList(highs, 'list-high')
   
    
    // return highs
}


//      ###INTERFACE###

function setList(list, barId){
    console.log(list)
    const bar = document.querySelector(`#${barId}`)
    const template = bar.querySelector("template")

    list.forEach(entry =>{
        const newContent = template.content.cloneNode(true)
        const spans = newContent.querySelectorAll("span")

        spans[0].innerHTML = entry.stock
        spans[1].innerHTML = `R$ ${entry.current}`
        spans[2].innerHTML = `${entry.percent.toFixed(2)}%`

        spans[2].className = entry.percent > 0 ? "high-price" : "low-price"

        bar.appendChild(newContent)
    })
}

orderList()

/*
async function americanasTeste(){
    const amerData = await fetch("https://brapi.dev/api/quote/AMER3").then(data => data.json())
    // console.log(amerData.results[0].regularMarketOpen)
    const open = amerData.results[0].regularMarketOpen
    const current = amerData.results[0].regularMarketPrice
    const porcent = amerData.results[0].regularMarketChangePercent.toFixed(2)

    const list = document.querySelector("#list-high")
    const template = list.querySelector("template")
    const newContent = template.content.cloneNode(true)
    const spans = newContent.querySelectorAll("span")

    // console.log(amerData.results[0].symbol)
    spans[0].innerHTML = amerData.results[0].symbol
    spans[1].innerHTML = `R$ ${current}`
    spans[2].innerHTML = `${porcent}%`

    spans[2].className = porcent > 0? "high-price" : "low-price"
    list.appendChild(newContent)
    // console.log(spans)
}
americanasTeste()

*/
