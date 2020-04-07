import regeneratorRuntime from "regenerator-runtime";
import { NovelCovid } from "novelcovid";
import { ready, useTheme, percent, create } from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import balkanCountries from "./balkanCountries";

const covidApi = new NovelCovid();

start();
printTotalCountsOnBalkan();

function start() {
  ready(async function () {
    useTheme(am4themes_dark);
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create("chartdiv", am4charts.RadarChart);

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
    series.tooltipHTML = `<img src={valueO} style="width:165px; height:115px;">
        <hr />
        <table>
        <tr>
          <th align="left">Cases</th>
          <td style="font-weight:bold">{valueY}</td>
        </tr>
        <tr>
          <th align="left">Today Cases</th>
          <td style="font-weight:bold">{valueD}</td>
        </tr>
        <tr>
          <th align="left">Recovered</th>
          <td style="font-weight:bold">{valueC}</td>
        </tr>
        <tr>
          <th align="left">Tested</th>
          <td style="font-weight:bold">{valueA}</td>
        </tr>
        <tr>
          <th align="left">Critical</th>
          <td style="font-weight:bold">{valueU}</td>
        </tr>
        <tr>
          <th align="left">Deaths</th>
          <td style="font-weight:bold">{valueZ}</td>
        </tr>
        </table>
        <hr />`;
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

    document.getElementById("infected").innerHTML = "INFECTED: " + infected;
    document.getElementById("recovered").innerHTML = "RECOVERED: " + recovered;
    document.getElementById("deaths").innerHTML = "DEATHS: " + deaths;
  } catch (error) {
    console.error("Error has occured", error);
  }
}

window.onload = function () {
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

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};

if (module && module.hot) {
  module.hot.accept();
}
