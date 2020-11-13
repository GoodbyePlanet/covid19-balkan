import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import { getCovidDataWithNamesRenamed } from './utils';

am4core.options.queue = true;
am4core.options.onlyShowOnViewport = true;

function startColumnChart(covidData) {
  am4core.ready(function () {
    am4core.useTheme(am4themes_dark);
    am4core.options.autoSetClassName = true;

    let chart = am4core.create('columnChart', am4charts.XYChart3D);
    chart.colors.list = [am4core.color('#28314E')];
    chart.preloader.fill = '#FFFFFF';
    chart.preloader.opacity = 0.6;
    chart.preloader.visible = true;

    chart.data = getCovidDataWithNamesRenamed(
      getData(covidData),
      'N. Macedonia',
      'BIH',
    ).reverse();

    chart.paddingTop = 40;

    let title = chart.titles.create();
    title.text = 'Recovered and deaths comparison';
    title.fontSize = 16;
    title.marginBottom = 30;
    title.fill = am4core.color('#ef6666');
    title.fontWeight = 600;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'country';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fontSize = 10;

    chart.yAxes.push(new am4charts.ValueAxis());

    function createSeries(field) {
      let series = chart.series.push(new am4charts.ColumnSeries3D());
      series.dataFields.categoryX = 'country';
      series.dataFields.valueY = field;
      series.dataFields.valueX = 'deaths';
      series.name = field;
      series.clustered = false;
      series.columns.template.tooltipText =
        '[bold]{country}[/] {name}: [bold]{valueY}[/] deaths: [bold]{valueX}[/]';
      series.columns.template.fillOpacity = 0.6;
      series.tooltip.pointerOrientation = 'vertical';
    }

    createSeries('recovered');
  });
}

function getData(covidData) {
  const countriesCovid = [];
  try {
    for (const c of covidData) {
      const { country, deaths, recovered } = c;
      countriesCovid.push({
        country,
        deaths,
        recovered,
      });
    }

    return countriesCovid;
  } catch (error) {
    console.error('Error has occured ', error);
  }
}

export default startColumnChart;
