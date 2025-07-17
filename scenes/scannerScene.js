// scenes/scannerScene.js – shows a quick scan of 1.jpg then builds a static T-pose point-cloud model
import { gsap } from "https://cdn.skypack.dev/gsap";
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

  // --- Three.js boilerplate ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 4); // match ai-context starting position

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  wrapper.appendChild(renderer.domElement);

  // --- Match lighting from context scene ---
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
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

  let figure = null;
  const loader = new THREE.FBXLoader();
  const clock = new THREE.Clock();

  // Typewriter animation function
  function typeWriter(element, text, speed = 50) {
    return new Promise((resolve) => {
      let i = 0;
      element.innerHTML = '';
      function type() {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }
      type();
    });
  }

  // --- Create Init Button ---
  const initButton = document.createElement('button');
  initButton.textContent = 'Initialize Scan';
  initButton.style.position = 'absolute';
  initButton.style.top = '50%';
  initButton.style.left = '50%';
  initButton.style.transform = 'translate(-50%, -50%)';
  initButton.style.padding = '15px 30px';
  initButton.style.fontSize = '18px';
  initButton.style.fontFamily = 'Courier New, monospace';
  initButton.style.background = '#ffffff';
  initButton.style.color = '#000';
  initButton.style.border = 'none';
  initButton.style.cursor = 'pointer';
  wrapper.appendChild(initButton);

  initButton.addEventListener('click', startScan, { once: true });
  
  async function startScan() {
    initButton.remove();

    // Create and show image
    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'absolute';
    imageContainer.style.top = '50%';
    imageContainer.style.left = '50%';
    imageContainer.style.transform = 'translate(-50%, -50%)';
    imageContainer.style.width = '300px'; 
    imageContainer.style.height = 'auto';
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.opacity = '0';
    wrapper.appendChild(imageContainer);
    
    const img = document.createElement('img');
    img.src = '1.jpg';
    img.style.width = '100%';
    img.style.height = 'auto';
    imageContainer.appendChild(img);

    // Create name display with typewriter effect
    const nameDisplay = document.createElement('div');
    nameDisplay.style.position = 'absolute';
    nameDisplay.style.bottom = '20px';
    nameDisplay.style.left = '50%';
    nameDisplay.style.transform = 'translateX(-50%)';
    nameDisplay.style.color = '#fff';
    nameDisplay.style.fontFamily = 'Courier New, monospace';
    nameDisplay.style.fontSize = '24px';
    nameDisplay.style.opacity = '0';
    wrapper.appendChild(nameDisplay);
    
    // Animate image and name appearance
    gsap.to(imageContainer, { opacity: 1, duration: 1 });
    gsap.to(nameDisplay, { opacity: 1, duration: 1, delay: 0.5 });
    
    await typeWriter(nameDisplay, 'Yasmine El Hariri');

    // Add gradient scanner effect
    const gradient = document.createElement('div');
    Object.assign(gradient.style, {
      position: 'absolute',
      top: '0', left: '0', width: '100%', height: '100%',
      background: 'linear-gradient(to bottom, transparent, white, transparent)',
      opacity: '0.7',
      mixBlendMode: 'screen',
      transform: 'translateY(-100%)'
    });
    imageContainer.appendChild(gradient);

    await gsap.to(gradient, {
      transform: 'translateY(100%)',
      duration: 2,
      ease: 'power1.inOut',
    }).then();
    
    // Fade out image and name
    gsap.to(imageContainer, { opacity: 0, duration: 1 });
    gsap.to(nameDisplay, { opacity: 0, duration: 1 });
    
    await buildAndAnimateModel();
  }

  async function buildAndAnimateModel() {
    const fbx = await loader.loadAsync('3D animations/Standing W_Briefcase Idle.fbx');
    fbx.traverse((child) => {
      if (child.isMesh) {
        const pc = createSkinnedPointCloud(child, {
          size: 2.0,
          color: 0xffffff,
          skip: 50,
        });
        child.parent.add(pc);
        child.parent.remove(child);
      }
    });
    figure = fbx;
    figure.scale.setScalar(1.3);
    figure.position.set(0, -1, 0);
    scene.add(figure);
    
    const box = new THREE.Box3().setFromObject(fbx);
    const size = new THREE.Vector3();
    const pivot = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(pivot);
    fbx.position.sub(pivot);
    fbx.position.y = -1;

    // Set initial scatter value to 1 (fully scattered)
    figure.traverse((child) => {
      if (child.material && child.material.uniforms && child.material.uniforms.uScatter) {
        child.material.uniforms.uScatter.value = 1;
      }
    });

    // Animate scatter-in effect
    const scatterUniform = { value: 1 };
    gsap.to(scatterUniform, {
      value: 0,
      duration: 3,
      ease: 'power2.inOut',
      onUpdate: () => {
        figure.traverse((child) => {
          if (child.material && child.material.uniforms && child.material.uniforms.uScatter) {
            child.material.uniforms.uScatter.value = scatterUniform.value;
          }
        });
      },
    });
  }

  let frameId;
  function animate() {
    frameId = requestAnimationFrame(animate);

    if (figure) {
      const time = Date.now() * 0.0002;
      camera.position.x = Math.sin(time) * 0.03;
      camera.position.y = Math.sin(time * 0.3) * 0.02;
      camera.position.z = 4 + Math.sin(time * 0.5) * 0.05;
      camera.lookAt(figure.position);
      
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
    },
  };
}

export default { setup }; 