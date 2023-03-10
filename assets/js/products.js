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
// filters and sorting
const sortSelectorEl = document.querySelector("#sortSelector");
const priceFilterEl = document.querySelector("#priceFilter");
const loadMoreEl = document.querySelector("#load-more");
const searchRefinerEls = document.querySelectorAll("#searchRefiner select");

// OBJECTS --------------------------------------------------------- //
const endpoints = {
  platzi: {
    products: "https://api.escuelajs.co/api/v1/products/",
    categories: "https://api.escuelajs.co/api/v1/categories?offset=0&limit=5",
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
    hide: `[data-page-name="products"], [data-page-name="details"], #product-list, #product-details, #searchRefiner, #load-more`,
  },
  products: {
    show: `[data-page-name="index"], [data-page-name="products"], #product-list, #searchRefiner, #load-more`,
    hide: `[data-page-name="details"], #product-details, #hero-banner, #homepage-content`,
  },
  details: {
    show: `[data-page-name="index"], [data-page-name="products"], [data-page-name="details"], #product-details`,
    hide: `#product-list, #hero-banner, #homepage-content, #searchRefiner, #load-more`,
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
  id: (id) => {
    return (product) => product.id === id;
  },
  price: (min, max) => {
    return (product) =>
      convertPrice(product.price) >= min && convertPrice(product.price) <= max;
  },
  category: (id) => {
    return (product) => product.category.id === id;
  },
  title: (searchText) => {
    return (product) =>
      product.title.toLowerCase().includes(searchText.toLowerCase());
  },
};

const sorters = {
  none: (product) => product,
  priceAsc: (productA, productB) => productA.price - productB.price,
  priceDesc: (productA, productB) => productB.price - productA.price,
};

const products = {
  actual: [],
  get(aFilterArr) {
    let results = this.actual;

    aFilterArr.forEach((aFilter) => {
      results = results.filter(aFilter);
    });

    return results;
  },
  async load(endpoint) {
    const queryString = "?offset=0&limit=500";
    try {
      const response = await fetch(endpoint + queryString, options);
      const products = await response.json();
      this.actual = await products;
    } catch (err) {
      return console.error(err);
    }
  },
};

products.load(endpoints["platzi"]["products"]);

// global variables ------------------------------------------ //
let productGenerator;
let exchangeRates;

storeGBPExchangeRates();

// add categories dynamically to main nav, from api
populateNavPrimaryItems();

let selectedCurrencyCode =
  localStorage.getItem("selectedCurrencyCode") || "GBP";
renderSelectedCurrency(selectedCurrencyCode);
renderCurrencies();

nav.goto("home");

// FUNCTIONS ------------------------------------------------------- //

function getFiltersFromUI() {
  const searchText = navSearchInputEl.value.trim();
  const navCategoryId = Number(navPrimaryItemsEl.dataset.selectedCategoryId);

  const priceFilter = priceFilterEl.value;

  const productFilters = [];
  if (searchText && navCategoryId === 0) {
    productFilters.push(filters.title(searchText));
  }
  if (navCategoryId !== 0) {
    // alert("navFilter");
    productFilters.push(filters.category(navCategoryId));
  }
  if (priceFilter !== "none") {
    const filterArgs = JSON.parse(priceFilter);
    productFilters.push(filters.price(filterArgs.min, filterArgs.max));
  }

  return productFilters;
}

function refreshProducts() {
  const productFilters = getFiltersFromUI();
  const sortSelector = sortSelectorEl.value;

  const filteredProducts = products.get(productFilters);

  if (sortSelector !== "none") {
    filteredProducts.sort(sorters[sortSelector]);
  }

  const productsPerPage = 9;
  productGenerator = generator(filteredProducts, productsPerPage);

  const next = productGenerator.next();

  // clear contents of render target before populating
  productListEl.innerHTML = "";

  if (!next.done) {
    renderProducts(next.value);
  }
}

function* generator(products, limit) {
  const pageNums = Array(Math.ceil(products.length / limit))
    .fill(limit)
    .map((x, y) => x * y);

  enableButtonEl(loadMoreEl);

  for (const pageNum of pageNums) {
    if (pageNums[pageNums.length - 1] === pageNum) {
      disableButtonEl(loadMoreEl);
    }
    yield products.slice(pageNum, pageNum + limit);
  }
}

function disableButtonEl(element) {
  element.disabled = true;
  element.classList.add("pointer-events-none", "opacity-60");
}

function enableButtonEl(element) {
  element.disabled = false;
  element.classList.remove("pointer-events-none", "opacity-60");
}

function displayProductDetails(productID) {
  // TODO: implement product details here
  document.querySelector("#temp-product-id").textContent = productID;

  const [productResult] = products.get([filters.id(productID)]);
  document.querySelector("#temp-product-id").textContent +=
    JSON.stringify(productResult);
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
    "cursor-pointer",
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

  return newCardDiv;
}

function renderProducts(productResults) {
  productResults.forEach((product) => {
    productListEl.appendChild(createCard(product));
  });
}

function navPrimaryItemsReset() {
  navPrimaryItemsEl.childNodes.forEach((listItem) =>
    listItem.classList.remove("font-bold")
  );
  navPrimaryItemsEl.dataset.selectedCategoryId = 0;
}

function resetSearchRefiners() {
  searchRefinerEls.forEach((element) => (element.value = "none"));
}

// EVENT LISTENERS ------------------------------------------------------------ //

navPrimaryItemsEl.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.matches("a")) {
    const categoryId = Number(event.target.dataset.categoryId);

    navSearchInputEl.value = "";

    navPrimaryItemsEl.dataset.selectedCategoryId = categoryId;

    event.target.parentNode.classList.add("font-bold");

    navPrimaryItemsReset();
    resetSearchRefiners();
    refreshProducts();
  }

  nav.goto("products");
});

navSearchInputEl.addEventListener("keypress", (event) => {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    event.preventDefault();
    // Trigger the button element with a click
    navSearchButtonEl.click();
  }
});

navSearchButtonEl.addEventListener("click", (event) => {
  event.preventDefault();

  const searchText = navSearchInputEl.value.trim();

  navPrimaryItemsReset();
  resetSearchRefiners();
  refreshProducts();

  nav.goto("products");
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

      refreshProducts();
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
    const productID = Number(productCard.dataset.productID);
    displayProductDetails(productID);
    nav.goto("details");
  }
});

sortSelectorEl.addEventListener("change", (event) => {
  event.preventDefault();

  refreshProducts();
});

priceFilterEl.addEventListener("change", (event) => {
  event.preventDefault();

  refreshProducts();
});

loadMoreEl.addEventListener("click", (event) => {
  event.preventDefault();

  const thisButton = event.target;
  const next = productGenerator.next();

  if (!next.done) {
    renderProducts(next.value);
  }
});

