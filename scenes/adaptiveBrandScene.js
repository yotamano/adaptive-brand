export async function setup(root) {
  // Ensure the root wrapper itself fills the viewport (other scenes add their own wrapper div)
  root.style.position = 'absolute';
  root.style.left = '0';
  root.style.top = '0';
  root.style.width = '100vw';
  root.style.height = '100vh';

  // Create an iframe that fills the scene wrapper and loads the AdaptiveBrand index
  const iframe = document.createElement('iframe');
  iframe.src = 'AdaptiveBrand/index.html';
  iframe.style.position = 'absolute';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.background = '#000';
  iframe.allowFullscreen = true;
  // Forward key events from the iframe to the parent document so global shortcuts keep working
  const keyForwarders = [];
  iframe.addEventListener('load', () => {
    const win = iframe.contentWindow;
    if (!win) return;

    const forward = (e) => {
      // Re-dispatch the event on the top document so existing handlers fire
      const evt = new KeyboardEvent(e.type, e);
      document.dispatchEvent(evt);
    };

    win.addEventListener('keydown', forward);
    win.addEventListener('keyup', forward);
    keyForwarders.push({ win, forward });
  });

  root.appendChild(iframe);

  return {
    teardown() {
      try { iframe.remove(); } catch (e) {}
      // Remove forwarded listeners
      keyForwarders.forEach(({ win, forward }) => {
        try { win.removeEventListener('keydown', forward); } catch (_) {}
        try { win.removeEventListener('keyup', forward); } catch (_) {}
      });
    }
  };
}

export default { setup }; 