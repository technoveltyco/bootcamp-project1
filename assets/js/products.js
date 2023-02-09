// JavaScript of Product listing page.
const mainPageContentEl = document.querySelector("#main-page-content");
const productListEl = document.querySelector("#product-list");
const navSearchInputEl = document.querySelector("#nav-search-input");
const navSearchButtonEl = document.querySelector("#nav-search-button");
const navPrimaryItemsEl = document.querySelector("#nav-primary-items");
const currencyDropdownEl = document.querySelector("#currency-dropdown");
const currencyDropdownButtonEl = document.querySelector(
  "#currencyDropdownButton"
);
const currencyMenuItemsEl = document.querySelector("#currency-menu-items");

const endpoints = {
  platzi: {
    products: "https://api.escuelajs.co/api/v1/products/",
    categories: "https://api.escuelajs.co/api/v1/categories?limit=5",
  },
  faker: {
    credit_cards: "https://fakerapi.it/api/v1/credit_cards?_quantity=1",
  },
  exchange_rate: {
    currency:
      "https://v6.exchangerate-api.com/v6/dc9edcf7a653563d44d04acc/latest/GBP",
  },
};

const currencies = {
  CAD: {
    countryName: "Canada",
    currencyCode: "CAD",
    currencySign: "c$",
    icon: "./assets/img/Flag_of_Canada.svg",
  },
  EUR: {
    countryName: "European Union",
    currencyCode: "EUR",
    currencySign: "€",
    icon: "./assets/img/Flag_of_Europe.svg",
  },
  GBP: {
    countryName: "United Kingdom",
    currencyCode: "GBP",
    currencySign: "£",
    icon: "./assets/img/United-kingdom_flag_icon_round.svg",
  },
  USD: {
    countryName: "United States",
    currencyCode: "USD",
    currencySign: "$",
    icon: "./assets/img/United-states_flag_icon_round.svg",
  },
};

// Request HTTP Method and Headers
let options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

let exchangeRates;
storeGBPExchangeRates();

// DEV: for products page testing, add the tailwind 'hidden' class ('display: none')
document.querySelector("#hero-banner").classList.add("hidden");

// add categories dynamically to main nav, from api
populateNavPrimaryItems();

let selectedCurrencyCode =
  localStorage.getItem("selectedCurrencyCode") || "GBP";
renderSelectedCurrency(selectedCurrencyCode);
renderCurrencies();

// FUNCTIONS ------------------------------------------------------- //

function renderSelectedCurrency(currencyCode) {
  const html = `
  <img
    src="${currencies[currencyCode].icon}"
    class="rounded-full"
    alt="${currencies[currencyCode].countryName} flag"
    width="15px"
    height="15px"
    loading="lazy"
  />&nbsp; ${currencies[currencyCode].currencySign} <i class="fa-solid fa-angle-down"></i>
  <i class="fa-solid fa-angle-up"></i> 
  `;

  currencyDropdownButtonEl.innerHTML = html;
}

function renderCurrencies() {
  let html = "";

  Object.keys(currencies).forEach((currency) => {
    if (currency !== selectedCurrencyCode) {
      html += renderCurrencyItem(currency);
    }
  });

  currencyMenuItemsEl.innerHTML = html;
}

function renderCurrencyItem(currencyCode) {
  return `
<li
  role="menuitem"
  class="hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50 hover:text-blue-gray-900 focus:text-blue-gray-900 active:text-blue-gray-900 bg-blue-gray-50/80 text-blue-gray-900 block w-full cursor-pointer select-none rounded-md py-1.5 px-2.5 text-start text-xs font-medium transition-all hover:bg-opacity-80 focus:bg-opacity-80 active:bg-opacity-80"
>
  <a
    href="#"
    data-country-name="${currencies[currencyCode].countryName}"
    data-currency-code="${currencies[currencyCode].currencyCode}"
    data-currency-sign="${currencies[currencyCode].currencySign}"
  >
    <img
      src="${currencies[currencyCode].icon}"
      class="rounded-full"
      alt="${currencies[currencyCode].name} flag"
      width="25px"
      height="25px"
      loading="lazy"
    />&nbsp; ${currencies[currencyCode].currencySign}
  </a>
</li>
  `;
}

