// scenes/claudeLoadingScene.js – wraps the ben/claude-loading-demo.html as a reusable scene

export async function setup(root) {
  // Create wrapper for the scene
  const wrapper = document.createElement('div');
  wrapper.id = 'claude-loading-scene';
  wrapper.style.position = 'relative';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  wrapper.style.overflow = 'hidden';
  
  // Load the HTML content from the ben folder
  try {
    const response = await fetch('./ben/claude-loading-demo.html');
    const htmlContent = await response.text();
    
    // Extract the body content and styles
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Get the styles from the head
    const styles = doc.querySelector('style');
    if (styles) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles.textContent;
      document.head.appendChild(styleElement);
      wrapper._injectedStyle = styleElement; // Keep reference for cleanup
    }
    
    // Get the body content
    const bodyContent = doc.body.innerHTML;
    wrapper.innerHTML = bodyContent;
    
    // Execute any scripts in the content
    const scripts = doc.querySelectorAll('script');
    const scriptPromises = [];
    
    scripts.forEach(script => {
      if (script.src) {
        // External script
        const newScript = document.createElement('script');
        newScript.src = script.src;
        const promise = new Promise((resolve, reject) => {
          newScript.onload = resolve;
          newScript.onerror = reject;
        });
        document.head.appendChild(newScript);
        wrapper._injectedScripts = wrapper._injectedScripts || [];
        wrapper._injectedScripts.push(newScript);
        scriptPromises.push(promise);
      } else {
        // Inline script
        try {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.head.appendChild(newScript);
          wrapper._injectedScripts = wrapper._injectedScripts || [];
          wrapper._injectedScripts.push(newScript);
        } catch (e) {
          console.warn('Error executing inline script:', e);
        }
      }
    });
    
    // Wait for external scripts to load
    await Promise.all(scriptPromises);

    // Manually trigger the initialization
    if (typeof window.initializeScene === 'function') {
      window.initializeScene();
    }
    
  } catch (error) {
    console.error('Error loading claude-loading-demo:', error);
    wrapper.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error loading scene</div>';
  }
  
  root.appendChild(wrapper);

  // Return teardown function
  return {
    teardown() {
      try {
        // Remove injected styles
        if (wrapper._injectedStyle && wrapper._injectedStyle.parentNode) {
          wrapper._injectedStyle.parentNode.removeChild(wrapper._injectedStyle);
        }
        
        // Remove injected scripts
        if (wrapper._injectedScripts) {
          wrapper._injectedScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          });
        }
        
        // Remove the wrapper
        wrapper.remove();
      } catch (e) {
        console.warn('Error during claude loading scene teardown:', e);
      }
    }
  };
}

export default { setup }; 