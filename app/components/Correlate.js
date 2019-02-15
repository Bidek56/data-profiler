import { Component } from 'react'

let am4core = null
let am4charts = null
let am4themesAnimated = null
if (process.browser) {
  am4core = require('@amcharts/amcharts4/core')
  am4charts = require('@amcharts/amcharts4/charts')
  am4themesAnimated = require('@amcharts/amcharts4/themes/animated')
  am4core.useTheme(am4themesAnimated.default)
}

class Correlate extends Component {
  constructor(props) {
    super(props)

    console.log('Chart data:', props.item)
    this.state = { item: props.item }
  }

  componentDidMount() {
    var chart = am4core.create('chartdiv', am4charts.XYChart)
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
    columnTemplate.tooltipText =
      "{weekday}, {hour}: {value.workingValue.formatNumber('#.')}"
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

    console.log('Data:', this.state.item.correlate)

    chart.data = this.state.item.correlate

    this.chart = chart
  }

  componentWillUnmount() {
    if (this.chart) this.chart.dispose()
  }

  render() {
    return (
      <div>
        <div id="chartdiv" style={{ width: '100%', height: '500px' }} />
      </div>
    )
  }
}

export default Correlate
