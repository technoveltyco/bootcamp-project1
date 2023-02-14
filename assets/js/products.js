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
const navBreadcrumbEl = document.querySelector("#nav-breadcrumb");
const sortSelectorEl = document.querySelector("#sortSelector");

// OBJECTS --------------------------------------------------------- //
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

const nav = {
  home: {
    show: `[data-page-name="index"], #hero-banner, #homepage-content`,
    hide: `[data-page-name="products"], [data-page-name="details"], #product-list, #product-details, #searchRefiner`,
  },
  products: {
    show: `[data-page-name="index"], [data-page-name="products"], #product-list, #searchRefiner`,
    hide: `[data-page-name="details"], #product-details, #hero-banner, #homepage-content`,
  },
  details: {
    show: `[data-page-name="index"], [data-page-name="products"], [data-page-name="details"], #product-details`,
    hide: `#product-list, #hero-banner, #homepage-content, #searchRefiner`,
  },
  goto(name) {
    document
      .querySelectorAll(this[name].show)
      .forEach((element) => element.classList.remove("hidden"));
    document
      .querySelectorAll(this[name].hide)
      .forEach((element) => element.classList.add("hidden"));
  },
};

const filters = {
  none: (product) => product,
  price: (min, max) => {
    return (product) => product.price >= min && product.price <= max;
  },
  category: (id) => {
    return (product) => product.category.id === id;
  },
  title: (searchText) => {
    return (product) =>
      product.title.toLowerCase().includes(searchText.toLowerCase());
  },
};

const comparators = {
  none: (product) => product,
  priceAsc: (productA, productB) => productA.price - productB.price,
  priceDesc: (productA, productB) => productB.price - productA.price,
};

const products = {
  actual: [],
  get(aFilter, aSort) {
    return this.actual.filter(aFilter).sort(aSort);
  },
  async load(endpoint) {
    const queryString = "?offset=0&limit=500";
    try {
      const response = await fetch(endpoint + queryString, options);
      const products = await response.json();
      this.actual = products;

      console.log(endpoint + queryString);
      console.log(products);
    } catch (err) {
      return console.error(err);
    }
  },
};

products.load(endpoints["platzi"]["products"]);

let exchangeRates;
storeGBPExchangeRates();

// add categories dynamically to main nav, from api
populateNavPrimaryItems();

let selectedCurrencyCode =
  localStorage.getItem("selectedCurrencyCode") || "GBP";
renderSelectedCurrency(selectedCurrencyCode);
renderCurrencies();

// let currentPageName = "index";
nav.goto("home");

// FUNCTIONS ------------------------------------------------------- //

function displayProductDetails(productID) {
  // TODO: implement product details here
  document.querySelector("#temp-product-id").textContent = productID;
}

// function switchPageTo(pageName) {
//   // get all the breadcrumbs and turn nodeList into an array
//   const breadcrumbEls = [...navBreadcrumbEl.querySelectorAll(":scope li")];

//   currentPageName = pageName;

//   if (pageName === "index") {
//     // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
//     productListEl.classList.add("hidden");
//     document.querySelector("#product-details").classList.add("hidden");

//     const linksToHide = breadcrumbEls.filter(
//       (link) => link.dataset.pageName !== pageName
//     );
//     linksToHide.forEach((link) => link.classList.add("hidden"));

//     // show content by removing the tailwind 'hidden' class ('display: none')
//     document.querySelector("#hero-banner").classList.remove("hidden");
//     document.querySelector("#homepage-content").classList.remove("hidden");
//   }

//   if (pageName === "products") {
//     // show content by removing the tailwind 'hidden' class ('display: none')
//     productListEl.classList.remove("hidden");
//     // show all breadcrumbs (before hiding unwanted links)
//     breadcrumbEls.forEach((link) => link.classList.remove("hidden"));

//     // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
//     document.querySelector("#hero-banner").classList.add("hidden");
//     document.querySelector("#homepage-content").classList.add("hidden");
//     document.querySelector("#product-details").classList.add("hidden");

