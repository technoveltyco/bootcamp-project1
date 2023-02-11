/// ---------------------------
//  Fakee-shop backend module.
/// ---------------------------

// -------------------- PRIVATE API --------------------------

///
// DOM elements.
///

const docMainEl = document.querySelector("main");
const productListEl = document.querySelector("#product-list");
const navSearchInputEl = document.querySelector("#nav-search-input");
const navSearchButtonEl = document.querySelector("#nav-search-button");
const navPrimaryItemsEl = document.querySelector("#nav-primary-items");
const currencyDropdownEl = document.querySelector("#currency-dropdown");
const currencyDropdownButtonEl = document.querySelector(
  "#currencyDropdownButton"
);
const currencyMenuItemsEl = document.querySelector("#currency-menu-items");
const navBreadcrumbEl = document.querySelector("#nav-breadcrumb");
const back2TopBtn = document.querySelector("#btn-back-to-top");

///
// Global states.
///

/**
 * Global configuration settings
 * 
 * @type {show_nav_promo: boolean}
 */
let settings = {
  show_nav_promo: false,
  promo: {}
};

/**
 * Available endpoints.
 *
 * @type {{ platzi: Object{ products: String, categories: String}, faker: Object{credit_cards: String}, exchange_rate: Object{currency: String}}}
 */
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

/**
 * Available currencies.
 *
 * @type {{CAD: Object{countryName: String, countryCode: String, currencySign: string, icon:String} ... }}
 */
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

/**
 * The HTTP JSON response from the currency exchange API.
 *
 * @type {Object}
 */
let exchangeRates = (localStorage.getItem("GBPExchangeRates")) ? JSON.parse(localStorage.getItem("GBPExchangeRates")) : null;

/**
 * The current currency state in the window where the web executes.
 *
 * The currency is saved in ISO 4217 three letter code,
 * and it's default value is "GBP", and it also may come from the local storage.
 *
 * @type {String}
 */
let selectedCurrencyCode = localStorage.getItem("selectedCurrencyCode") || "GBP";

/**
 * The current page state for this window.
 */
let currentPageName = sessionStorage.getItem("currentPageName") || "index";

/**
 * The HTTP request settings.
 *
 * @type {method: String, headers: Object{Content-Type: String}}
 */
let options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

// FUNCTIONS ------------------------------------------------------- //

/**
 * Renders the HTML of the product details card.
 *
 * @param {String|Number} productID
 *    The product id.
 */
function displayProductDetails(productID) {
  // TODO: implement product details here
  document.querySelector("#temp-product-id").textContent = productID;
}

/**
 * Routes the given action to display the HTML elements
 * for the correspondent page name content.
 *
 * @param {String} pageName
 *    The action to route.
 */
function switchPageTo(pageName = "index") {
  // get all the breadcrumbs and turn nodeList into an array
  const breadcrumbEls = [...navBreadcrumbEl.querySelectorAll(":scope li")];

  switch (pageName) {
    case "products":
      // load product listing

      // show content by removing the tailwind 'hidden' class ('display: none')
      productListEl.classList.remove("hidden");
      // show all breadcrumbs (before hiding unwanted links)
      breadcrumbEls.forEach((link) => link.classList.remove("hidden"));

      // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
      document.querySelector("#hero-banner").classList.add("hidden");
      document.querySelector("#homepage-content").classList.add("hidden");
      document.querySelector("#product-details").classList.add("hidden");

      // just hide last in breadcrumb in array
      breadcrumbEls[breadcrumbEls.length - 1].classList.add("hidden");
      break;

    case "details":
      // load product details
      //displayProductDetails(productCard.dataset.productID);

      // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
      productListEl.classList.add("hidden");
      document.querySelector("#hero-banner").classList.add("hidden");
      document.querySelector("#homepage-content").classList.add("hidden");

      // show all breadcrumbs
      breadcrumbEls.forEach((link) => link.classList.remove("hidden"));

      // show content by removing the tailwind 'hidden' class ('display: none')
      document.querySelector("#product-details").classList.remove("hidden");
      break;

    case "index":
    default:
      // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
      productListEl.classList.add("hidden");
      document.querySelector("#product-details").classList.add("hidden");

      const linksToHide = breadcrumbEls.filter(
        (link) => link.dataset.pageName !== pageName
      );
      linksToHide.forEach((link) => link.classList.add("hidden"));

      // show content by removing the tailwind 'hidden' class ('display: none')
      document.querySelector("#hero-banner").classList.remove("hidden");
      document.querySelector("#homepage-content").classList.remove("hidden");
      break;
  }

  // Save the current page into the session storage,
  // so it keeps memory of the route state while the browser's open.
  sessionStorage.setItem("currentPageName", pageName);
}

/**
 * Renders the HTML of the selected currency.
 *
 * @param {String} currencyCode
 *    The ISO 4217 three letter currency code.
 */
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

/**
 * Renders the HTML of the dropdown list of currencies.
 */
function renderCurrencies() {
  currencyMenuItemsEl.innerHTML = "";

  Object.keys(currencies).forEach((currency) => {
    if (currency !== selectedCurrencyCode) {
      currencyMenuItemsEl.innerHTML += renderCurrencyItem(currency);
    }
  });
}

/**
 * Renders the HTML of a currency dropdown item.
 *
 * @param {String} currencyCode
 *    The ISO 4217 three letter currency code.
 * @returns {String}
 *    The HTML output.
 */
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

/**
 * Caches the Currency Exchange Rate API response.
 */
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

/**
 * Fetches the Products API endpoint and renders the HTML of the list of products.
 *
 * @param {String} queryString
 *    The query string of the request.
 */
