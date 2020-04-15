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

    const infectedCountUp = new CountUp("infectedCount", infected);
    infectedCountUp.start();

    const deathsCountUp = new CountUp("deathsCount", deaths);
    deathsCountUp.start();

    const recoveredCountUp = new CountUp("recoveredCount", recovered);
    recoveredCountUp.start();
  } catch (error) {
    console.error("Error has occured", error);
  }
}

window.onload = async function () {
  particlesJS("particles-js", {
    particles: {
      number: { value: 120 },
      color: { value: "#B22222" },
      shape: {
        type: "circle",
        stroke: { width: 1, color: "#ff4d4d" },
        polygon: { nb_sides: 5 },
      },
      opacity: {
        value: 9,
        random: true,
        anim: { enable: true, speed: 2, opacity_min: 0, sync: false },
      },
      size: {
        value: 3,
        random: true,
        anim: { enable: false, speed: 4, size_min: 0.3, sync: false },
      },
      line_linked: {
        enable: false,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 600 },
      },
    },
    retina_detect: true,
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
