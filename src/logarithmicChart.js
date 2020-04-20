import regeneratorRuntime from 'regenerator-runtime';
import { NovelCovid } from 'novelcovid';
import {
  ready,
  useTheme,
  create,
  color,
  Scrollbar,
  Rectangle,
  Triangle,
  InterfaceColorSet,
} from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import am4themes_dataviz from '@amcharts/amcharts4/themes/dataviz';
import { balkanCountries, countryCodes } from './constants';

const covidApi = new NovelCovid();
const { BOSNIA, SLOVENIA, CROATIA, SERBIA, GREECE } = balkanCountries;
const { BA, SI, HR, RS, GR } = countryCodes;

function startLogarithmicChart() {
  ready(async function () {
    useTheme(am4themes_dark);
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create('logarithmicChart', am4charts.XYChart);
    chart.dateFormatter.dateFormat = 'yyyy/MM/dd';
    chart.responsive.enabled = true;

    chart.data = await getHistoricalData();
    chart.colors.step = 2;

    let title = chart.titles.create();
    title.text = 'Logarithmic chart - last 30 days data - number of new confirmed cases';
    title.fontSize = 16;
    title.marginBottom = 20;

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 50;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.logarithmic = true;
    valueAxis.renderer.minGridDistance = 20;

    function createSeries(field, name, bullet) {
      let series = chart.series.push(new am4charts.LineSeries());

      series.zIndex = 1;
      series.col;

      series.dataFields.valueY = field;
      series.dataFields.dateX = 'date';
      series.tensionX = 0.8;
      series.strokeWidth = 2;
      series.yAxis = valueAxis;
      series.name = name;
      series.tooltipText = '{name} Cases: [bold]{valueY}[/]';
      series.showOnInit = true;

      if (field === RS) {
        series.stroke = color('#396478');
        series.fill = color('#396478');
        series.invalidate();
        chart.feedLegend();
      }

      if (field === SI || field === BA) {
        series.hidden = true;
      }

      let interfaceColors = new InterfaceColorSet();

      switch (bullet) {
        case 'triangle':
          let triangleBullet = series.bullets.push(new am4charts.Bullet());
          triangleBullet.width = 12;
          triangleBullet.height = 12;
          triangleBullet.horizontalCenter = 'middle';
          triangleBullet.verticalCenter = 'middle';

          let triangle = triangleBullet.createChild(Triangle);
          triangle.stroke = interfaceColors.getFor('background');
          triangle.strokeWidth = 1;
          triangle.direction = 'top';
          triangle.width = 12;
          triangle.height = 12;
          break;
        case 'rectangle':
          let rectangleBullet = series.bullets.push(new am4charts.Bullet());
          rectangleBullet.width = 10;
          rectangleBullet.height = 10;
          rectangleBullet.horizontalCenter = 'middle';
          rectangleBullet.verticalCenter = 'middle';

          let rectangle = rectangleBullet.createChild(Rectangle);
          rectangle.stroke = interfaceColors.getFor('background');
          rectangle.strokeWidth = 1;
          rectangle.width = 10;
          rectangle.height = 10;
          break;
        default:
          let circleBullet = series.bullets.push(new am4charts.CircleBullet());
          circleBullet.circle.stroke = interfaceColors.getFor('background');
          circleBullet.circle.strokeWidth = 1;
          break;
      }

      let range = valueAxis.axisRanges.create();
      range.value = 90.4;
      range.grid.stroke = color('#396478');
      range.grid.strokeWidth = 1;
      range.grid.strokeOpacity = 1;
      range.grid.strokeDasharray = '3,3';
      range.label.inside = true;
    }

    createSeries(RS, SERBIA, 'rectangle');
    createSeries(GR, GREECE, 'triangle');
    createSeries(HR, CROATIA);
    createSeries(SI, SLOVENIA);
    createSeries(BA, 'BIH');

    chart.legend = new am4charts.Legend();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = true;
    chart.cursor.xAxis = dateAxis;
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineX.fill = color('#000');
    chart.cursor.lineX.fillOpacity = 0.1;

    chart.scrollbarX = new Scrollbar();
  });
}

async function getHistoricalData() {
  const countriesHistory = await getCountriesHistoricalData();

  const groups = groupDataByDate(countriesHistory.flat());

  return Object.keys(groups).map((date) => {
    return {
      date,
      RS: findByPropertyName(groups, date, RS).RS,
      GR: findByPropertyName(groups, date, GR).GR,
      HR: findByPropertyName(groups, date, HR).HR,
      SI: findByPropertyName(groups, date, SI).SI,
      BA: findByPropertyName(groups, date, BA).BA,
    };
  });
}

function getCountriesHistoricalData() {
  const serbia = getHistoricalDataForCountry(SERBIA, RS);
  const greece = getHistoricalDataForCountry(GREECE, GR);
  const croatia = getHistoricalDataForCountry(CROATIA, HR);
  const slovenia = getHistoricalDataForCountry(SLOVENIA, SI);
  const bosnia = getHistoricalDataForCountry(BOSNIA, BA);

  return Promise.all([serbia, greece, croatia, slovenia, bosnia]);
}

function groupDataByDate(data) {
  return data.reduce((groups, item) => {
    const date = item.date;

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});
}

function findByPropertyName(groups, date, property) {
  return groups[date].find((el) => el.hasOwnProperty(property));
}

async function getHistoricalDataForCountry(country, fieldName) {
  const historicalCases = await getHistoricalCasesData(country);

  return Object.entries(historicalCases).map((item) => ({
    date: item[0],
    [fieldName]: item[1],
  }));
}

async function getHistoricalCasesData(country) {
  try {
    const historical = await covidApi.historical(null, country);
    return historical.timeline.cases; 
  } catch (error) {
    console.error('An error has occurred', error);
    const element = document.getElementById('logarithmicChart');
    element.parentNode.removeChild(element);
    const div = document.createElement('div');
    div.innerHTML = "Logarithmic chart could now load due to error on fetching data from an API";

    const container = document.getElementsByClassName("logarithmicContainer");
    container[0].appendChild(div);
  }
}

export default startLogarithmicChart;
