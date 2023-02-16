/// ---------------------------
//  Fakee-shop backend module.
/// ---------------------------

// -------------------- PRIVATE API --------------------------

///
// DOM elements.
///

const docMainEl = document.querySelector("main");
const homepageContentEl = document.querySelector("#homepage-content");
const productListEl = document.querySelector("#product-list");
const productDetailsEl = document.querySelector("#product-details");
const navLogoEl = document.querySelector(".navigation-logo");
const navSearchFormEl = document.querySelector("#navigation-search");
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
const heroBannerEl = document.querySelector("#hero-banner");
const bestsellersGridEl = document.querySelector("#shop-bestsellers-grid");
const shopByCategoryGridEl = document.querySelector("#shop-by-category-grid");
const featuredCollectionBtn = document.querySelector(
  "#featured-collection-button"
);
const heroPromoCtaBtn = document.querySelector("#hero-promo-cta-btn");
const carouselMultiCtns = document.querySelectorAll(".carousel-multi-items");
const carouselMultiSlideBtns = document.querySelectorAll(
  ".carousel-multi-items button.slide"
);

///
// Global states.
///

/**
 * Global configuration settings
 *
 * @type {{ debug: boolean, show_nav_promo: boolean, promo: Object }}
 */
let settings = {
  debug: false,
  show_nav_promo: false,
  promo: {},
};

/**
 * Debug flag.
 *
 * @type {boolean}
 */
let DEBUG = settings.debug;

/**
 * The Fakee-Shop system messages.
 *
 * @type {{ info: { message: String, api: Function }, error: { message: String, platzi: Function, faker: Function, exchange_rate: Function }}}
 */
const FS = {
  info: {
    message: "API Info: Request: %s Response: %o",
    api: function (request, response) {
      console.log(this.message, request, response);
    },
  },
  error: {
    message: "API Error: %s could not be fetched.",
    platzi: function (error) {
      if (DEBUG) console.error(error);
      throw Error(this.message, "Platzi");
    },
    faker: function (error) {
      if (DEBUG) console.error(error);
      throw Error(this.message, "Faker");
    },
    exchange_rate: function (error) {
      if (DEBUG) console.error(error);
      throw Error(this.message, "Currency Exchange Rate");
    },
  },
};

/**
 * Available endpoints.
 *
 * @type {{ platzi: Object{ products: String, categories: String}, faker: Object{credit_cards: String}, exchange_rate: Object{currency: String}}}
 */
