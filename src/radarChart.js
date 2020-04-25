import regeneratorRuntime from "regenerator-runtime";
import { NovelCovid } from "novelcovid";
import { ready, useTheme, percent, create, color } from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import { balkanCountries } from "./constants";
import { tooltip } from "./tooltip";

const covidApi = new NovelCovid();
const { MACEDONIA, BOSNIA } = balkanCountries;

function startRadarChart() {
  ready(async function () {
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create("radarChart", am4charts.RadarChart);

    chart.responsive.enabled = true;
    chart.preloader.fill = '#FFFFFF';
    chart.preloader.opacity = 0.6;
    chart.preloader.visible = true;

    chart.data = renameCountryNames(await getData());
    chart.innerRadius = percent(36);

    let title = chart.titles.create();
    title.text = 'Radar chart';
    title.fontSize = 16;
    title.marginBottom = 20;
    title.fill = color('#ef6666');
    title.fontWeight = 600;

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

function renameCountryNames(covidData) {
  return covidData.map((item) => {
    if (item.country === "Macedonia") {
      item.country = MACEDONIA;
    }
    if (item.country === "Bosnia") {
      item.country = BOSNIA;
    }
    return item;
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

async function getCountryData() {
  try {
    return covidApi.countries(Object.values(balkanCountries).join(","));
  } catch(error) {
    console.error('An error has occurred', error);
    const element = document.getElementById('radarChart');
    element.parentNode.removeChild(element);
    const div = document.createElement('div');
    div.innerHTML = "Radar chart could now load due to error on fetching data from an API";

    const container = document.getElementsByClassName("radarContainer");
    container[0].appendChild(div);
  }
}

export default startRadarChart;
