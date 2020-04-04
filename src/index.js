import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";

start();

function start() {
  am4core.ready(function () {
    am4core.useTheme(am4themes_dark);
    am4core.useTheme(am4themes_dataviz);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdiv", am4charts.RadarChart);

    chart.data = [
      { country: "Serbia", active: 1476, dead: 12 },
      { country: "Bosnia and Herzegovina", active: 604, dead: 45 },
      { country: "Montenegro", active: 174, dead: 21 },
      { country: "Croatia", active: 1079, dead: 33 },
      { country: "Romania", active: 3613, dead: 146 },
      { country: "North Macedonia", active: 483, dead: 17 },
      { country: "Slovenia", active: 934, dead: 20 },
      { country: "Greece", active: 1613, dead: 67 },
      { country: "Bulgaria", active: 503, dead: 17 },
      { country: "Albania", active: 333, dead: 18 },
    ];

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
    series.dataFields.valueY = "active";
    series.dataFields.valueZ = "dead";
    series.tooltipText = "Active: [bold]{valueY}[/]\nDead: [bold]{valueZ}[/]";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.radarColumn.cornerRadius = 5;
    series.columns.template.radarColumn.innerCornerRadius = 0;

    chart.zoomOutButton.disabled = true;

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
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
