import React, { useState, useEffect } from 'react'

let am4core = null
let am4charts = null
let am4themesAnimated = null
if (process.browser) {
  am4core = require('@amcharts/amcharts4/core')
  am4charts = require('@amcharts/amcharts4/charts')
  am4themesAnimated = require('@amcharts/amcharts4/themes/animated')
  am4core.useTheme(am4themesAnimated.default)
}

const createChart = data => {
  let chart1 = am4core.create('chartdiv1', am4charts.XYChart)

  chart1.data = data

  let catAxis1 = chart1.xAxes.push(new am4charts.CategoryAxis())
  catAxis1.renderer.grid.template.location = 0
  catAxis1.dataFields.category = 'att2'
  catAxis1.title.text = 'Attribute'

  let valueAxis1 = chart1.yAxes.push(new am4charts.ValueAxis())
  valueAxis1.tooltip.disabled = true
  valueAxis1.renderer.minWidth = 35
  valueAxis1.title.text = 'Value'

  let columnSeries = chart1.series.push(new am4charts.ColumnSeries())
  columnSeries.name = 'Values'
  columnSeries.dataFields.valueY = 'val'
  columnSeries.dataFields.categoryX = 'att2'
  columnSeries.columns.template.fill = am4core.color('#4286f4') // fill
  columnSeries.tooltipText = '{valueY.value}'
  chart1.cursor = new am4charts.XYCursor()

  let scrollbarX1 = new am4charts.XYChartScrollbar()
  scrollbarX1.series.push(columnSeries)
  chart1.scrollbarX = scrollbarX1

  let chart = am4core.create('chartdiv', am4charts.XYChart)

  // ... chart code goes here ...

  chart.paddingRight = 20

  data = []
  let visits = 10
  for (let i = 1; i < 366; i++) {
    visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10)
    data.push({ date: new Date(2018, 0, i), name: 'name' + i, value: visits })
  }

  // console.log('Data:', data)

  chart.data = data

  let dateAxis = chart.xAxes.push(new am4charts.DateAxis())
  dateAxis.renderer.grid.template.location = 0

  let valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
  valueAxis.tooltip.disabled = true
  valueAxis.renderer.minWidth = 35

  let series = chart.series.push(new am4charts.LineSeries())
  series.dataFields.dateX = 'date'
  series.dataFields.valueY = 'value'

  series.tooltipText = '{valueY.value}'
  chart.cursor = new am4charts.XYCursor()

  let scrollbarX = new am4charts.XYChartScrollbar()
  scrollbarX.series.push(series)
  chart.scrollbarX = scrollbarX
}

const Profile = initItem => {
  const [initialized, setInitialized] = useState(false)
  const [item, setItem] = useState(initItem)

  useEffect(() => {
    console.log(initialized ? 'component did update' : 'component did init')
    if (!initialized) {
      createChart(item.item.profile)
      setInitialized(true)
    }
  }, [initItem])

  return item ? (
    <div>
      <div id="chartdiv1" style={{ width: '100%', height: '500px' }} />
      <div id="chartdiv" style={{ width: '100%', height: '500px' }} />
    </div>
  ) : (
    <div>Loading...</div>
  )
}

export default Profile
