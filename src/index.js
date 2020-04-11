import regeneratorRuntime from "regenerator-runtime";
import { NovelCovid } from "novelcovid";
import { CountUp } from "countup.js";
import {
  ready,
  useTheme,
  percent,
  create,
  color,
  Scrollbar,
  PatternSet,
} from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import { balkanCountries, countriesCodes } from "./constants";
import { tooltip } from "./tooltip";

const covidApi = new NovelCovid();

const {
  MACEDONIA,
  BOSNIA,
  SLOVENIA,
  CROATIA,
  SERBIA,
  GREECE,
} = balkanCountries;

const { BA, SI, HR, RS, EL } = countriesCodes;

startLogarithmicChart();
startRadarChart();
printTotalCountsOnBalkan();

function startLogarithmicChart() {
  ready(async function () {
    useTheme(am4themes_dark);
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create("logarithmicChart", am4charts.XYChart);
    chart.dateFormatter.dateFormat = "yyyy/MM/dd";

    chart.data = await getHistoricalData();
    chart.colors.step = 2;

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 50;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis()); // 1
    valueAxis.logarithmic = true; // 2
    valueAxis.renderer.minGridDistance = 20; // 3

    function createSeries(field, name, c) {
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

    createSeries(RS, RS);
    createSeries(HR, HR);
    createSeries(EL, EL);
    createSeries(SI, SI);
    createSeries(BA, BA);

    chart.legend = new am4charts.Legend();

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = true;
    chart.cursor.xAxis = dateAxis;
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineX.fill = color("#000");
    chart.cursor.lineX.fillOpacity = 0.1;

    // Add scrollbar
    chart.scrollbarX = new Scrollbar();
  });
}

function startRadarChart() {
  ready(async function () {
    useTheme(am4themes_dark);
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create("radarChart", am4charts.RadarChart);

    chart.responsive.enabled = true;

    chart.data = renameCountryNames(await getData());
    chart.innerRadius = percent(40);

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "country";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.grid.template.strokeOpacity = 0.08;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.extraMax = 0.1;
    valueAxis.renderer.grid.template.strokeOpacity = 0.08;

    chart.seriesContainer.zIndex = -10;

    let series = chart.series.push(new am4charts.RadarColumnSeries());
    series.dataFields.categoryX = "country";
    series.dataFields.valueO = "countryFlag";
    series.dataFields.valueY = "cases";
    series.dataFields.valueD = "todayCases";
    series.dataFields.valueC = "recovered";
    series.dataFields.valueA = "tests";
    series.dataFields.valueU = "critical";
    series.dataFields.valueZ = "deaths";
    series.tooltipHTML = tooltip;
    series.columns.template.strokeOpacity = 0;
    series.columns.template.radarColumn.cornerRadius = 5;
    series.columns.template.radarColumn.innerCornerRadius = 0;

    chart.zoomOutButton.disabled = true;

    series.columns.template.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    categoryAxis.sortBySeries = series;

    categoryAxis.cursorTooltipEnabled = false;

    chart.cursor = new am4charts.RadarCursor();
    chart.cursor.behavior = "none";
    chart.cursor.lineX.disabled = false;
    chart.cursor.lineY.disabled = true;
  });
}

async function getData() {
  const countriesCovid = [];
  try {
    for (const c of await getCountryData()) {
      const {
        countryInfo,
        country,
        cases,
        todayCases,
        deaths,
        recovered,
        tests,
        critical,
      } = c;
      countriesCovid.push({
        countryFlag: countryInfo.flag,
        country,
        cases,
        todayCases,
        deaths,
        recovered,
        tests,
        critical,
      });
    }

    return countriesCovid;
  } catch (error) {
    console.error("Error has occured ", error);
  }
}

function renameCountryNames(covidData) {
  return covidData.map((item) => {
    if (item.country === MACEDONIA) {
      item.country = "North Macedonia";
    }
    if (item.country === BOSNIA) {
      item.country = "Bosnia and Herzegovina";
    }
    return item;
  });
}

async function getCountryData() {
  return covidApi.countries(Object.values(balkanCountries).join(","));
}

async function printTotalCountsOnBalkan() {
  try {
    let infected = 0;
    let recovered = 0;
    let deaths = 0;

    for (const c of await getCountryData()) {
      infected += c.cases;
      recovered += c.recovered;
      deaths += c.deaths;
    }

    const infectedCountUp = new CountUp("infected", infected, {
      prefix: "INFECTED: ",
    });
    infectedCountUp.start();

    const deathsCountUp = new CountUp("deaths", deaths, { prefix: "DEATHS: " });
    deathsCountUp.start();

    const recoveredCountUp = new CountUp("recovered", recovered, {
      prefix: "RECOVERED: ",
    });
    recoveredCountUp.start();
  } catch (error) {
    console.error("Error has occured", error);
  }
}

async function getHistoricalData() {
  const countriesHistory = await getCountriesHistoricalData();

  const groups = groupDataByDate(countriesHistory.flat());

  return Object.keys(groups).map((date) => {
    return {
      date,
      RS: findByPropertyName(groups, date, RS).RS,
      EL: findByPropertyName(groups, date, EL).EL,
      HR: findByPropertyName(groups, date, HR).HR,
      SI: findByPropertyName(groups, date, SI).SI,
      BA: findByPropertyName(groups, date, BA).BA,
    };
  });
}

function getCountriesHistoricalData() {
  const serbia = getHistoricalDataForCountry(SERBIA, RS);
  const greece = getHistoricalDataForCountry(GREECE, EL);
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

window.onload = async function () {
  // Start Particles
  Particles.init({
    selector: ".background",
    color: ["red"],
    sizeVariations: 5,
    maxParticles: 200,
  });

  const modal = document.getElementById("modal-id");

  document.getElementById("open-modal-button").onclick = function () {
    modal.style.display = "block";
  };

  document.getElementsByClassName("close")[0].onclick = function () {
    modal.style.display = "none";
  };

  const data = await getCountryData();
  document.getElementById("last-updated").innerHTML =
    "Data last updated " + new Date(data[0].updated);

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};
