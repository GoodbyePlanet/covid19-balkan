/* Imports */
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_dataviz from '@amcharts/amcharts4/themes/dataviz';

function startColumnChart() {
  am4core.ready(async function () {
    am4core.useTheme(am4themes_dark);
    am4core.useTheme(am4themes_dataviz);
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create('columnChart', am4charts.XYChart3D);

    chart.data = [
      {
        country: 'Serbia',
        recovered: 534,
        deaths: 110,
      },
      {
        country: 'Greece',
        recovered: 269,
        deaths: 108,
      },
      {
        country: 'Croatia',
        recovered: 600,
        deaths: 36,
      },
      {
        country: 'Slovenia',
        recovered: 174,
        deaths: 66,
      },
      {
        country: 'BiH',
        recovered: 320,
        deaths: 46,
      },
      {
        country: 'North Macedonia',
        recovered: 139,
        deaths: 49,
      },
      {
        country: 'Bulgaria',
        recovered: 153,
        deaths: 41,
      },
      {
        country: 'Albania',
        recovered: 283,
        deaths: 26,
      },
      {
        country: 'Montenegro',
        recovered: 55,
        deaths: 5,
      },
    ];

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'country';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = 'GDP growth rate';
    valueAxis.renderer.labels.template.adapter.add('text', function (text) {
      return text;
    });

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = 'deaths';
    series.dataFields.categoryX = 'country';
    series.name = 'Deaths';
    series.clustered = false;
    series.columns.template.tooltipText = 'Deaths: [bold]{valueY}[/]';
    series.columns.template.fillOpacity = 0.9;

    var series2 = chart.series.push(new am4charts.ColumnSeries3D());
    series2.dataFields.valueY = 'recovered';
    series2.dataFields.categoryX = 'country';
    series2.name = 'Recovered';
    series2.clustered = false;
    series2.columns.template.tooltipText = 'Recovered: [bold]{valueY}[/]';
  });
}

export default startColumnChart;
