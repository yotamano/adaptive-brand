// SkinnedPointCloudShader.js
// Helper for turning a loaded SkinnedMesh (e.g., from FBX) into an animated point-cloud
// Usage:
//   const pointCloud = createSkinnedPointCloud(skinnedMesh, { size: 4, color: 0xffffff });
//   scene.add(pointCloud);
// It keeps the original skeleton so animations driven by THREE.AnimationMixer still work.

(function (root) {
  const THREE = root.THREE;
  if (!THREE) {
    console.error('THREE namespace not found. Make sure three.js is loaded before SkinnedPointCloudShader.js');
    return;
  }

  function createSkinnedPointCloud(originalMesh, options = {}) {
    const opts = Object.assign({ size: 0.1, color: 0xffffff, skip: 1 }, options); // skip N vertices
    const skip = Math.max(1, opts.skip | 0);

    // Vertex & fragment shaders with standard skinning chunks
    const vertexShader = /* glsl */`
      uniform float size;
      uniform float uTime;
      uniform float uScatter;
      #include <common>
      #include <skinning_pars_vertex>
      #include <morphtarget_pars_vertex>
      
      // Simple noise functions for a cloudier effect
      
      // Simple hash function
      vec3 hash(vec3 p) {
        p = vec3(
          dot(p, vec3(127.1, 311.7, 74.7)),
          dot(p, vec3(269.5, 183.3, 246.1)),
          dot(p, vec3(113.5, 271.9, 124.6))
        );
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }
      
      // Simplex-style noise (simplified version)
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        
        // Cubic interpolation
        vec3 u = f * f * (3.0 - 2.0 * f);
        
        // Mix 8 corners
        return mix(
          mix(mix(dot(hash(i + vec3(0,0,0)), f - vec3(0,0,0)),
                  dot(hash(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
              mix(dot(hash(i + vec3(0,1,0)), f - vec3(0,1,0)),
                  dot(hash(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
          mix(mix(dot(hash(i + vec3(0,0,1)), f - vec3(0,0,1)),
                  dot(hash(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
              mix(dot(hash(i + vec3(0,1,1)), f - vec3(0,1,1)),
                  dot(hash(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z
        ) * 0.5 + 0.5;
      }
      
      // Fractal Brownian Motion (fBm) - adds layers of noise for cloudy effect
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        // Add several octaves of noise with decreasing amplitude
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      // Creates a curl noise effect for more natural swirling/cloudy motion
      vec3 curlNoise(vec3 p) {
        const float eps = 0.01;
        vec3 dx = vec3(eps, 0.0, 0.0);
        vec3 dy = vec3(0.0, eps, 0.0);
        vec3 dz = vec3(0.0, 0.0, eps);
        
        vec3 curl = vec3(
          (fbm(p + dy) - fbm(p - dy)) - (fbm(p + dz) - fbm(p - dz)),
          (fbm(p + dz) - fbm(p - dz)) - (fbm(p + dx) - fbm(p - dx)),
          (fbm(p + dx) - fbm(p - dx)) - (fbm(p + dy) - fbm(p - dy))
        );
        
        return normalize(curl);
      }
      
      void main() {
        #include <skinbase_vertex>
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>

        // Base position after skinning
        vec3 skinnedPos = transformed;
        
        // Add subtle animated jitter to base position
        vec3 jitter = 0.008 * sin(uTime + position.xyz * 20.0);
        skinnedPos += jitter;
        
        // Create time-based animation inputs
        float timePhase = uTime * 0.3;
        vec3 noisePos = position * 0.5 + vec3(timePhase * 0.2);
        
        // Create cloud-like motion using curl noise
        vec3 cloudDirection = curlNoise(noisePos + vec3(uTime * 0.1));
        
        // Add some randomness to scatter distance based on position
        float scatterDistance = 2.0 + fbm(position * 0.7) * 1.5;
        
        // Create turbulence effect for variation
        float turbulence = 0.4 + 0.6 * sin(dot(position, vec3(12.9, 78.2, 45.1)) + uTime * 0.5);
        
        // Calculate scattered position with cloud-like behavior
        vec3 scattered = skinnedPos + cloudDirection * scatterDistance * turbulence;
        
        // Smoother transition with easing function
        float easeScatter = uScatter * uScatter * (3.0 - 2.0 * uScatter); // Smooth step easing
        
        // Mix between original and scattered positions
        vec3 finalPos = mix(skinnedPos, scattered, easeScatter);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = /* glsl */`
      uniform vec3 diffuse;
      void main() {
        // soft circular points
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        gl_FragColor = vec4(diffuse, 1.0);
      }
    `;

    const uniforms = {
      size: { value: opts.size },
      uTime: { value: 0 },
      uScatter: { value: 0 },
      diffuse: { value: new THREE.Color(opts.color) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: true,
      skinning: true
    });

    // Optionally down-sample geometry by taking every `skip`-th vertex
    let srcGeo = originalMesh.geometry;
    if (skip > 1) {
      const attrPos = srcGeo.getAttribute('position');
      const attrSI = srcGeo.getAttribute('skinIndex');
      const attrSW = srcGeo.getAttribute('skinWeight');
      const len = Math.floor(attrPos.count / skip);
      const positions = new Float32Array(len * 3);
      const skinIndices = new Uint16Array(len * 4);
      const skinWeights = new Float32Array(len * 4);

      // Copy attributes with stride
      for (let i = 0, j = 0; i < len; i++, j += skip) {
        positions[i * 3] = attrPos.array[j * 3];
        positions[i * 3 + 1] = attrPos.array[j * 3 + 1];
        positions[i * 3 + 2] = attrPos.array[j * 3 + 2];

        if (attrSI && attrSW) {
          skinIndices.set(attrSI.array.slice(j * 4, j * 4 + 4), i * 4);
          skinWeights.set(attrSW.array.slice(j * 4, j * 4 + 4), i * 4);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      if (attrSI && attrSW) {
        geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
        geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
      }

      srcGeo = geo;
    }

    // Points object that masquerades as a SkinnedMesh so renderer uploads skeleton matrices
    class SkinnedPoints extends THREE.Points {
      constructor(sourceMesh, mat) {
        super(srcGeo, mat);
        this.type = 'SkinnedPoints';
        this.isSkinnedMesh = true; // Trick WebGLRenderer

        // Copy skeleton data
        this.bindMode = sourceMesh.bindMode;
        this.bindMatrix = sourceMesh.bindMatrix.clone();
        this.bindMatrixInverse = sourceMesh.bindMatrixInverse.clone();
        this.skeleton = sourceMesh.skeleton;

        // Ensure same name for potential mixer targets
        this.name = sourceMesh.name + '_points';
      }
    }

    return new SkinnedPoints(originalMesh, material);
  }

  // Expose globally
  root.createSkinnedPointCloud = createSkinnedPointCloud;
})(typeof window !== 'undefined' ? window : this); 