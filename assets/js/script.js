const ctn1 = document.querySelector("#api1");
const ctn2 = document.querySelector("#api2");
const ctn3 = document.querySelector("#api3");

const url1 = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
fetch(url1)
.then(response => response.json())
.then(json => {
    ctn1.textContent = JSON.stringify(json);
    console.log(json)
});

const url2 = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY";
fetch(url2)
.then(response => response.json())
.then(json => {
    console.log(json.photos);

    for (let i = 0; i < json.photos.length; i++) {
        const photo = json.photos[i];

        const ctn = document.createElement("div");
        const img = document.createElement("img");
        img.setAttribute("src", photo.img_src);
        img.setAttribute("alt", photo.camera.full_name);

        ctn.appendChild(img);

        ctn2.appendChild(ctn);
        
    }
});

const url3 = "https://api.nasa.gov/DONKI/CME?startDate=2022-01-01&endDate=2022-01-31&api_key=DEMO_KEY";
fetch(url3)
.then(response => response.json())
.then(json => {
    ctn3.textContent = JSON.stringify(json);
    console.log(json)
});