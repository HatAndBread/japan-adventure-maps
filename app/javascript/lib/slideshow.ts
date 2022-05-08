const slideshow = () => {
  const data = document.getElementsByClassName("slideshow");
  if (!data.length) return;

  const slideshows = Array.from(data) as unknown as HTMLDivElement[];
  slideshows.forEach((slideshow) => {
    const image = slideshow.children[0] as HTMLDivElement;
    let imageNumber = 0;
    const urls = JSON.parse(slideshow.dataset.urls);
    if (!urls.length) return;


    image.style.backgroundSize = "cover";
    image.style.backgroundRepeat = "no-repeat";
    image.style.backgroundPositionY = "center";
    image.style.backgroundPositionX = "center";
    const setImage = () => {
      if (imageNumber >= urls.length) imageNumber = 0;
      if (imageNumber < 0) imageNumber = urls.length - 1;
      image.style.backgroundImage = `url(${urls[imageNumber]})`;
    };
    setImage();
    Array.from(image.children).forEach((child, i)=>{
      child.addEventListener("click", ()=>{
        if (!i){
            imageNumber -= 1;
        } else {
            imageNumber += 1;
        }
        setImage();
      })
    })
  });
};

export { slideshow };
