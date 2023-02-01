const ctn1 = document.querySelector("#store");
const ctn2 = document.querySelector("#fake");
const ctn3 = document.querySelector("#currency");

let options = {
	method: 'GET',
	headers: { }
};

// Platzi Fake Store API
fetch('https://api.escuelajs.co/api/v1/products/?price_min=100&price_max=1000&offset=10&limit=1', options)
	.then(response => response.json())
	.then(response => {
        console.log(response);
        ctn1.textContent = JSON.stringify(response);
    })
	.catch(err => console.error(err));

// Faker API
fetch('https://fakerapi.it/api/v1/credit_cards?_quantity=1', options)
	.then(response => response.json())
	.then(response => {
        console.log(response);
        ctn2.textContent = JSON.stringify(response);
    })
	.catch(err => console.error(err));

// ExchangeRate API
fetch('https://v6.exchangerate-api.com/v6/ae007f997716ef4e399f00af/latest/GBP', options)
	.then(response => response.json())
	.then(response => {
        console.log(response);
        ctn3.textContent = JSON.stringify(response);
    })
	.catch(err => console.error(err));
