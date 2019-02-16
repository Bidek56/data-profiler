import React, { useState, useEffect, useRef } from 'react'

let am4core = null
let am4charts = null
let am4themesAnimated = null
if (process.browser) {
  am4core = require('@amcharts/amcharts4/core')
  am4charts = require('@amcharts/amcharts4/charts')
  am4themesAnimated = require('@amcharts/amcharts4/themes/animated')
  am4core.useTheme(am4themesAnimated.default)
}

const createChart = (chart, data) => {
  // var chart = am4core.create('chartdiv', am4charts.XYChart)
  chart.maskBullets = false

  var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
  var yAxis = chart.yAxes.push(new am4charts.CategoryAxis())

  xAxis.dataFields.category = 'column_x'
  yAxis.dataFields.category = 'column_y'

  xAxis.renderer.grid.template.disabled = true
  xAxis.renderer.minGridDistance = 40

  yAxis.renderer.grid.template.disabled = true
  yAxis.renderer.inversed = true
  yAxis.renderer.minGridDistance = 30

  var series = chart.series.push(new am4charts.ColumnSeries())
  series.dataFields.categoryX = 'column_x'
  series.dataFields.categoryY = 'column_y'
  series.dataFields.value = 'correlation'
  series.sequencedInterpolation = true
  series.defaultState.transitionDuration = 3000

  var bgColor = new am4core.InterfaceColorSet().getFor('background')

  var columnTemplate = series.columns.template
  columnTemplate.strokeWidth = 1
  columnTemplate.strokeOpacity = 0.2
  columnTemplate.stroke = bgColor
  columnTemplate.tooltipText = "{value.workingValue.formatNumber('#.##')}"
  columnTemplate.width = am4core.percent(100)
  columnTemplate.height = am4core.percent(100)

  series.heatRules.push({
    target: columnTemplate,
    property: 'fill',
    min: am4core.color(bgColor),
    max: chart.colors.getIndex(0)
  })

  // heat legend
  var heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend)
  heatLegend.width = am4core.percent(100)
  heatLegend.series = series
  heatLegend.valueAxis.renderer.labels.template.fontSize = 9
  heatLegend.valueAxis.renderer.minGridDistance = 30

  // heat legend behavior
  series.columns.template.events.on('over', event => {
    handleHover(event.target)
  })

  series.columns.template.events.on('hit', event => {
    handleHover(event.target)
  })

  function handleHover(column) {
    if (!isNaN(column.dataItem.value)) {
      heatLegend.valueAxis.showTooltipAt(column.dataItem.value)
    } else {
      heatLegend.valueAxis.hideTooltip()
    }
  }

  series.columns.template.events.on('out', event => {
    heatLegend.valueAxis.hideTooltip()
  })

  // console.log('Chart data:', data)

  chart.data = data

  // this.chart = chart
}

export const Correlate = initItem => {
  const [initialized, setInitialized] = useState(false)
  const [item, setItem] = useState(initItem)
  const [prevItem, setPrevItem] = useState(null)
  var chartRef = useRef(null)

  useEffect(() => {
    console.log(initialized ? 'component did update' : 'component did init')
    if (!initialized) {
      chartRef.current = am4core.create('chartdiv', am4charts.XYChart)
      setPrevItem(item)

      createChart(chartRef.current, item.item.correlate)
      // chartRef.data = item.item.correlate
      // console.log('Chart data:', chartRef.data)

      setInitialized(true)
    } else {
      console.log('update')
      if (prevItem !== initItem) {
        setItem(initItem)
        // console.log('updating', chartRef)
        // this.chart.data = this.props.item.correlate
        console.log('Updating with data:', item.item.correlate.length)
        chartRef.current.data = item.item.correlate
      }
    }
    return () => console.log('component will update or unmount')
  }, [initItem])

  return item ? (
    <div>
      <div id="chartdiv" style={{ width: '100%', height: '500px' }} />
    </div>
  ) : (
    <div>Loading...</div>
  )
}
