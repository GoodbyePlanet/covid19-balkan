import regeneratorRuntime from 'regenerator-runtime';
import {
  ready,
  useTheme,
  percent,
  create,
  color,
  options,
} from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_dataviz from '@amcharts/amcharts4/themes/dataviz';
import { balkanCountries } from './constants';
import { tooltip } from './tooltip';
import { getCovidDataWithNamesRenamed } from './utils';

const { MACEDONIA } = balkanCountries;

options.queue = true;

function startRadarChart(covidData) {
  ready(function () {
    useTheme(am4themes_dataviz);

    let chart = create('radarChart', am4charts.RadarChart);
    chart.numberFormatter.numberFormat = '#a';

    chart.responsive.enabled = true;
    chart.preloader.fill = '#FFFFFF';
    chart.preloader.opacity = 0.6;
    chart.preloader.visible = true;

    chart.data = getCovidDataWithNamesRenamed(
      getTransformedCountryData(covidData),
      MACEDONIA,
      'BiH',
    );
    chart.innerRadius = percent(36);

    let title = chart.titles.create();
    title.text = 'Radar chart';
    title.fontSize = 16;
    title.marginBottom = 20;
    title.fill = color('#ef6666');
    title.fontWeight = 600;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = 'country';
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.labels.template.fill = color("#F0FFFF");

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.extraMax = 0.1;
    valueAxis.renderer.grid.template.strokeOpacity = 0.08;
    valueAxis.renderer.labels.template.fill = color("#A0A0A0");
    valueAxis.renderer.grid.template.stroke = color("#A0A0A0");

    chart.seriesContainer.zIndex = -10;
    
    let series = chart.series.push(new am4charts.RadarColumnSeries());
    series.dataFields.categoryX = 'country';
    series.dataFields.valueO = 'countryFlag';
    series.dataFields.valueY = 'cases';
    series.dataFields.valueD = 'todayCases';
    series.dataFields.valueC = 'recovered';
    series.dataFields.valueA = 'tests';
    series.dataFields.valueU = 'critical';
    series.dataFields.valueZ = 'deaths';
    series.tooltipHTML = tooltip;
    series.columns.template.strokeOpacity = 0;
    series.columns.template.radarColumn.cornerRadius = 5;
    series.columns.template.radarColumn.innerCornerRadius = 0;

    chart.zoomOutButton.disabled = true;

    series.columns.template.adapter.add('fill', (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    categoryAxis.sortBySeries = series;

    categoryAxis.cursorTooltipEnabled = false;

    chart.cursor = new am4charts.RadarCursor();
    chart.cursor.behavior = 'none';
    chart.cursor.lineX.disabled = false;
    chart.cursor.lineY.disabled = true;
  });
}

function getTransformedCountryData(covidData) {
  const countriesCovid = [];
  try {
    for (const c of covidData) {
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
    console.error('Error has occured ', error);
  }
}

export default startRadarChart;
