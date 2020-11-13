import * as am4charts from '@amcharts/amcharts4/charts';
import {
  ready,
  useTheme,
  percent,
  create,
  color,
  options,
} from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { getCovidDataWithNamesRenamed } from './utils';

const chartColors = [
  '#fa6e6e',
  '#c73839',
  '#822825',
  '#f05440',
  '#d5433d',
  '#EE3F28',
  '#902c2d',
  '#8C1A0B',
  '#283250',
];

options.queue = true;
options.onlyShowOnViewport = true;

function start3dPieChart(covidData) {
  ready(function () {
    useTheme(am4themes_animated);

    let chart = create('pieChart', am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // Initial fade-in
    chart.preloader.fill = '#FFFFFF';
    chart.preloader.opacity = 0.6;
    chart.preloader.visible = true;

    chart.data = getCovidDataWithNamesRenamed(
      getTestsCounductedForCountries(covidData),
      'N. Macedonia',
      'BIH',
    );

    let title = chart.titles.create();
    title.text = `Pie chart - Total Tests Conducted`;
    title.fontSize = 16;
    title.marginBottom = 20;
    title.fill = color('#ef6666');
    title.fontWeight = 600;

    chart.innerRadius = percent(40);
    chart.depth = 120;

    chart.legend = new am4charts.Legend();
    chart.legend.useDefaultMarker = true;
    chart.legend.width = 900;

    chart.legend.valueLabels.template.text = '[bold {color}][/]';

    let series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.category = 'country';
    series.dataFields.value = 'tests';
    series.dataFields.depthValue = 'tests';

    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;
    series.labels.template.width = 0;
    series.legendSettings.labelText = '[bold {color}]{category}[/]';

    // Set slice color
    series.slices.template.propertyFields.fill = 'color';
    series.labels.template.fill = color('#F0FFFF');
  });
}

function getTestsCounductedForCountries(covidData) {
  const testsConducted = [];
  let colorIndex = 0;

  try {
    for (const c of covidData) {
      const { country, tests } = c;
      testsConducted.push({
        country,
        tests,
        color: color(chartColors[colorIndex]),
      });
      colorIndex++;
    }

    return testsConducted.sort((a, b) => b.tests - a.tests);
  } catch (error) {
    console.error('Error has occured ', error);
  }
}

export default start3dPieChart;
