// scenes/scannerScene.js – shows a quick scan of 1.png then builds a static T-pose point-cloud model

export async function setup(root) {
  const wrapper = document.createElement('div');
  wrapper.id = 'scanner-scene';
  wrapper.style.position = 'relative';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  root.appendChild(wrapper);

  // --- DOM overlay for scan line & instruction text ---
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  wrapper.appendChild(overlay);

  const scanLine = document.createElement('div');
  scanLine.style.position = 'absolute';
  scanLine.style.left = '0';
  scanLine.style.width = '100%';
  scanLine.style.height = '2px';
  scanLine.style.background = '#00ff41';
  overlay.appendChild(scanLine);

  const hint = document.createElement('div');
  hint.textContent = 'INITIALIZING.BIOMETRIC.SCAN';
  hint.style.position = 'absolute';
  hint.style.top = '30px';
  hint.style.left = '50%';
  hint.style.transform = 'translateX(-50%)';
  hint.style.fontSize = '12px';
  hint.style.color = '#00ff41';
  hint.style.fontFamily = 'Courier New, monospace';
  overlay.appendChild(hint);

  // --- Three.js boilerplate ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  wrapper.appendChild(renderer.domElement);

  // --- Match lighting from context scene ---
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x00ff41, 0.4);
  directionalLight.position.set(2, 4, 5);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0x666666, 0.3);
  backLight.position.set(-2, 2, -3);
  scene.add(backLight);

  // Resize handler
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // --- Load target texture plane (1.png) ---
  const tex = await new THREE.TextureLoader().loadAsync('1.png');
  const geometry = new THREE.PlaneGeometry(1.5, 1.5 * tex.image.height / tex.image.width);
  const material = new THREE.MeshBasicMaterial({ map: tex });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
  plane.position.set(0, 0.8, 0);

  // --- Animate scan line across the plane ---
  const totalScanTime = 3000; // ms
  const startTime = performance.now();

  // --- After scan, load FBX and switch to point-cloud figure ---
  let figure = null;
  let mixer = null;
  const loader = new THREE.FBXLoader();
  const animName = 'scanModel';

  const clock = new THREE.Clock();

  async function buildModel() {
    const fbx = await loader.loadAsync('3D animations/Standing W_Briefcase Idle.fbx');
    // Replace mesh with point cloud as in other scene
    fbx.traverse((child) => {
      if (child.isMesh) {
        const pc = createSkinnedPointCloud(child, { size: 2.0, color: 0xffffff, skip: 4 });
        child.parent.add(pc);
        child.parent.remove(child);
      }
    });
    figure = fbx;
    figure.scale.setScalar(1.3);
    figure.position.set(0, -1, 0);
    scene.add(figure);

    // Leave model in T-pose (first frame) by not starting an animation.
  }

  // --- Animation loop ---
  let frameId;
  function animate() {
    frameId = requestAnimationFrame(animate);

    const now = performance.now();
    const t = now - startTime;

    // Move scan line from top to bottom over totalScanTime
    const progress = Math.min(1, t / totalScanTime);
    scanLine.style.top = `${progress * 100}%`;

    if (progress >= 1 && plane.parent) {
      // Remove plane & hint after scan done
      plane.parent.remove(plane);
      hint.textContent = 'SCAN.COMPLETE';
      overlay.removeChild(scanLine);
      buildModel();
    }

    // Subtle camera movement & lookAt when figure exists
    if (figure) {
      const camTime = Date.now() * 0.0002;
      camera.position.x = Math.sin(camTime) * 0.05;
      camera.lookAt(figure.position);

      // Update point cloud uniform time
      const elapsed = clock.getElapsedTime();
      figure.traverse((child) => {
        if (child.material && child.material.uniforms && child.material.uniforms.uTime) {
          child.material.uniforms.uTime.value = elapsed;
        }
      });
    }

    renderer.render(scene, camera);
  }
  animate();

  // ---- Return teardown handle ----
  return {
    teardown() {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      try { wrapper.remove(); } catch (e) {}
      if (renderer) {
        renderer.dispose();
      }
    }
  };
}

export default { setup }; 