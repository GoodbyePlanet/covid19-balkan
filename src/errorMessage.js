function showErrorMessage() {
  const element = document.getElementById('errorMassage');
  element.innerHTML =
    'Data could not be loaded from an API, please visit as later :)';

  const container = document.getElementsByClassName('container');
  container[0].style.display = 'none';
}

export { showErrorMessage };
