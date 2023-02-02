
async function main(){
    console.log("Começei a trabalhar")

    const list = await getDataList()
    const list2 = await getDataList()

    orderList(list, 'percent')
    setTimeout(()=>{
        const highs = getListHighs(list)
        const lows = getListLows(list)

        setList(highs, 'list-high')
        setList(lows, 'list-low')  
    }, 4000)   
    
    orderList(list2, 'volume')
    setTimeout(()=>{
        const top = getListLows(list2)
        setList(top, 'list-top')
        addListener()
        
        document.querySelector("#loading").style.display = "none"
        createObj('AMER3')

        const search = document.querySelector("#stock-list")
        getStocksList().then(data =>{
            data.forEach(entry =>{
                const newOption = document.createElement("option")
                newOption.innerHTML = entry.stock
                newOption.value = entry.stock

                search.appendChild(newOption)
            })
        })
    }, 4000)
}

async function getDataList(){
    const enterprises = await getStocksList()

    const enterprisesList = []

    enterprises.forEach(async enterprise =>{
        const stockInfo = await getStockInfo(enterprise.stock)
        if(stockInfo != undefined){
            let object = {
                logo: enterprise.logo,
                stock: enterprise.stock,
                name: stockInfo.shortName,
                current: stockInfo.regularMarketPrice.toFixed(2),
                percent: stockInfo.regularMarketChangePercent
            }
    
            enterprisesList.push(object)
        }
        
    })

    return enterprisesList
}

function orderList(list, attr){

    setTimeout(() => {

        switch(attr){
            case 'percent':
                list.sort(function (a, b) {
                    return a.percent - b.percent
                })
            break;

            case 'volume':
                list.sort(function (a, b) {
                    return a.volume - b.volume
                })
            break;
        } 
    }, 3000)
}

function getListHighs(list) {
    const highs = []

    for (let i = list.length-1; i >= list.length - 17; i--) {
        highs.push(list[i])
    }
    
    return highs
}


function getListLows(list){
    const lows = []

    for(let i = 0; i < 17; i++){
        lows.push(list[i])
    }
    
    return lows
}

main()

//      ##API## 
async function getStocksList(){
    const res = await fetch("https://brapi.dev/api/quote/list")
    const json = await res.json()
    
    const enterprises = []

    json.stocks.forEach(entry =>{
        let enterprise = {}
        enterprise.logo = entry.logo
        enterprise.stock = entry.stock
        enterprise.volume = entry.volume

        if (entry.stock.slice(-1) != "F"){
            enterprises.push(enterprise)
        }
    })
    
    return enterprises
}

async function getStockInfo(stockCode = String()) {
    const res = await fetch(`https://brapi.dev/api/quote/${stockCode}`)
    if(res.ok){
        const json = await res.json()
        return json.results[0]
    }
    
}

async function getStockDetails(stockCode = String()) {
    const res = await fetch(`https://brapi.dev/api/quote/${stockCode}?range=5d&interval=1d`)
    if (res.ok) {
        const json = await res.json()
        return json.results[0]
    }

}

//     #GRAFICO

function convertDate(timestampCode){
    var date = new Date(timestampCode *1000); 
    return date.toLocaleDateString("pt-BR"); 
}


//      ###INTERFACE###

function setList(list, barId){
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

function addListener(){
    let empresas = document.querySelectorAll('li[class="bar-card"]')
    empresas.forEach(empresa =>{
        empresa.addEventListener('click', (event)=>{
            let stock = event.target.querySelector('span').innerHTML
            createObj(stock)
        })
    })
}

function createObj(stock){
    getStockDetails(stock).then((enterprise) => {
        let obj = {
            stock: stock,
            current: enterprise.regularMarketPrice,
            percent: enterprise.regularMarketChangePercent,
            open: enterprise.regularMarketOpen,
            max: enterprise.regularMarketDayHigh,
            min: enterprise.regularMarketDayLow,
            historical: enterprise.historicalDataPrice
        }

        setInfo(obj)
    })
}


function setInfo(obj){
    const header = document.querySelector(".data-header")
    const enterpriseName = header.querySelector("h1")
    const percent = header.querySelectorAll('span')[0]
    const currentPrice = header.querySelectorAll('span')[1]

    const content = document.querySelector(".data-content")
    const spans = content.querySelectorAll("div span:last-child")
    // [Fechamento anterior, Abertura do dia, Máxima de hoje, Mínima de hoje]

    enterpriseName.innerHTML = obj.stock
    percent.innerHTML = obj.percent.toFixed(2) + "%"
    currentPrice.innerHTML = "R$" + obj.current.toFixed(2)

    percent.className = obj.percent > 0 ? "high-price" : "low-price"

    spans[0].innerHTML = "R$" + (obj.historical.length > 1 ? obj.historical[obj.historical.length-2].close.toFixed(2) : "00.00")
    spans[1].innerHTML = "R$" + obj.open.toFixed(2)
    spans[2].innerHTML = "R$" + obj.max.toFixed(2)
    spans[3].innerHTML = "R$" + obj.min.toFixed(2)
    

}