//     // just hide last in breadcrumb in array
//     breadcrumbEls[breadcrumbEls.length - 1].classList.add("hidden");
//   }

//   if (pageName === "details") {
//     // hide unwanted content by adding the tailwind 'hidden' class ('display: none')
//     productListEl.classList.add("hidden");
//     document.querySelector("#hero-banner").classList.add("hidden");
//     document.querySelector("#homepage-content").classList.add("hidden");

//     // show all breadcrumbs
//     breadcrumbEls.forEach((link) => link.classList.remove("hidden"));

//     // show content by removing the tailwind 'hidden' class ('display: none')
//     document.querySelector("#product-details").classList.remove("hidden");
//   }
// }

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
    // DEV: for products page testing, add the tailwind 'hidden' class ('display: none')
    // TODO: Hides Hero banner - Refactor later
    .then(() => {
      document.querySelector("#hero-banner").classList.add("hidden");
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
  const currencyExchangeRate = Number.parseFloat(
    exchangeRates.conversion_rates[selectedCurrencyCode]
  );
  return (price * currencyExchangeRate).toFixed(2);
}

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

  // productListEl.appendChild(newCardDiv);
  return newCardDiv;
}

function renderProducts(productResults) {
  // clear contents of render target before populating
  productListEl.innerHTML = "";

  productResults.forEach((product) => {
    productListEl.appendChild(createCard(product));
  });
}

// function createSortSelector() {
//   return `
//     <select id="sortSelector"
//       class="mb-3 xl:w-96 form-select form-select-lg m-0 mb-3 block w-full appearance-none rounded border border-solid border-gray-300 bg-white bg-clip-padding bg-no-repeat px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
//       aria-label=".form-select-lg example"
//     >
//       <option value="none" selected>None</option>
//       <option value="priceAsc">Price Ascending</option>
//       <option value="priceDesc">Price Descending</option>
//     </select>
//   `;
// }

// document.querySelector("#searchRefiner").innerHTML = createSortSelector();
// EVENT LISTENERS ------------------------------------------------------------ //

navPrimaryItemsEl.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.matches("a")) {
    const categoryId = Number(event.target.dataset.categoryId);
    const productResults = products.get(
      filters.category(categoryId),
      comparators.none
    );
    renderProducts(productResults);
  }

  nav.goto("products");
});

// navPrimaryItemsEl.addEventListener("click", (event) => {
//   event.preventDefault();

//   if (event.target.matches("a")) {
//     const categoryQuery = `?categoryId=${event.target.dataset.categoryId}`;
//     fetchProductsEndpoint(categoryQuery);
//   }

//   nav.goto("products");
// });

navSearchButtonEl.addEventListener("click", (event) => {
  event.preventDefault();

  const searchText = navSearchInputEl.value.trim();

  if (searchText) {
    const productResults = products.get(
      filters.title(searchText),
      comparators.none
    );
    renderProducts(productResults);
  }

  nav.goto("products");
});
// navSearchButtonEl.addEventListener("click", (event) => {
//   event.preventDefault();

//   const searchText = navSearchInputEl.value.trim();

//   if (searchText) {
//     const titleQuery = `?title=${searchText}`;
//     fetchProductsEndpoint(titleQuery);
//   }

//   nav.goto("products");
// });

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

navBreadcrumbEl.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.matches("li")) {
    nav.goto(event.target.dataset.pageName);
  }
});

productListEl.addEventListener("click", (event) => {
  event.preventDefault();

  const productCard = event.target.closest(".product-card");
  if (productCard) {
    displayProductDetails(productCard.dataset.productID);
    nav.goto("details");
  }
});

sortSelectorEl.addEventListener("change", (event) => {
  event.preventDefault();

  const comparatorName = event.target.value;
  const productResults = products.get(
    filters.none,
    comparators[comparatorName]
  );
  renderProducts(productResults);
});

