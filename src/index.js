import "@babel/polyfill";
import { NovelCovid } from "novelcovid";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import balkanCountries from "./balkanCountries";

const covidApi = new NovelCovid();

start();

function start() {
  am4core.ready(async function () {
    am4core.useTheme(am4themes_dark);
    am4core.useTheme(am4themes_dataviz);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdiv", am4charts.RadarChart);

    chart.data = await getData();

    chart.innerRadius = am4core.percent(40);

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
    series.dataFields.valueY = "cases";
    series.dataFields.valueZ = "deaths";
    series.dataFields.valueC = "recovered";
    series.dataFields.valueD = "todayCases";
    series.tooltipText =
      "Cases: [bold]{valueY}[/]\nToday Cases: [bold]{valueD}[/]\nDeaths: [bold]{valueZ}[/]\nRecovered: [bold]{valueC}[/]";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.radarColumn.cornerRadius = 5;
    series.columns.template.radarColumn.innerCornerRadius = 0;

    chart.zoomOutButton.disabled = true;

    series.columns.template.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    categoryAxis.sortBySeries = series;

    chart.cursor = new am4charts.RadarCursor();
    chart.cursor.behavior = "none";
    chart.cursor.lineX.disabled = false;
    chart.cursor.lineY.disabled = true;
  });
}

async function getData() {
  const countriesCovid = [];
  const covidData = balkanCountries.map((c) => getCountryData(c));

  for await (const c of covidData) {
    const { country, cases, todayCases, deaths, recovered } = c;
    countriesCovid.push({
      country,
      cases,
      todayCases,
      deaths,
      recovered,
    });
  }
  console.log("DATA", countriesCovid);
  return countriesCovid;
}

async function getCountryData(country) {
  return covidApi.countries(country);
}
