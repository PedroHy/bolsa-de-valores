//contexto do gráfico
var ctx = document.querySelector('.line-chart').getContext('2d')

//criando gráfico
const labels = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
]

const data = {
    labels, 
    datasets: [{
        data: [211, 245, 180, 190, 200],
        label: 'Preço',
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fontColor: 'white'
    }]
}

const config = {
    type: 'line',
    data,
    options: {
        responsive: true,
    }
}

const chart = new Chart(ctx, config)
