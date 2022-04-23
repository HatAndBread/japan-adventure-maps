import { debounce } from 'lodash';

export const navbar = () => {
  const navLinks = document.querySelector('.nav-links') as HTMLDivElement;
  const hamburger = document.querySelector('.hamburger');
  let navAway = true;
  const setNavIn = () => {
    navAway = false;
    navLinks.style.top = '37px';
  };
  const setNavAway = () => {
    navAway = true;
    navLinks.style.top = '-100vh';
  };
  const setNav = () => {
    if (navAway) {
      setNavIn();
      return;
    }
    setNavAway();
  };
  const handleResize = (e: Event) => {
    if (window.innerWidth >= 700) {
      setNavAway();
    }
  };
  document.addEventListener('click', (e) => {
    // @ts-ignore
    if (!e.target.classList) return setNavAway();
    // @ts-ignore
    const classList = Array.from(e.target.classList);
    if (!classList.length) return setNavAway();
    // @ts-ignore
    if (!navAway && !['hamburger', 'slice'].includes(classList[0])) setNavAway();
  });
  hamburger.addEventListener('click', setNav);
  window.addEventListener('resize', handleResize);
};
