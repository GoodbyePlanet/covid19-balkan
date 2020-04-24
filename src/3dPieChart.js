import * as am4charts from '@amcharts/amcharts4/charts';
import { NovelCovid } from 'novelcovid';
import {
  ready,
  useTheme,
  percent,
  create,
  color,
} from '@amcharts/amcharts4/core';
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { balkanCountries } from './constants';

const covidApi = new NovelCovid();

const chartColors = [
  '#2c7a22',
  '#02ad8b',
  '#143014',
  '#449595',
  '#bd6763',
  '#EE3F28',
  '#6b0108',
  '#8C1A0B',
  '#396478',
];

function start3dPieChart() {
  ready(async function () {
    useTheme(am4themes_dataviz);
    useTheme(am4themes_animated);

    let chart = create('pieChart', am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // Initial fade-in

    chart.data = renameCountryNames(await getTestsCounductedForCountries());    

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
    let marker = chart.legend.markers.template.children.getIndex(0);
    marker.cornerRadius(12, 12, 12, 12);
    marker.strokeWidth = 2;
    marker.strokeOpacity = 1;
    marker.width = 12;
    marker.height = 12;
    marker.paddingTop = 10;

    // chart.legend.valueLabels.template.text = "{value.value}";
    // chart.legend.labels.template.text = "bold {color}]{category}[/]";
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
    // series.slices.template.propertyFields.fill = "color";
  });
}

function renameCountryNames(covidData) {
  return covidData.map((item) => {
    if (item.country === 'Macedonia') {
      item.country = 'N. Macedonia';
    }
    if (item.country === 'Bosnia') {
      item.country = 'BIH';
    }
    return item;
  });
}

async function getTestsCounductedForCountries() {
  const testsConducted = [];
  let colorIndex = 0;

  try {
    for (const c of await getCountryData()) {
      const { country, tests } = c;
      testsConducted.push({
        country,
        tests,
        // color: color(chartColors[colorIndex]),
      });
      colorIndex++;
    }

    return testsConducted.sort((a, b) => b.tests - a.tests);
  } catch (error) {
    console.error('Error has occured ', error);
  }
}

async function getCountryData() {
  try {
    return covidApi.countries(Object.values(balkanCountries).join(','));
  } catch (error) {
    console.error('An error has occurred', error);
    const element = document.getElementById('pieChart');
    element.parentNode.removeChild(element);
    const div = document.createElement('div');
    div.innerHTML =
      'Pie3D chart could now load due to error on fetching data from an API';

    const container = document.getElementsByClassName('pieContainer');
    container[0].appendChild(div);
  }
}

export default start3dPieChart;