function fetchProductsEndpoint(queryString) {
  fetch(endpoints["platzi"]["products"] + queryString, options)
    .then((response) => response.json())
    .then((response) => {
      console.log(response);

      // DEV: for products page testing, add the tailwind 'hidden' class ('display: none')
      // TODO: Hides Hero banner - Refactor later
      document.querySelector("#hero-banner").classList.add("hidden");

      // clear contents before populating
      productListEl.innerHTML = "";

      response.forEach((item) => {
        createCard(item);
      });
    })
    .catch((err) => console.error(err));
}

/**
 * Fetches the categories API endpoint and renders the HTML for the primary navigation.
 */
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

      // Add highlighted promo.
      if (settings.show_nav_promo) {
        const {label = "Promo", href = "#!"} = settings.promo;
        addNavPrimaryPromo(label, href); 
      }
    })
    .catch((err) => console.error(err));
}

/**
 * Adds the highlighted promo in the nav primary links.
 * 
 * @param {label: String, href: String} promo
 *    The promo settings with label and href.
 */
function addNavPrimaryPromo(label = "Promo", href = "#!") {
  const html = `
<li class="product-category highlighted nav-item">
  <a
    class="promo-link nav-link block py-2 pr-2 font-semibold text-gray-600 text-red-500 transition duration-150 ease-in-out hover:text-gray-700 hover:text-red-700 focus:text-gray-700 focus:text-red-700 lg:px-2"
    href="${href}"
    >${label}</a
  >
</li>
  `;

  navPrimaryItemsEl.innerHTML += html;
}

/**
 * Converts the given price into the current currency from local storage.
 * @param {Number} price
 *    The product original price in pounds (£).
 * @returns {Number}
 *    The exchanged price.
 */
function convertPrice(price) {
  const currencyExchangeRate = Number.parseFloat(
    exchangeRates.conversion_rates[selectedCurrencyCode]
  );
  return (price * currencyExchangeRate).toFixed(2);
}

/**
 * Renders the HTML of a product listing card.
 *
 * @param {Object} item
 *    The product JSON object from the API.
 */
function createCard(item) {
  const newCardDiv = document.createElement("div");

  // add the product id to the card
  newCardDiv.dataset.productID = item.id;

  newCardDiv.classList.add(
    "product-card",
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
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${
      item.title
    }</h5>
    </a>
    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${
      item.description
    }</p>
    <p class="mb-3 font-bold text-gray-900"><span class="currency">${
      currencies[selectedCurrencyCode].currencySign
    }</span><span class="price" data-original-price="${
    item.price
  }">${convertPrice(item.price)}</span></p>
    </div>
  `;

  productListEl.appendChild(newCardDiv);
}

// -------------------- PUBLIC API --------------------------

/**
 * Initialise the configuration settings.
 * 
 * @param {show_nav_promo: boolean} settings 
 */
function init({show_nav_promo, promo}) {

  settings.show_nav_promo = show_nav_promo || false;
  settings.promo = promo || {};
  
}

/**
 * Gets the website settings.
 * 
 * @returns {Object}
 *    The website settings.
 */
function getSettings() {
  return settings;
}

/**
 * Executes the main
 */
function run() {

  ///
  // Header stuff.
  ///

  // Cache the API exchange rates.
  storeGBPExchangeRates();

  // Currency switcher stuff.
  renderSelectedCurrency(selectedCurrencyCode);
  renderCurrencies();

  // Primary navigation links.
  // add categories dynamically to main nav, from api
  populateNavPrimaryItems();

  // Routing to the page content.
  switchPageTo(currentPageName);

  // EVENT LISTENERS ------------------------------------------------------------ //

  // Product categories links.
  navPrimaryItemsEl.addEventListener("click", (event) => {

    if (event.target.matches("a:not(.promo-link)")) {
      event.preventDefault();

      const categoryQuery = `?categoryId=${event.target.dataset.categoryId}`;
      fetchProductsEndpoint(categoryQuery);

      switchPageTo("products");
    }
    else if (event.target.matches("a.promo-link")) {
      switchPageTo("index");
    }
  });

  // Search box button.
  navSearchButtonEl.addEventListener("click", (event) => {
    event.preventDefault();

    const searchText = navSearchInputEl.value.trim();

    if (searchText) {
      const titleQuery = `?title=${searchText}`;
      fetchProductsEndpoint(titleQuery);
    }

    switchPageTo("products");
  });

  // Currency dropdown button.
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
          currencyEl.textContent =
            currencies[selectedCurrencyCode].currencySign;
        });

        document.querySelectorAll(".price").forEach((priceEl) => {
          const productPrice = Number.parseFloat(priceEl.dataset.originalPrice);
          priceEl.textContent = convertPrice(productPrice);
        });
      }
    }
  });

  // Breadcrumbs trails.
  navBreadcrumbEl.addEventListener("click", (event) => {
    event.preventDefault();

    if (event.target.matches("li")) {
      switchPageTo(event.target.dataset.pageName);
    }
  });

  // Product card of the listing page.
  productListEl.addEventListener("click", (event) => {
    event.preventDefault();

    const productCard = event.target.closest(".product-card");
    if (productCard) {
      displayProductDetails(productCard.dataset.productID);
      switchPageTo("details");
    }
  });

  // Back to top button.

  // When the user scrolls down 20px from the top of the document, show the button
  window.onscroll = function () {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      back2TopBtn.style.display = "block";
    } else {
      back2TopBtn.style.display = "none";
    }

    if (window.scrollY > docMainEl.scrollHeight) {
      back2TopBtn.classList.add("bottom-20");
    } else {
      back2TopBtn.classList.remove("bottom-20");
    }
  };

  // When the user clicks on the button, scroll to the top of the document
  back2TopBtn.addEventListener("click", function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
}

export { init, getSettings, run };
