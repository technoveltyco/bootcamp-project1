(function (global, document, localStorage) {

  ///
  // Dark mode toggler
  ///

  const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  toggleSwitch.addEventListener('change', switchTheme, false);

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }

  ///
  // API tests
  ///

  // DOM Elements
  const requestctn1 = document.querySelector("#api-store-request");
  const responsectn1 = document.querySelector("#api-store-response");
  const requestctn2 = document.querySelector("#api-fake-request");
  const responsectn2 = document.querySelector("#api-fake-response");
  const requestctn3 = document.querySelector("#api-currency-request");
  const responsectn3 = document.querySelector("#api-currency-response");

  const endpoints = {
    platzi: {
      products: "https://api.escuelajs.co/api/v1/products/"
    },
    faker: {
      credit_cards: "https://fakerapi.it/api/v1/credit_cards?_quantity=1"
    },
    exchange_rate: {
      currency: "https://v6.exchangerate-api.com/v6/ae007f997716ef4e399f00af/latest/GBP"
    }
  };

  // Request HTTP Method and Headers
  let options = {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    }
  };

  // Platzi Fake Store API
  fetch(endpoints["platzi"]["products"], options)
    .then(response => response.json())
    .then(response => {

      console.log("Platzi - HTTP GET request:", endpoints["platzi"]["products"]);
      console.log("Platzi - HTTP JSON response:", response);
      
      requestctn1.textContent = endpoints["platzi"]["products"];
      responsectn1.textContent = JSON.stringify(response, null, 5);
      localStorage.setItem("data",response[0].category.id)
    })
    .catch(err => console.error(err));

  // Faker API
  fetch(endpoints["faker"]["credit_cards"], options)
    .then(response => response.json())
    .then(response => {

      console.log("Faker - HTTP GET request:", endpoints["faker"]["credit_cards"]);
      console.log("Faker - JSON response:", response);

      requestctn2.textContent = endpoints["platzi"]["products"];
      responsectn2.textContent = JSON.stringify(response, null, 5);

    })
    .catch(err => console.error(err));

  // ExchangeRate API
  fetch(endpoints["exchange_rate"]["currency"], options)
    .then(response => response.json())
    .then(response => {

      console.log("ExchangeRate - HTTP GET request:", endpoints["exchange_rate"]["currency"]);
      console.log("ExchangeRate - HTTP JSON response:", response);

      requestctn3.textContent = endpoints["exchange_rate"]["currency"];
      responsectn3.textContent = JSON.stringify(response, null, 5);

    })
    .catch(err => console.error(err));

})(this, this.document, this.localStorage);
