import regeneratorRuntime from 'regenerator-runtime';
import { NovelCovid } from 'novelcovid';
import { CountUp } from 'countup.js';
import { balkanCountries } from './constants';

import startRadarChart from './radarChart';
import startLogarithmicChart from './logarithmicChart';
import particlesConfig from './particlesConfig';
import startColumnChart from './columnChart';

const covidApi = new NovelCovid();

startRadarChart();
startLogarithmicChart('cases');
startLogarithmicChart('deaths');
printTotalCountsOnBalkan();
startColumnChart();

async function getCountryData() {
  return covidApi.countries(Object.values(balkanCountries).join(','));
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

    const infectedCountUp = new CountUp('infectedCount', infected);
    infectedCountUp.start();

    const deathsCountUp = new CountUp('deathsCount', deaths);
    deathsCountUp.start();

    const recoveredCountUp = new CountUp('recoveredCount', recovered);
    recoveredCountUp.start();
  } catch (error) {
    console.error('Error has occured', error);
  }
}

window.onload = async function () {
  function swapInfoLinks(args) {
    (this.items = document.querySelectorAll(args.selector)),
      (this.duration = args.duration),
      (this.tick = 0),
      (this.index = 0),
      this.last,
      this.current;

    this.main();
  }
  swapInfoLinks.prototype.main = function () {
    requestAnimationFrame(this.main.bind(this));
    if (this.tick >= this.duration) {
      this.tick = 0;
      this.swap();
      this.render();
    } else {
      this.tick++;
    }
  };

  swapInfoLinks.prototype.render = function () {
    this.current.classList.remove('hidden');
    this.last.classList.add('hidden');
  };

  swapInfoLinks.prototype.setCurrent = function (index, lastIndex) {
    this.current = this.items[index];
    this.last = this.items[lastIndex];
  };

  swapInfoLinks.prototype.swap = function () {
    let nextIndex = this.index + 1;
    if (this.index == this.items.length - 1) {
      this.index = 0;
      this.setCurrent(0, this.items.length - 1);
    } else {
      this.setCurrent(nextIndex, nextIndex - 1);
      this.index = nextIndex;
    }
  };

  new swapInfoLinks({
    duration: 500,
    selector: '.text',
  });

  particlesJS('particles-js', particlesConfig);

  const modal = document.getElementById('modal-id');

  document.getElementById('open-modal-button').onclick = function () {
    modal.style.display = 'block';
  };

  document.getElementsByClassName('close')[0].onclick = function () {
    modal.style.display = 'none';
  };

  const data = await getCountryData();
  document.getElementById('last-updated').innerHTML =
    'Data last updated ' + new Date(data[0].updated);

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
};
