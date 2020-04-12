import regeneratorRuntime from "regenerator-runtime";
import { NovelCovid } from "novelcovid";
import { CountUp } from "countup.js";
import { balkanCountries } from "./constants";

import startRadarChart from "./radarChart";
import startLogarithmicChart from "./logarithmicChart";

const covidApi = new NovelCovid();

startRadarChart();
startLogarithmicChart();
printTotalCountsOnBalkan();

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
