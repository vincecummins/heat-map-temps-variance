const getData = (data, target, dataLen) => {
    const arr = [];
    for (let i = 0; i < dataLen; i++) {
        arr.push(data[i][target])
    }
    return arr
}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(res => res.json())
    .then(d => {
        const baseTemp = d.baseTemperature
        const monthlyVar = d.monthlyVariance
        const years = getData(monthlyVar, "year", monthlyVar.length)
        makeGraph(d.monthlyVariance, baseTemp, years)
    })

const makeGraph = (data, baseTemp, years) => {
    const w = 800;
    const h = 350;
    const marg = 40
    const margBottom = 100
    const colors = ['#4675B4', '#74ADD1', '#ABD9E9', '#E0F3F8', '#FEFBBF', '#FCE090', '#F4AD60', '#EC6C42', '#D8392F'];
    const tempRange = [2.8, 3.9, 5, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7]
    const minYear = d3.min(years)
    const maxYear = d3.max(years)

    const formatMonth = (num) => {
        let months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        return months[num - 1];
    }

    const xScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, w + marg])

    const yScale = d3.scaleLinear()
        .domain([12.5, 0.5])
        .range([h, 0])

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
    const yAxis = d3.axisLeft(yScale)
        .tickFormat((d) => formatMonth(d).substr(0, 3))


    const tooltip = d3.select('#d3-container')
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)

    const svg = d3.select('#d3-container')
        .append('svg')
        .attr('width', w + marg * 2)
        .attr('height', h + marg + margBottom)

    const legend = svg.append('g')
        .classed('legend', true)
        .attr('id', 'legend')

    const legendX = 350;
    const legendY = h + 100;
    const legXscale = d3.scaleLinear()
        .domain([12.8, tempRange[0]])
        .range([legendX, legendX - 180]);

    const legXAxis = d3.axisBottom(legXscale)
        .tickValues([...tempRange, 12.8])
        .tickFormat(d3.format('.1f'))
        .tickSize(5)

    const legTooltip = legend
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)

    const count = [0, 0, 0, 0, 0, 0, 0, 0, 0]

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('width', 10)
        .attr('height', h / 12)
        .attr('x', (d, i) => marg + xScale(d.year))
        .attr('y', (d) => marg + (d.month - 1) * h / 12)
        .attr('fill', (d) => {
            let val = d.variance + 8.66
            for (let i = colors.length - 1; i >= 0; i--) {
                if (val >= tempRange[i]) {
                    count[i] +=1;
                    return colors[i]
                }
            }
            count[0] +=1
            return colors[0]
        })
        .on("mouseover", (e, i) => {
            console.log()
            tooltip.transition()
                .duration(300)
                .style('opacity', 0.9)
            tooltip.html("<div>" + i.year + " - " + formatMonth(i.month) + "</div><div>" + (i.variance + baseTemp).toFixed(2) + "℃</div><div>" + i.variance.toFixed(2) + "℃</div>")
                .style("left", (e.pageX + 20) + "px")
                .style("top", (e.pageY - 20) + "px")
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        })

    svg.append('g')
        .call(xAxis)
        .attr("transform", "translate(" + marg + ',' + (h + marg) + ")")

    svg.append('g')
        .call(yAxis)
        .attr("transform", "translate(" + marg + "," + marg + ")")

    legend.append('g')
        .selectAll('rect')
        .data(colors)
        .enter()
        .append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', (d, i) => 150 + i * 20)
        .attr('y', h + 60)
        .attr('fill', (d) => d)
        .on("mouseover", (e, i) => {
            console.log(count.reduce((a, b) => a + b,0), data.length)
            tooltip.transition()
                .duration(300)
                .style('opacity', 0.9)
            tooltip.html("<div>" + "frequency" + " - " + ((count[colors.indexOf(i)]/count.reduce((a, b) => a + b,0)) * 100).toFixed(2) + "%</div>")
                .style("left", (e.pageX + 0) + "px")
                .style("top", (e.pageY - 40) + "px")
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        })

    legend.append('g')
        .call(legXAxis)
        .attr('transform', 'translate(' + (-20.5) + ',' + (h + 80) + ')')
        .style('font-size', 8)

    legend
        .attr('transform', 'translate(' + (-40) + ',' + 20 + ')')
        
}
