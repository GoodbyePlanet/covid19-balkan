import regeneratorRuntime from "regenerator-runtime";
import { NovelCovid } from "novelcovid";
import {
  ready,
  useTheme,
  create,
  color,
  Scrollbar,
} from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import { balkanCountries, countryCodes } from "./constants";

const covidApi = new NovelCovid();
const { BOSNIA, SLOVENIA, CROATIA, SERBIA, GREECE } = balkanCountries;
const { BA, SI, HR, RS, GR } = countryCodes;

function startLogarithmicChart() {
  ready(async function () {
    useTheme(am4themes_dark);
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create("logarithmicChart", am4charts.XYChart);
    chart.dateFormatter.dateFormat = "yyyy/MM/dd";
    chart.responsive.enabled = true;

    chart.data = await getHistoricalData();
    chart.colors.step = 2;

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 50;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.logarithmic = true;
    valueAxis.renderer.minGridDistance = 20;

    function createSeries(field, name) {
      let series = chart.series.push(new am4charts.LineSeries());

      series.zIndex = 1;
      series.col;

      series.dataFields.valueY = field;
      series.dataFields.dateX = "date";
      series.tensionX = 0.8;
      series.strokeWidth = 2;
      series.yAxis = valueAxis;
      series.name = name;
      series.tooltipText = "{name} Cases: [bold]{valueY}[/]";
      series.showOnInit = true;

      if (field === RS) {
        series.stroke = color("#396478");
        series.fill = color("#396478");
        series.invalidate();
        chart.feedLegend();
      }

      if (field === SI || field === BA) {
        series.hidden = true;
      }

      let bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.strokeWidth = 1;

      let range = valueAxis.axisRanges.create();
      range.value = 90.4;
      range.grid.stroke = color("#396478");
      range.grid.strokeWidth = 1;
      range.grid.strokeOpacity = 1;
      range.grid.strokeDasharray = "3,3";
      range.label.inside = true;
    }

    createSeries(RS, SERBIA);
    createSeries(HR, CROATIA);
    createSeries(GR, GREECE);
    createSeries(SI, SLOVENIA);
    createSeries(BA, "BIH");

    chart.legend = new am4charts.Legend();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = true;
    chart.cursor.xAxis = dateAxis;
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineX.fill = color("#000");
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
  const historical = await covidApi.historical(null, country);

  return historical.timeline.cases;
}

export default startLogarithmicChart;