const endpoints = {
  platzi: {
    products: "https://api.escuelajs.co/api/v1/products/",
    categories: "https://api.escuelajs.co/api/v1/categories/",
  },
  faker: {
    credit_cards: "https://fakerapi.it/api/v1/credit_cards/",
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
let exchangeRates = localStorage.getItem("GBPExchangeRates")
  ? JSON.parse(localStorage.getItem("GBPExchangeRates"))
  : null;

/**
 * The current currency state in the window where the web executes.
 *
 * The currency is saved in ISO 4217 three letter code,
 * and it's default value is "GBP", and it also may come from the local storage.
 *
 * @type {String}
 */
let selectedCurrencyCode =
  localStorage.getItem("selectedCurrencyCode") || "GBP";

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
 * @param {Object} item
 *    The JSON API object item.
 */
function displayProductDetails(item) {
  const productDetailsItemEl = getElementByTemplateId(
    "template-product-details-item"
  );
  if (!productDetailsItemEl) {
    return;
  }

  const productDetailsCtn = document.createElement("div");
  productDetailsCtn.classList.add(
    `item-${item.id}-details`,
    `product-${item.id}-details`
  );

  productDetailsItemEl
    .querySelector("#image-left img")
    .setAttribute("src", item.images[1]);
  productDetailsItemEl
    .querySelector("#image-left img")
    .setAttribute("alt", `The left-hand side image of the item ${item.title}`);
  productDetailsItemEl
    .querySelector("#image-right img")
    .setAttribute("src", item.images[0]);
  productDetailsItemEl
    .querySelector("#image-right img")
    .setAttribute("alt", `The right-hand side image of the item ${item.title}`);
  productDetailsItemEl.querySelector("#images-center").innerHTML = "";
  for (let i = 2; i < item.images.length; i++) {
    const html = `
  <div class="aspect-w-3 aspect-h-2 overflow-hidden rounded-lg">
    <img
      src="${item.images[i]}"
      alt="A middle-center image of the item ${item.title}"
      class="h-full w-full object-cover object-center"
    />
  </div>
    `;
    productDetailsItemEl.querySelector("#images-center").innerHTML += html;
  }
  productDetailsItemEl.querySelector(".title").textContent = item.title;
  productDetailsItemEl.querySelector(".currency").textContent =
    currencies[selectedCurrencyCode].currencySign;
  productDetailsItemEl.querySelector(".price").dataset.originalPrice =
    item.price;
  productDetailsItemEl.querySelector(".price").textContent = convertPrice(
    item.price
  );

  productDetailsCtn.appendChild(productDetailsItemEl);

  // get all the breadcrumbs and turn nodeList into an array
  const breadcrumbEls = [...navBreadcrumbEl.querySelectorAll(":scope li")];

  // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
  productListEl.classList.add("hidden");
  heroBannerEl.classList.add("hidden");
  homepageContentEl.classList.add("hidden");

  // show all breadcrumbs
  navBreadcrumbEl.classList.remove("hidden");
  breadcrumbEls.forEach((link) => link.classList.remove("hidden"));

  // show content by removing the tailwind 'hidden' class ('display: none')
  productDetailsEl.innerHTML = "";
  productDetailsEl.appendChild(productDetailsCtn);
  productDetailsEl.classList.remove("hidden");
}

/**
 * Routes the given action to display the HTML elements
 * for the correspondent page name content.
 *
 * @param {String} pageName
 *    The route name.
 * @param {String|integer} action
 *    The action for the route.
 */
async function switchPageTo(pageName = "index", action = "") {
  let queryString = "";
  let response = null;

  switch (pageName) {
    case "index":
      const { bestsellers, categories, luxurious, sustainable } =
        fetchHomepageSections();
      displayHomepageSections(bestsellers, categories, luxurious, sustainable);
      break;
    case "products":
      queryString = action;
      response = await fetchProductsEndpoint(queryString);
      if (!response) {
        return;
      }

      displayProductsSections(response);
      break;
    case "details":
      // load product details
      const productID = action;
      response = await fetchApiEndpoint(
        endpoints["platzi"]["products"],
        productID
      );
      if (!response) {
        display404Sections();
        return;
      }

      displayProductDetails(response);
      break;
    case "category":
      const categoryId = action;
      queryString = `${categoryId}/products`;
      response = await fetchApiEndpoint(
        endpoints["platzi"]["categories"],
        queryString
      );
      if (!response) {
        display404Sections();
        return;
      }

      displayProductsSections(response);
      break;
    default:
      display404Sections();
      break;
  }

  // Scrolls to the top
  document.body.scrollTop = document.documentElement.scrollTop = 0;

  // Save the current page into the global and session storage,
  // so it keeps memory of the route state while the browser's open.
  currentPageName = pageName;
  sessionStorage.setItem("currentPageName", currentPageName);
}

/**
 * Display 404 page sections.
 */
function display404Sections() {
  // TODO: 404 logic ...
}

/**
 * Fetches all the data for the different homepage sections.
 *
 * @returns {{ bestsellers: Promise, categories: Promise }}
 *    An object of Promises with the parsed JSON API responses for each section.
 */
function fetchHomepageSections() {
  const queryStringBestsellers =
    "?price_min=100&price_max=1000&offset=10&limit=4";
  const queryStringCategories = "?limit=5";
  const queryStringLuxurious = "?title=luxurious";
  const queryStringSustainable = "?title=fantastic";

  return {
    bestsellers: fetchApiEndpoint(
      endpoints["platzi"]["products"],
      queryStringBestsellers
    ),
    categories: fetchApiEndpoint(
      endpoints["platzi"]["categories"],
      queryStringCategories
    ),
    luxurious: fetchApiEndpoint(
      endpoints["platzi"]["products"],
      queryStringLuxurious
    ),
    sustainable: fetchApiEndpoint(
      endpoints["platzi"]["products"],
      queryStringSustainable
    ),
  };
}

/**
 * Display homepage sections.
 */
function displayHomepageSections(
  bestsellers,
  categories,
  luxurious,
  sustainable
) {
  // list bestsellers
  bestsellers.then((json) => {
    renderCardsQuerySelector(json, "shop-bestsellers-grid");
  });

  // list categories
  categories.then((json) => {
    renderCardsQuerySelector(json, "shop-by-category-grid");

    if (settings.show_nav_promo) {
      const cardEl = createCardByTemplateId("template-promo-category-card");
      if (cardEl) {
        shopByCategoryGridEl.prepend(cardEl);
      }
    }
  });

  // list luxurious collection.
  luxurious.then((json) => {
    renderCardsQuerySelector(json, "luxurious-slider");
  });

  // list sustainable collection.
  sustainable.then((json) => {
    renderCardsQuerySelector(json, "sustainable-slider");
  });

  // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
  navBreadcrumbEl.classList.add("hidden");
  productListEl.classList.add("hidden");
  document.querySelector("#product-details").classList.add("hidden");

  // show content by removing the tailwind 'hidden' class ('display: none')
  document.querySelector("#hero-banner").classList.remove("hidden");
  document.querySelector("#homepage-content").classList.remove("hidden");
}

/**
 * Display products sections.
 *
 * @param {Object} response
 *    The JSON Products API response.
 */
function displayProductsSections(response) {
  // clear contents before populating
  productListEl.innerHTML = "";

  // load product listing
  response.forEach((item) => {
    createCard(item);
  });

  // get all the breadcrumbs and turn nodeList into an array
  const breadcrumbEls = [...navBreadcrumbEl.querySelectorAll(":scope li")];

  // show content by removing the tailwind 'hidden' class ('display: none')
  productListEl.classList.remove("hidden");
  // show all breadcrumbs (before hiding unwanted links)
  navBreadcrumbEl.classList.remove("hidden");
  breadcrumbEls.forEach((link) => link.classList.remove("hidden"));

  // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
  document.querySelector("#hero-banner").classList.add("hidden");
  document.querySelector("#homepage-content").classList.add("hidden");
  document.querySelector("#product-details").classList.add("hidden");

  // just hide last in breadcrumb in array
  breadcrumbEls[breadcrumbEls.length - 1].classList.add("hidden");
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
  // only fetch from api if it doesn't exist - to save limited api calls while testing
  if (!localStorage.getItem("GBPExchangeRates")) {
    const httpRequest = endpoints["exchange_rate"]["currency"];

    // ExchangeRate API
    fetch(httpRequest, options)
      .then((response) => response.json())
      .then((json) => {
        if (DEBUG) FS.info.api(httpRequest, json);

        exchangeRates = JSON.stringify(json);
        localStorage.setItem("GBPExchangeRates", exchangeRates);
      })
      .catch((err) => FS.error.exchange_rate(err));
  } else {
    exchangeRates = JSON.parse(localStorage.getItem("GBPExchangeRates"));
  }
}

/**
 * Fetches a given API endpoint.
 *
 * @param {String} queryString
 *    The query string of the request.
 * @return {Object}
 *    The parsed JSON object.
 */
function fetchApiEndpoint(endpoint, queryString = "") {
  const httpRequest = endpoint + queryString;

  return fetch(httpRequest, options)
    .then((response) => response.json())
    .then((json) => {
      if (DEBUG) FS.info.api(httpRequest, json);

      return json;
    })
    .catch((err) => FS.error.platzi(err));
}

/**
 * Fetches the Products API endpoint.
 *
 * @param {String} queryString
 *    The query string of the request.
 * @return {Object}
 *    The parsed JSON object.
 */
function fetchProductsEndpoint(queryString) {
  const httpRequest = endpoints["platzi"]["products"] + queryString;

  return fetch(httpRequest, options)
    .then((response) => response.json())
    .then((json) => {
      if (DEBUG) FS.info.api(httpRequest, json);

      return json;
    })
    .catch((err) => FS.error.platzi(err));
}

/**
 * Fetches the categories API endpoint and renders the HTML for the primary navigation.
 */
function populateNavPrimaryItems() {
  // clear existing list items
  navPrimaryItemsEl.innerHTML = "";

  // create category buttons from api
  const httpRequest = `${endpoints["platzi"]["categories"]}?limit=5`;
  fetch(httpRequest, options)
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
        const { label = "Promo", href = "#!" } = settings.promo;
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
 * @param {boolean} roundUp
 *    The flag to round the decimals up.
 * @returns {Number}
 *    The exchanged price.
 */
function convertPrice(price, roundUp = true) {
  const currencyExchangeRate = Number.parseFloat(
    exchangeRates.conversion_rates[selectedCurrencyCode]
  );

  const convertedPrice = (price * currencyExchangeRate).toFixed(2);

  return roundUp ? Math.ceil(convertedPrice) : convertedPrice;
}

/**
 * Updates all the prices, if there is any.
 */
function updatePrices() {
  document.querySelectorAll(".currency").forEach((currencyEl) => {
    currencyEl.textContent = currencies[selectedCurrencyCode].currencySign;
  });

  document.querySelectorAll(".price").forEach((priceEl) => {
    const productPrice = Number.parseFloat(priceEl.dataset.originalPrice);

    priceEl.textContent = convertPrice(productPrice);
  });
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
  newCardDiv.dataset.productId = item.id;
  newCardDiv.dataset.itemId = item.id;
  newCardDiv.dataset.itemAction = "details";

  newCardDiv.classList.add(
    "item-card",
    "product-card",
    "w-full",
    "m-1",
    "max-w-sm",
    "bg-white",
    "border",
    "border-gray-200",
    "rounded-lg",
    "shadow"
  );

  newCardDiv.innerHTML = `
    <a href="#">
        <img class="rounded-t-lg" src="${
          item.images[0]
        }" alt="picture of the item ${item.title}" />
    </a>
    <div class="p-5">
    <a href="#">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">${
      item.title
    }</h5>
    </a>
    <p class="mb-3 font-normal text-gray-700">${item.description}</p>
    <p class="mb-3 font-bold text-gray-900"><span class="currency">${
      currencies[selectedCurrencyCode].currencySign
    }</span><span class="price" data-original-price="${
    item.price
  }">${convertPrice(item.price)}</span></p>
    </div>
  `;

  productListEl.appendChild(newCardDiv);
}

/**
 * Renders the HTML of a product listing card.
 *
 * @param {Array[Object]} items
 *    The product list JSON object from the API.
 * @param {String} listingContainerId
 *    The id of the list of items container.
 */
function renderCardsQuerySelector(items, listingContainerId) {
  const containerEl = document.getElementById(listingContainerId);
  containerEl.innerHTML = "";

  items.forEach((item) => {
    const cardEl = createCardByTemplateId(
      `template-${listingContainerId}`,
      item
    );
    if (cardEl) {
      containerEl.appendChild(cardEl);
    }
  });
}

/**
 * Creates an HTML DOM element from a given template id.
 *
 * @param {String} templateId
 *    The template id.
 * @param {Object|null} data
 *    The data to populate.
 * @returns {Element}
 *    A new DOM element with the HTML from the template id
 *    and data from item.
 */
function createCardByTemplateId(templateId, data = null) {
  const cardEl = getElementByTemplateId(templateId);
  if (cardEl) {
    switch (templateId) {
      case "template-shop-bestsellers-grid":
        if (!data) break;

        cardEl.querySelector(".item-card").dataset.itemId = data.id;
        cardEl.querySelector(".item-card").dataset.itemAction = "details";
        cardEl.querySelector("img").setAttribute("src", data.images[0]);
        cardEl
          .querySelector("img")
          .setAttribute("alt", `The main picture of the item ${data.title}`);
        cardEl.querySelector(".title").textContent = data.title;
        cardEl.querySelector(".description").textContent = data.description;
        cardEl.querySelector(".currency").textContent =
          currencies[selectedCurrencyCode].currencySign;
        cardEl.querySelector(".price").textContent = convertPrice(data.price);
        cardEl.querySelector(".price").dataset.originalPrice = data.price;
        break;
      case "template-shop-by-category-grid":
        if (!data) break;

        cardEl.querySelector(".item-card").dataset.itemId = data.id;
        cardEl.querySelector(".item-card").dataset.itemAction = "category";
        cardEl.querySelector("img").setAttribute("src", data.image);
        cardEl
          .querySelector("img")
          .setAttribute("alt", `The picture of the item ${data.name}`);
        cardEl.querySelector(".title").textContent = data.name;
        break;
      case "template-luxurious-slider":
      case "template-sustainable-slider":
        if (!data) break;

        cardEl.querySelector(".slide").dataset.itemId = data.id;
        cardEl.querySelector(".title").textContent = data.title;
        cardEl.querySelector("img").setAttribute("src", data.images[0]);
        cardEl
          .querySelector("img")
          .setAttribute("alt", `The picture of the item ${data.title}`);
        cardEl.querySelector(".currency").textContent =
          currencies[selectedCurrencyCode].currencySign;
        cardEl.querySelector(".price").textContent = convertPrice(data.price);
        cardEl.querySelector(".price").dataset.originalPrice = data.price;
        // cardEl.querySelector(".description").textContent = data.description;
        break;
      default:
      // nop ...
    }
  }

  return cardEl;
}

/**
 * Gets DOM element by template id.
 *
 * @param {String} templateId
 *    The template id.
 * @returns {Element}
 *    The DOM element with the HTML from the template content.
 */
function getElementByTemplateId(templateId) {
  let domEl = null;

  if (!("content" in document.createElement("template"))) {
    throw Error("HTML Error: this browser does not support template tag.");
  }

  const template = document.getElementById(templateId);
  if (template) {
    domEl = template.content.cloneNode(true);
  } else {
    throw Error(`HTML Error: there was no template with id "${templateId}".`);
  }

  return domEl;
}

/**
 * Checks is the bounding rectangle of the given element
 * is currently positioned in the window or document viewport.
 *
 * @param {Element} element
 *    A DOM element to check is viewport.
 * @returns {boolean}
 *    Flag saying whether the element is in the current window viewport.
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

///
// Event handlers / actions.
///

/**
 * Routes to the homepage.
 * @param {Event} event
 *    The event object.
 */
function indexRoute(event) {
  event.preventDefault();
  switchPageTo("index");
}

/**
 * Simple search action.
 *
 * @param {Event} event
 *    The event object.
 */
function searchAction(event) {
  event.preventDefault();

  const searchText = navSearchInputEl.value.trim();
  navSearchInputEl.value = "";

  if (searchText) {
    const titleQuery = `?title=${searchText}`;
    switchPageTo("products", titleQuery);
  }
}

/**
 * Event handler for currency toggler.
 *
 * @param {Event} event
 *    The event object.
 */
function handleSelectedCurrency(event) {
  event.preventDefault();

  if (event.target.parentNode.closest("ul")) {
    let selectedEl = event.target.closest("li > a");
    if (selectedEl) {
      selectedCurrencyCode = selectedEl.dataset.currencyCode;
      localStorage.setItem("selectedCurrencyCode", selectedCurrencyCode);

      // Fire currency events.
      renderSelectedCurrency(selectedCurrencyCode);
      renderCurrencies();
      updatePrices();
    }
  }
}

/**
 * Handles the breadcrumb trails routing.
 *
 * @param {Event} event
 *    The event object.
 */
function breadcrumbTrailActionHandler(event) {
  event.preventDefault();

  if (event.target.matches("a")) {
    switchPageTo(event.target.dataset.pageName);
  }
}

/**
 * Navigation primary items hadler.
 *
 * It handles the routing depending on the attached action to the item.
 *
 * @param {Event} event
 *    The event object.
 */
function navPrimaryItemsHandler(event) {
  if (event.target.matches("a:not(.promo-link)")) {
    event.preventDefault();

    const categoryQuery = `?categoryId=${event.target.dataset.categoryId}`;
    switchPageTo("products", categoryQuery);
  } else if (event.target.matches("a.promo-link")) {
    switchPageTo("index");
  }
}

/**
 * Event handler for item cards.
 *
 * It handles the routing of the card container depending on its type.
 *
 * @param {Event} event
 *    The event object.
 */
function bindItemCard(event) {
  event.preventDefault();

  const itemCard = event.target.closest(".item-card");
  if (itemCard) {
    const pageName = itemCard.dataset.itemAction;
    const action = itemCard.dataset.itemId;
    switchPageTo(pageName, action);
  }
}

/**
 * Event handler for CTA buttons.
 *
 * It handles the routing depending on the action of the button.
 *
 * @param {Event} event
 *    The event object.
 */
function handleCTAButton(event) {
  event.preventDefault();

  const action = event.target.dataset.ctaAction;
  if (action) {
    switchPageTo("category", action);
  }
}

/**
 * Scroll handler that controls the display of the To top button.
 */
function scroll2TopBtnDisplayHandler() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    back2TopBtn.style.display = "block";
  } else {
    back2TopBtn.style.display = "none";
  }

  if (window.scrollY > docMainEl.scrollHeight) {
    back2TopBtn.classList.add("bottom-20");
  } else {
    back2TopBtn.classList.remove("bottom-20");
  }
}

/**
 * Handles the scroll to top action in the current window.
 *
 * @param {Event} event
 *    The event object.
 */
function scroll2TopActionHandler(event) {
  event.preventDefault();

  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

/**
 * Handles the carousel back/next animation of the slides.
 *
 * @param {Event} event
 *    The event object.
 */
function carouselMultiSlideHandler(event) {
  event.preventDefault();
  const slideBtn = event.target.closest("button");
  const carouselMultiCtn = event.target.closest(".carousel-multi-items");
  if (slideBtn.classList.contains("backward")) {
    goPrevSlideAction(carouselMultiCtn);
  } else if (slideBtn.classList.contains("forward")) {
    goNextSlideAction(carouselMultiCtn);
  }
}

/**
 * The default offsets of the carousels slider.
 *
 * @type {{ luxurious-collection: integer, sustainable-collection: integer }}
 */
const defaultTransforms = Array.from(carouselMultiCtns).reduce(
  (object, ctnEl) => Object.assign(object, { [ctnEl.id]: 0 }),
  {}
);

/**
 * The offset in pixels used to move to prev/next the slides.
 * @type integer
 */
const defaultTransformOffset = 620;

/**
 *  Action to go to the next slide in the given multi carousel component.
 *
 * @param {Element} ctn
 *    The DOM element of the multi carousel component.
 */
function goNextSlideAction(ctn) {
  // Get the last transform.
  let defaultTransform = defaultTransforms[ctn.id];

  defaultTransform = defaultTransform - defaultTransformOffset;
  const slider = ctn.querySelector(".slider");
  if (Math.abs(defaultTransform) >= slider.scrollWidth / 1.7)
    defaultTransform = 0;
  slider.style.transform = "translateX(" + defaultTransform + "px)";

  // Update transform with the new value.
  defaultTransforms[ctn.id] = defaultTransform;
}

/**
 *  Action to go to the previous slide in the given multi carousel component.
 *
 * @param {Element} ctn
 *    The DOM element of the multi carousel component.
 */
function goPrevSlideAction(ctn) {
  // Get the last transform.
  let defaultTransform = defaultTransforms[ctn.id];

  const slider = ctn.querySelector(".slider");
  if (Math.abs(defaultTransform) === 0) defaultTransform = 0;
  else defaultTransform = defaultTransform + defaultTransformOffset;
  slider.style.transform = "translateX(" + defaultTransform + "px)";

  // Update transform with the new value.
  defaultTransforms[ctn.id] = defaultTransform;
}

// -------------------- PUBLIC API --------------------------

/**
 * Initialise the configuration settings.
 *
 * @param {debug: boolean, show_nav_promo: boolean, promo: Object} settings
 */
function init({ debug, show_nav_promo, promo }) {
  DEBUG = settings.debug = debug || false;
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
 * Executes the main.
 */
function run() {
  try {
    // Cache the API exchange rates.
    storeGBPExchangeRates();

    // Currency switcher stuff.
    renderSelectedCurrency(selectedCurrencyCode);
    renderCurrencies();

    // Primary navigation links.
    // add categories dynamically to main nav, from api
    populateNavPrimaryItems();

    // Routing to the current page content.
    switchPageTo(currentPageName);

    // EVENT LISTENERS ------------------------------------------------------------ //

    // Navigation logo.
    navLogoEl.addEventListener("click", indexRoute);

    // Product categories links.
    navPrimaryItemsEl.addEventListener("click", navPrimaryItemsHandler);

    // Search box.
    navSearchFormEl.addEventListener("submit", searchAction);
    navSearchButtonEl.addEventListener("click", searchAction);

    // Currency dropdown.
    currencyDropdownEl.addEventListener("click", handleSelectedCurrency);

    // Breadcrumbs trails.
    navBreadcrumbEl.addEventListener("click", breadcrumbTrailActionHandler);

    // Item cards.
    productListEl.addEventListener("click", bindItemCard);
    bestsellersGridEl.addEventListener("click", bindItemCard);
    shopByCategoryGridEl.addEventListener("click", bindItemCard);

    // CTA buttons.
    heroPromoCtaBtn.addEventListener("click", handleCTAButton);
    featuredCollectionBtn.addEventListener("click", handleCTAButton);

    // Multi carousels.
    carouselMultiSlideBtns.forEach((slideBtn) => {
      slideBtn.addEventListener("click", carouselMultiSlideHandler);
    });

    // Adding multi carousel Navigation with keyboards ArrowLeft and ArrowRight.
    document.addEventListener("keydown", function (event) {
      carouselMultiCtns.forEach((ctnEl) => {
        if (isInViewport(ctnEl)) {
          switch (event.key) {
            case "ArrowLeft":
              event.preventDefault();
              goPrevSlideAction(ctnEl);
              break;
            case "ArrowRight":
              event.preventDefault();
              goNextSlideAction(ctnEl);
              break;
          }
        }
      });
    });

    // Back to top button.
    // When the user scrolls down 20px from the top of the document, show the button
    window.onscroll = scroll2TopBtnDisplayHandler;
    // When the user clicks on the button, scroll to the top of the document
    back2TopBtn.addEventListener("click", scroll2TopActionHandler);
  } catch (error) {
    console.error(error);
  }
}

export { DEBUG, init, getSettings, run };
