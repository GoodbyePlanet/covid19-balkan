/* Imports */
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { NovelCovid } from 'novelcovid';
import { balkanCountries } from './constants';

const covidApi = new NovelCovid();

function startColumnChart() {
  am4core.ready(async function () {
    am4core.useTheme(am4themes_dark);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create('columnChart', am4charts.XYChart3D);
    chart.colors.list = [am4core.color('#8C2B2C'), am4core.color('#28314E')];
    chart.data = renameCountryNames(await getData()).reverse();

    chart.paddingTop = 40;

    let title = chart.titles.create();
    title.text = 'Recovered and deaths comparison';
    title.fontSize = 16;
    title.marginBottom = 30;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'country';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fontSize = 10;

    chart.yAxes.push(new am4charts.ValueAxis());

    function createSeries(field) {
      let series = chart.series.push(new am4charts.ColumnSeries3D());
      series.dataFields.valueY = field;
      series.dataFields.categoryX = 'country';
      series.name = field;
      series.clustered = false;
      series.columns.template.tooltipText =
        '{country} {name}: [bold]{valueY}[/]';
      series.columns.template.fillOpacity = 0.6;
      series.tooltip.pointerOrientation = 'vertical';
    }

    createSeries('deaths');
    createSeries('recovered');
  });
}

async function getData() {
  const countriesCovid = [];
  try {
    for (const c of await getCountryData()) {
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

async function getCountryData() {
  try {
    return covidApi.countries(Object.values(balkanCountries).join(','));
  } catch (error) {
    console.error('An error has occurred', error);
    const element = document.getElementById('radarChart');
    element.parentNode.removeChild(element);
    const div = document.createElement('div');
    div.innerHTML =
      'Radar chart could now load due to error on fetching data from an API';

    const container = document.getElementsByClassName('radarContainer');
    container[0].appendChild(div);
  }
}

function renameCountryNames(covidData) {
  return covidData.map((item) => {
    if (item.country === 'Macedonia') {
      item.country = 'N. Macedonia';
    }
    if (item.country === 'Bosnia') {
      item.country = 'BiH';
    }
    return item;
  });
}

export default startColumnChart;
