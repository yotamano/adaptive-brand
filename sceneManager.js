// Scene manager – lazy-loads ES-modules and handles a simple flash transition
const sceneDefs = [
  () => import('./scenes/scannerScene.js'),   // scanning scene appears first
  () => import('./scenes/aiContextScene.js'), // original context scene
  () => import('./scenes/businessScene.js'),  // business intelligence dashboard
  () => import('./scenes/whyBrandScene.js'),  // why brand carousel scene
  () => import('./scenes/adaptiveBrandScene.js'), // adaptive brand design system
  // () => import('./scenes/claudeLoadingScene.js') // claude loading demo scene
];

let currentHandle = null;
let currentIdx = 0;
const container = document.getElementById('scene-container');
const mask = document.getElementById('transition-mask');

// Add transition styles
const transitionStyles = document.createElement('style');
transitionStyles.textContent = `
  .scene-transitioning-out {
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  
  .scene-transitioning-in {
    opacity: 0;
    transform: scale(1.05);
    transition: opacity 0.6s ease-in, transform 0.6s ease-in;
  }
  
  .scene-active {
    opacity: 1;
    transform: scale(1);
    transition: opacity 0.6s ease-in, transform 0.6s ease-in;
  }
`;
document.head.appendChild(transitionStyles);

async function loadScene(idx) {
  // Start smooth transition out
  if (container.firstChild) {
    container.firstChild.classList.add('scene-transitioning-out');
    // Wait for fade out to complete
    await new Promise(r => setTimeout(r, 600));
  }

  // Teardown previous scene if any
  if (currentHandle && typeof currentHandle.teardown === 'function') {
    try { await currentHandle.teardown(); } catch(e) { console.warn('Scene teardown error', e); }
  }
  container.innerHTML = '';

  // Create a wrapper for the new scene
  const sceneWrapper = document.createElement('div');
  sceneWrapper.classList.add('scene-transitioning-in');
  container.appendChild(sceneWrapper);

  // Lazy-load and mount next scene
  const mod = await sceneDefs[idx]();
  if (!mod || typeof mod.setup !== 'function') {
    console.error('Scene module missing setup() export');
    return;
  }
  currentHandle = await mod.setup(sceneWrapper);
  
  // Force a reflow to ensure transitions work
  void sceneWrapper.offsetWidth;
  
  // Transition in
  sceneWrapper.classList.remove('scene-transitioning-in');
  sceneWrapper.classList.add('scene-active');
}

// Simple key control: Space cycles through scenes
function keyHandler(e) {
  // ArrowRight: next scene | ArrowLeft: previous scene
  if (e.code === 'ArrowRight') {
    currentIdx = (currentIdx + 1) % sceneDefs.length;
    loadScene(currentIdx);
  } else if (e.code === 'ArrowLeft') {
    currentIdx = (currentIdx - 1 + sceneDefs.length) % sceneDefs.length;
    loadScene(currentIdx);
  }
}

document.addEventListener('keydown', keyHandler);

// Kick things off
loadScene(0); 