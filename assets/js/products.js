// JavaScript of Product listing page.
const mainPageContentEl = document.querySelector('#main-page-content')
const productListEl = document.querySelector('#product-list')
const navSearchInputEl = document.querySelector('#nav-search-input')
const navSearchButtonEl = document.querySelector('#nav-search-button')
const navPrimaryItemsEl = document.querySelector('#nav-primary-items')
const currencyDropdownEl = document.querySelector('#currency-dropdown')

const endpoints = {
  platzi: {
    products: 'https://api.escuelajs.co/api/v1/products/',
    categories: 'https://api.escuelajs.co/api/v1/categories?limit=5',
  },
  faker: {
    credit_cards: 'https://fakerapi.it/api/v1/credit_cards?_quantity=1',
  },
  exchange_rate: {
    currency:
      'https://v6.exchangerate-api.com/v6/dc9edcf7a653563d44d04acc/latest/GBP',
  },
}

// Request HTTP Method and Headers
let options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}

let exchangeRates
storeGBPExchangeRates()

// DEV: for products page testing, add the tailwind 'hidden' class ('display: none')
document.querySelector('#hero-banner').classList.add('hidden')

// add categories dynamically to main nav, from api
populateNavPrimaryItems()

// FUNCTIONS ------------------------------------------------------- //

function storeGBPExchangeRates() {
  // only fetch from api if it doesn't exsist - to save limited api calls while testing
  if (!localStorage.getItem('GBPExchangeRates')) {
    alert('ExchangeRate API Call')
    // ExchangeRate API
    fetch(endpoints['exchange_rate']['currency'], options)
      .then((response) => response.json())
      .then((response) => {
        console.log(response)

        exchangeRates = JSON.stringify(response)
        localStorage.setItem('GBPExchangeRates', exchangeRates)
      })
      .catch((err) => console.error(err))
  } else {
    exchangeRates = JSON.parse(localStorage.getItem('GBPExchangeRates'))
  }
}

function fetchProductsEndpoint(queryString) {
  fetch(endpoints['platzi']['products'] + queryString, options)
    .then((response) => response.json())
    .then((response) => {
      console.log(response)

      // clear contents before populating
      productListEl.innerHTML = ''

      response.forEach((item) => {
        createCard(item)
      })
    })
    .catch((err) => console.error(err))
}

function populateNavPrimaryItems() {
  // clear existing list items
  navPrimaryItemsEl.innerHTML = ''

  // create category buttons from api
  fetch(endpoints['platzi']['categories'], options)
    .then((response) => response.json())
    .then((response) => {
      response.forEach((category) => {
        const newListItemEl = document.createElement('li')
        newListItemEl.classList.add('nav-item')

        newListItemEl.innerHTML = `
          <a
            class="nav-link block py-2 pr-2 text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 focus:text-gray-700 lg:px-2"
            href="#!" data-category-id="${category.id}"
            >${category.name}</a
          >
        `
        navPrimaryItemsEl.appendChild(newListItemEl)
      })
    })
    .catch((err) => console.error(err))
}

function createCard(item) {
  const newCardDiv = document.createElement('div')

  newCardDiv.classList.add(
    'w-full',
    'm-1',
    'max-w-sm',
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'shadow',
    'dark:bg-gray-800',
    'dark:border-gray-700'
  )

  newCardDiv.innerHTML = `
    <a href="#">
        <img class="rounded-t-lg" src="${item.images[0]}" alt="" />
    </a>
    <div class="p-5">
    <a href="#">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${item.title}</h5>
    </a>
    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${item.description}</p>
    <p class="mb-3 font-bold text-gray-900">£${item.price}</p>
    </div>
  `

  productListEl.appendChild(newCardDiv)
}

// EVENT LISTNERS ------------------------------------------------------------ //

navPrimaryItemsEl.addEventListener('click', (event) => {
  event.preventDefault()

  if (event.target.matches('a')) {
    const categoryQuery = `?categoryId=${event.target.dataset.categoryId}`
    fetchProductsEndpoint(categoryQuery)
  }
})

navSearchButtonEl.addEventListener('click', (event) => {
  const searchText = navSearchInputEl.value.trim()

  if (searchText) {
    const titleQuery = `?title=${searchText}`
    fetchProductsEndpoint(titleQuery)
  }
})

currencyDropdownEl.addEventListener('click', (event) => {
  // const desiredCurrency = currencyDropdownEl.querySelector(':scope > li')
  const desiredCurrency = event.target.parentNode.querySelector(':scope > a')

  // // DEV: test exchangeRates
  // console.log(exchangeRates)

  if (event.target.parentNode.closest('ul')) {
    alert(desiredCurrency.dataset.countryName)
    console.log(event.target.parentNode)
  }
})

