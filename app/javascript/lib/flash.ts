const flash = (message: string, type: 'warn' | 'success' | 'error') => {
  const getColor = () => {
    switch (type) {
      case "success":
        return {backgroundColor: '#d4edda', color: 'darkgreen' };
      case "error":
        return {backgroundColor: '#f8d7da', color: 'darkred'};
      case "warn":
        return {backgroundColor: '#f8d7da', color: 'darkred'};
      default:
        return {backgroundColor: '#d4edda', color: 'darkgreen' };
    }
  }
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.innerText = message;
  const {backgroundColor, color} = getColor(); 
  div.style.backgroundColor = backgroundColor;
  div.style.color = color;
  div.style.zIndex = '99999';
  div.style.position = 'fixed';
  div.style.top = '-100px';
  div.style.padding = '8px';
  div.style.borderRadius = '8px';
  div.style.left = `${(window.innerWidth / 2) - (div.offsetWidth / 2)}px`;
  div.style.transition = '0.3s';
  div.style.top = '50px';
  setTimeout(()=>{
    div.style.top = '-100px';
    setTimeout(()=>{
      div.remove();
    }, 3000);
  }, 3000);
}

export {flash};