function storeGBPExchangeRates() {
  // only fetch from api if it doesn't exsist - to save limited api calls while testing
  if (!localStorage.getItem("GBPExchangeRates")) {
    alert("ExchangeRate API Call");
    // ExchangeRate API
    fetch(endpoints["exchange_rate"]["currency"], options)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);

        exchangeRates = JSON.stringify(response);
        localStorage.setItem("GBPExchangeRates", exchangeRates);
      })
      .catch((err) => console.error(err));
  } else {
    exchangeRates = JSON.parse(localStorage.getItem("GBPExchangeRates"));
  }
}

function fetchProductsEndpoint(queryString) {
  fetch(endpoints["platzi"]["products"] + queryString, options)
    .then((response) => response.json())
    .then((response) => {
      console.log(response);

      // clear contents before populating
      productListEl.innerHTML = "";

      response.forEach((item) => {
        createCard(item);
      });
    })
    .catch((err) => console.error(err));
}

function populateNavPrimaryItems() {
  // clear existing list items
  navPrimaryItemsEl.innerHTML = "";

  // create category buttons from api
  fetch(endpoints["platzi"]["categories"], options)
    .then((response) => response.json())
    .then((response) => {
      response.forEach((category) => {
        const newListItemEl = document.createElement("li");
        newListItemEl.classList.add("nav-item");

        newListItemEl.innerHTML = `
          <a
            class="nav-link block py-2 pr-2 text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 focus:text-gray-700 lg:px-2"
            href="#!" data-category-id="${category.id}"
            >${category.name}</a
          >
        `;
        navPrimaryItemsEl.appendChild(newListItemEl);
      });
    })
    .catch((err) => console.error(err));
}

function convertPrice(price) {
  const currencyExchangeRate = Number.parseFloat(exchangeRates.conversion_rates[selectedCurrencyCode]);
  return (price * currencyExchangeRate).toFixed(2);
}


function createCard(item) {
  const newCardDiv = document.createElement("div");

  newCardDiv.classList.add(
    "w-full",
    "m-1",
    "max-w-sm",
    "bg-white",
    "border",
    "border-gray-200",
    "rounded-lg",
    "shadow",
    "dark:bg-gray-800",
    "dark:border-gray-700"
  );

  newCardDiv.innerHTML = `
    <a href="#">
        <img class="rounded-t-lg" src="${item.images[0]}" alt="" />
    </a>
    <div class="p-5">
    <a href="#">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${item.title}</h5>
    </a>
    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${item.description}</p>
    <p class="mb-3 font-bold text-gray-900"><span class="currency">${currencies[selectedCurrencyCode].currencySign}</span><span class="price" data-original-price="${item.price}">${convertPrice(item.price)}</span></p>
    </div>
  `;

  productListEl.appendChild(newCardDiv);
}

// EVENT LISTNERS ------------------------------------------------------------ //

navPrimaryItemsEl.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.matches("a")) {
    const categoryQuery = `?categoryId=${event.target.dataset.categoryId}`;
    fetchProductsEndpoint(categoryQuery);
  }
});

navSearchButtonEl.addEventListener("click", (event) => {
  const searchText = navSearchInputEl.value.trim();

  if (searchText) {
    const titleQuery = `?title=${searchText}`;
    fetchProductsEndpoint(titleQuery);
  }
});

currencyDropdownEl.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.parentNode.closest("ul")) {
    let selectedEl = event.target.closest("li > a");
    if (selectedEl) {
      selectedCurrencyCode = selectedEl.dataset.currencyCode;
      localStorage.setItem("selectedCurrencyCode", selectedCurrencyCode);

      renderSelectedCurrency(selectedCurrencyCode);
      renderCurrencies();

      // Update product prices, if there is any.
      document.querySelectorAll(".currency").forEach((currencyEl) => {
        currencyEl.textContent = currencies[selectedCurrencyCode].currencySign;
      });

      document.querySelectorAll(".price").forEach((priceEl) => {
        const productPrice = Number.parseFloat(priceEl.dataset.originalPrice);
        priceEl.textContent = convertPrice(productPrice);
      });
    }
  }
});
