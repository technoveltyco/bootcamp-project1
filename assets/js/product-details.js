
const thumbImgEl = document.querySelector("#thumbImg");
const mainImgEl = document.querySelector("#mainImg");
const specProdDetailEl = document.querySelector("#specProd")


    
fetch(`https://api.escuelajs.co/api/v1/products/`)
    .then(response => response.json())
    .then(data => {

        console.log(data)
        console.log(data[0].images.length)
        

        createThumbnails(data)
        createSpec(data[0])

    })

  

    function createThumbnails(data){

        const newThumb = document.createElement('div');
        newThumb.innerHTML= `
        <div class="row">
        <a href="#"> 
        <img src="${data[0].category.image}" alt="" style="width:100%" > 
        </a>
        </div>`;
        thumbImgEl.appendChild(newThumb);


        const newImg = document.createElement('div');
        newImg.innerHTML= `<a href="#"> <img src="${data[0].category.image}" alt="" style="width:100%"> </a>`;
        mainImgEl.appendChild(newImg);


        for (let i = 0; i < data[0].images.length; i++) {

            mainThumbnail(data[0].images[i])
            mainImg(data[0].images[i])

        }

        


    }

    function mainThumbnail(data){
        const newThumb = document.createElement('div');
        newThumb.innerHTML= `
        <div class="row">
        <a href="#"> 
        <img src="${data}" alt="" style="width:100%" > 
        </a>
        </div>`;
        thumbImgEl.appendChild(newThumb);
    }

    function mainImg(data){
      const newImg = document.createElement('div');
      newImg.innerHTML= `
      <div class="row">
      <a href="#"> 
      <img src="${data}" alt="" style="width:100%" > 
      </a>
      </div>`;
      mainImgEl.appendChild(newImg);
  }




    function createSpec(data){
        const newSpecDetail = document.createElement('div')


        console.log(data.price)
        newSpecDetail.innerHTML = `
        
        <div class="p-5">
        <a href="#">
        <h1 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${data.title}</h1>
        </a>
        <p class="mb-3 font-bold text-red-900" style="font-size: 2.5em ">£${data.price}</p>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${data.description}</p>

        <a href="#">
        Size
        </a></div>
        <button class="add-to-bag" style="width:70%"> Add to bag </button>
        `
        specProdDetailEl.appendChild(newSpecDetail)
    }
            
     

