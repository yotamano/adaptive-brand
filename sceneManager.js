// Scene manager – lazy-loads ES-modules and handles a simple flash transition
const sceneDefs = [
  () => import('./scenes/scannerScene.js'),   // scanning scene appears first
  () => import('./scenes/aiContextScene.js'), // original context scene
  () => import('./scenes/businessScene.js')   // business intelligence dashboard
];

let currentHandle = null;
let currentIdx = 0;
const container = document.getElementById('scene-container');
const mask = document.getElementById('transition-mask');

async function loadScene(idx) {
  // Trigger flash
  mask.classList.add('flash');
  await new Promise(r => setTimeout(r, 120));

  // Teardown previous scene if any
  if (currentHandle && typeof currentHandle.teardown === 'function') {
    try { await currentHandle.teardown(); } catch(e) { console.warn('Scene teardown error', e); }
  }
  container.innerHTML = '';

  // Lazy-load and mount next scene
  const mod = await sceneDefs[idx]();
  if (!mod || typeof mod.setup !== 'function') {
    console.error('Scene module missing setup() export');
    return;
  }
  currentHandle = await mod.setup(container);

  // Fade back in
  setTimeout(() => mask.classList.remove('flash'), 120);
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