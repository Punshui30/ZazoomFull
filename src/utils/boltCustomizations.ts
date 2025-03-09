export function initBoltCustomizations() {
  // Remove unwanted elements and update domain references
  const removeElements = () => {
    const chatIcon = document.querySelector('[data-testid="chat-icon"]');
    const profileIcon = document.querySelector('[data-testid="profile-icon"]');
    const oldDomainLinks = document.querySelectorAll('a[href*="zazoom.netlify.app"]');

    if (chatIcon) chatIcon.remove();
    if (profileIcon) profileIcon.remove();
    
    // Update domain in links if needed
    oldDomainLinks.forEach(link => {
      const href = link.getAttribute('href') || '/';
      link.setAttribute('href', href);
    });
  };

  // Initialize Konami code
  let konamiSequence: string[] = [];
  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  document.addEventListener('keydown', (e) => {
    konamiSequence.push(e.key);
    if (konamiSequence.length > KONAMI_CODE.length) {
      konamiSequence.shift();
    }
    
    if (konamiSequence.join(',') === KONAMI_CODE.join(',')) {
      window.location.href = '/admin/login';
      konamiSequence = [];
    }
  });

  // Copyright click handler
  let clickCount = 0;
  let lastClickTime = 0;
  const CLICK_TIMEOUT = 2000; // 2 seconds
  const REQUIRED_CLICKS = 6;

  const copyrightElement = document.querySelector('.copyright');
  if (copyrightElement) {
    copyrightElement.addEventListener('click', (e) => {
      const currentTime = Date.now();
      
      if (currentTime - lastClickTime > CLICK_TIMEOUT) {
        clickCount = 1;
      } else {
        clickCount++;
      }
      
      lastClickTime = currentTime;

      if (clickCount === REQUIRED_CLICKS) {
        window.location.href = '/admin/login';
        clickCount = 0;
      }
    });
  }

  // Run immediately and observe for changes
  const observer = new MutationObserver(removeElements);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  removeElements();
}

// Auto-initialize when imported
initBoltCustomizations();