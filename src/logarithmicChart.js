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
  options,
} from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_moonrisekingdom from '@amcharts/amcharts4/themes/moonrisekingdom';
import { balkanCountries, countryCodes } from './constants';

const {
  BULGARIA,
  CROATIA,
  SERBIA,
  GREECE,
  SLOVENIA,
  ALBANIA,
  MONTENEGRO,
} = balkanCountries;
const { BA, BG, HR, RS, GR, ME, MK, SI, AL } = countryCodes;

options.queue = true;
options.onlyShowOnViewport = true;

function startLogarithmicChart(dataType, covidData) {
  ready(async function () {
    const firstFive = getFirstFiveCountries(dataType, covidData);
    const [
      { countryCode: firstCountryCode, name: firstName },
      { countryCode: secondCountryCode, name: secondName },
      { countryCode: thirdCountryCode, name: thirdName },
      { countryCode: fourthCountryCode, name: fourthName },
      { countryCode: fifthCountryCode, name: fifthName },
    ] = firstFive;

    useTheme(am4themes_moonrisekingdom);

    const chartType = 'logarithmicChart' + dataType;

    let chart = create(chartType, am4charts.XYChart);
    chart.dateFormatter.dateFormat = 'yyyy/MM/dd';
    chart.responsive.enabled = true;

    if (dataType === 'cases') {
      chart.numberFormatter.numberFormat = '#a';
    }

    chart.data = await getHistoricalData(dataType, firstFive);
    chart.colors.step = 2;

    chart.preloader.fill = '#FFFFFF';
    chart.preloader.opacity = 0.6;
    chart.preloader.visible = true;

    let title = chart.titles.create();
    title.text = `Logarithmic chart - last 30 days data - confirmed ${dataType} per day`;
    title.fontSize = 16;
    title.marginBottom = 20;
    title.fill = color('#ef6666');
    title.fontWeight = 600;

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
      series.tooltipText = `{name} ${dataType}: [bold]{valueY}[/]`;
      series.showOnInit = true;

      if (field === fifthCountryCode) {
        series.stroke = color('#396478');
        series.fill = color('#396478');
        series.invalidate();
        chart.feedLegend();
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
      range.grid.strokeDasharray = '3,3';
      range.label.inside = true;
    }

    createSeries(firstCountryCode, switchName(firstName), 'rectangle');
    createSeries(secondCountryCode, switchName(secondName), 'triangle');
    createSeries(thirdCountryCode, switchName(thirdName), 'circle');
    createSeries(fourthCountryCode, switchName(fourthName), 'circle');
    createSeries(fifthCountryCode, switchName(fifthName), 'circle');

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

async function getHistoricalData(dataType, firstFive) {
  const countriesHistory = await getCountriesHistoricalData(
    dataType,
    firstFive,
  );
  const groups = groupDataByDate(countriesHistory.flat());

  const [
    { countryCode: firstCountryCode },
    { countryCode: secondCountryCode },
    { countryCode: thirdCountryCode },
    { countryCode: fourthCountryCode },
    { countryCode: fifthCountryCode },
  ] = firstFive;

  return Object.keys(groups).map((date) => {
    return {
      date: new Date(date),
      [firstCountryCode]: findByPropertyName(groups, date, firstCountryCode)[
        firstCountryCode
      ],
      [secondCountryCode]: findByPropertyName(groups, date, secondCountryCode)[
        secondCountryCode
      ],
      [thirdCountryCode]: findByPropertyName(groups, date, thirdCountryCode)[
        thirdCountryCode
      ],
      [fourthCountryCode]: findByPropertyName(groups, date, fourthCountryCode)[
        fourthCountryCode
      ],
      [fifthCountryCode]: findByPropertyName(groups, date, fifthCountryCode)[
        fifthCountryCode
      ],
    };
  });
}

function getCountriesHistoricalData(dataType, firstFive) {
  const [
    { countryCode: firstCountryCode, name: firstName },
    { countryCode: secondCountryCode, name: secondName },
    { countryCode: thirdCountryCode, name: thirdName },
    { countryCode: fourthCountryCode, name: fourthName },
    { countryCode: fifthCountryCode, name: fifthName },
  ] = firstFive;

  const first = getHistoricalDataForCountry(
    dataType,
    firstName,
    firstCountryCode,
  );
  const second = getHistoricalDataForCountry(
    dataType,
    secondName,
    secondCountryCode,
  );
  const third = getHistoricalDataForCountry(
    dataType,
    thirdName,
    thirdCountryCode,
  );
  const fourth = getHistoricalDataForCountry(
    dataType,
    fourthName,
    fourthCountryCode,
  );
  const fifth = getHistoricalDataForCountry(
    dataType,
    fifthName,
    fifthCountryCode,
  );

  return Promise.all([first, second, third, fourth, fifth]);
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

async function getHistoricalDataForCountry(dataType, country, fieldName) {
  const historicalCases = await getHistoryTimelineData(dataType, country);

  return Object.entries(historicalCases).map((item) => ({
    date: item[0],
    [fieldName]: item[1],
  }));
}

async function getHistoryTimelineData(dataType, country) {
  try {
    const covidApi = new NovelCovid();
    const historical = await covidApi.historical(null, country);

    if (dataType === 'deaths') {
      return historical.timeline.deaths;
    }

    return historical.timeline.cases;
  } catch (error) {
    console.error('An error has occurred', error);
    const element = document.getElementById('logarithmicChart');
    element.parentNode.removeChild(element);
    const div = document.createElement('div');
    div.innerHTML =
      'Logarithmic chart could now load due to error on fetching data from an API';

    const container = document.getElementsByClassName('logarithmicContainer');
    container[0].appendChild(div);
  }
}

function getFirstFiveCountries(dataType, covidData) {
  return getSortedDataByProperty(covidData, dataType).slice(-5);
}

function getSortedDataByProperty(countriesData, property) {
  return countriesData
    .map((item) => ({
      countryCode: getCountryCode(item.country),
      name: item.country,
      [property]: item[property],
    }))
    .sort((countryA, countryB) => countryA[property] - countryB[property]);
}

function getCountryCode(countryName) {
  switch (countryName) {
    case SERBIA:
      return RS;
    case GREECE:
      return GR;
    case CROATIA:
      return HR;
    case SLOVENIA:
      return SI;
    case 'Bosnia':
      return BA;
    case BULGARIA:
      return BG;
    case 'Macedonia':
      return MK;
    case ALBANIA:
      return AL;
    case MONTENEGRO:
      return ME;
  }
}

function switchName(countryName) {
  return countryName === 'Macedonia'
    ? 'N. Macedonia'
    : countryName === 'Bosnia'
    ? 'BiH'
    : countryName;
}

export default startLogarithmicChart;
export {
  getHistoryTimelineData,
  getHistoricalDataForCountry,
  getHistoricalData,
  findByPropertyName,
};
