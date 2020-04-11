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
} from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import balkanCountries from "./balkanCountries";
import { tooltip } from "./tooltip";

const covidApi = new NovelCovid();

// getHistoricalDataFoCountry('Serbia');

getHistoricalData();

startLogarithmicChart();
startRadarChart();
printTotalCountsOnBalkan();

function startLogarithmicChart() {
  ready(async function () {
    useTheme(am4themes_dark);
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    var chart = create("logarithmicChart", am4charts.XYChart);

    chart.dateFormatter.dateFormat = "yyyy/MM/dd";
    // Add data
    // chart.data = getLogarithmicData();

    chart.data = await getHistoricalData();

    // chart.data = await getHistoricalDataFoCountry("Serbia");
    // chart.colors.step = 2;

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 50;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis()); // 1
    valueAxis.logarithmic = true; // 2
    valueAxis.renderer.minGridDistance = 20; // 3

    function createAxisAndSeries(field, name) {
      let series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = field;
      series.dataFields.dateX = "date";
      series.tensionX = 0.8;
      series.strokeWidth = 3;
      series.yAxis = valueAxis;
      series.name = name;
      series.tooltipText = "{name}: [bold]{valueY}[/]";
      series.tensionX = 0.8;
      series.showOnInit = true;

      let bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.fill = color("#fff");
      bullet.circle.strokeWidth = 3;

      let range = valueAxis.axisRanges.create();
      range.value = 90.4;
      range.grid.stroke = color("#396478");
      range.grid.strokeWidth = 1;
      range.grid.strokeOpacity = 1;
      range.grid.strokeDasharray = "3,3";
      range.label.inside = true;
    }

    createAxisAndSeries("RS", "RS");
    createAxisAndSeries("HR", "HR");
    createAxisAndSeries("EL", "EL");

    chart.legend = new am4charts.Legend();

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = true;
    // chart.cursor.fullWidthLineY = true;
    chart.cursor.xAxis = dateAxis;
    // chart.cursor.yAxis = valueAxis;
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
    if (item.country === "Macedonia") {
      item.country = "North Macedonia";
    }
    if (item.country === "Bosnia") {
      item.country = "Bosnia and Herzegovina";
    }
    return item;
  });
}

async function getCountryData() {
  return covidApi.countries(balkanCountries.join(","));
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
  const historicalSerbia = await getHistoricalDataForCountry(
    "Serbia",
    "RS",
    true
  );
  const historicalGreece = await getHistoricalDataForCountry(
    "Greece",
    "EL",
    true
  );
  const historicalCroatia = await getHistoricalDataForCountry(
    "Croatia",
    "HR",
    true
  );

  const allData = [
    ...historicalSerbia,
    ...historicalGreece,
    ...historicalCroatia,
  ];

  const groups = allData.reduce((groups, item) => {
    const date = item.date;

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  const groupArrays = Object.keys(groups).map((date) => {
    return {
      date,
      games: groups[date],
    };
  });

  const groupArrays1 = Object.keys(groups).map((date) => {
    return {
      date,
      RS: groups[date].find((el) => el.hasOwnProperty("RS")).RS,
      EL: groups[date].find((el) => el.hasOwnProperty("EL")).EL,
      HR: groups[date].find((el) => el.hasOwnProperty("HR")).HR,
    };
  });

  console.log("FINALL DATA", groups);
  console.log("FINALL DATA1", groups1);
  console.log("FINALL ARRAYS DATA", groupArrays);
  console.log("FINALL ARRAYS1 DATA", groupArrays1);

  return groupArrays1;
}

async function getHistoricalDataForCountry(country, fieldName, withDate) {
  const historicalCases = await getHistoricalCasesData(country);

  const historicData = Object.entries(historicalCases).map((item) => {
    if (withDate) {
      return { date: item[0], [fieldName]: item[1] };
    }
    return { [fieldName]: item[1] };
  });

  return historicData;
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
