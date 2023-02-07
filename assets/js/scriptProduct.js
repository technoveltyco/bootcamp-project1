
let requestctn = document.querySelector("#test",)

fetch(`https://api.escuelajs.co/api/v1/products/`)
    .then(response => response.json())
    .then(response => {

    
        requestctn = response[0].category.image;
      console.log("Platzi - HTTP JSON response:", response);
      
     })
    .catch(err => console.error(err));

let tag = document.createElement("img");
tag.HTMLImageElement = requestctn;
document.querySelector(".img").appendChild(tag);