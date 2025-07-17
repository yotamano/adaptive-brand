export async function setup(root) {
  // Wrapper that fills the viewport
  const wrapper = document.createElement('div');
  wrapper.id = 'why-brand-scene';
  wrapper.style.position = 'absolute';
  wrapper.style.left = '0';
  wrapper.style.top = '0';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  wrapper.style.background = '#000';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  root.appendChild(wrapper);

  // Title
  const titleEl = document.createElement('div');
  titleEl.textContent = 'WHY.BRAND';
  titleEl.style.position = 'absolute';
  titleEl.style.top = '20px';
  titleEl.style.left = '50%';
  titleEl.style.transform = 'translateX(-50%)';
  titleEl.style.fontSize = '16px';
  titleEl.style.color = '#00ff41';
  titleEl.style.letterSpacing = '4px';
  titleEl.style.fontFamily = 'Courier New, monospace';
  wrapper.appendChild(titleEl);

  // Carousel container becomes the viewport for the marquee
  const carousel = document.createElement('div');
  carousel.id = 'why-carousel';
  carousel.style.width = '100vw';
  carousel.style.overflow = 'hidden';
  carousel.style.display = 'flex';
  wrapper.appendChild(carousel);

  // The track holds the slides and is animated
  const marqueeTrack = document.createElement('div');
  marqueeTrack.id = 'marquee-track';
  carousel.appendChild(marqueeTrack);

  // Slides sourced from local white-shirts collection
  const slidesData = [
    { src: 'white-shirts/T1.jpg', caption: 'AUTHENTICITY.MATTERS' },
    { src: 'white-shirts/T2.jpg', caption: 'TRUST.BUILDS.CONNECTION' },
    { src: 'white-shirts/T3.jpg', caption: 'CONSISTENCY.DRIVES.VALUE' },
    { src: 'white-shirts/T4.jpg', caption: 'EMOTION.TRIGGERS.ACTION' },
    { src: 'white-shirts/T5.jpg', caption: 'BRAND.IS.EXPERIENCE' },
    { src: 'white-shirts/T6.jpg', caption: 'STORY.CREATES.LOYALTY' },
    { src: 'white-shirts/T7.jpg', caption: 'SIMPLICITY.CUTS.NOISE' },
    { src: 'white-shirts/T8.jpg', caption: 'PERCEPTION.IS.REALITY' }
  ];

  // Duplicate slides for a seamless loop
  const allSlidesData = [...slidesData, ...slidesData];

  allSlidesData.forEach(({ src, caption }) => {
    const slide = document.createElement('div');
    slide.className = 'why-slide';

    const img = document.createElement('img');
    img.src = src;
    slide.appendChild(img);

    const cap = document.createElement('div');
    cap.textContent = caption;
    slide.appendChild(cap);

    marqueeTrack.appendChild(slide);
  });

  // Inject CSS for the marquee animation
  const animationStyle = document.createElement('style');
  const animationDuration = slidesData.length * 5; // 40s total
  animationStyle.textContent = `
    #marquee-track {
      display: flex;
      align-items: center; /* Vertical alignment */
      will-change: transform;
      animation: marquee ${animationDuration}s linear infinite;
    }
    #marquee-track:hover {
      animation-play-state: paused;
    }
    @keyframes marquee {
      from { transform: translateX(0%); }
      to { transform: translateX(-50%); }
    }
    .why-slide {
      flex: 0 0 auto; /* Prevent shrinking */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 2vw;
    }
    .why-slide img {
      height: 60vh; /* Consistent height for all images */
      width: auto;  /* Maintain aspect ratio */
      object-fit: contain;
      max-width: 40vw;
    }
    .why-slide div {
      margin-top: 12px;
      font-size: 10px;
      color: #888;
      font-family: 'Courier New', monospace;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(animationStyle);


  return {
    teardown() {
      try { wrapper.remove(); } catch (_) {}
      try { animationStyle.remove(); } catch (_) {}
    }
  };
}

export default { setup }; 