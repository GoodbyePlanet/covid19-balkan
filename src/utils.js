function renameCountryNames(covidData, macedoniaName, bosniaName) {
  return covidData.map((item) => {
    if (item.country === 'Macedonia') {
      item.country = macedoniaName;
    }
    if (item.country === 'Bosnia') {
      item.country = bosniaName;
    }
    return item;
  });
}

export { renameCountryNames };