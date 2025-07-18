// Add interactive functionality to sliders
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.slider');
    
    // Define image arrays for each card
    const imageData = {
        'logo-slider': {
            images: ['Logo/1.jpg', 'Logo/2.jpg', 'Logo/3.jpg', 'Logo/4.jpg', 'Logo/5.jpg'],
            element: document.getElementById('logo-image')
        },
        'color-slider': {
            images: ['Color/1.jpg', 'Color/2.jpg', 'Color/3.jpg', 'Color/4.jpg', 'Color/5.jpg'],
            element: document.getElementById('color-image')
        },
        'typo-slider': {
            images: ['Typo/1.jpg', 'Typo/2.jpg', 'Typo/3.jpg', 'Typo/4.jpg', 'Typo/5.jpg'],
            element: document.getElementById('typo-image')
        },
        'photo-slider': {
            images: ['Photo/1.jpg', 'Photo/2.jpg', 'Photo/3.jpg'],
            element: document.getElementById('photo-image')
        },
        'voice-slider': {
            images: ['voice/1.jpg', 'voice/2.jpg', 'voice/3.jpg'],
            element: document.getElementById('voice-image')
        },
        'layout-slider': {
            images: ['Layout/1.jpg', 'Layout/2.jpg'],
            element: document.getElementById('layout-image')
        }
    };
    
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const fill = slider.querySelector('.slider-fill');
        const thumb = slider.querySelector('.slider-thumb');
        const valueDisplay = slider.parentElement.querySelector('.value-display');
        
        let isDragging = false;
        // Start each slider at a random location so they are out of phase
        let currentValue = Math.random() * 100;
        
        function updateSlider(percentage) {
            percentage = Math.max(0, Math.min(100, percentage));
            currentValue = percentage;
            
            fill.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
            
            // Check if this slider has image data
            const sliderData = imageData[slider.id];
            if (sliderData) {
                // Map percentage to image index
                const imageIndex = Math.floor((percentage / 100) * (sliderData.images.length - 1));
                const clampedIndex = Math.max(0, Math.min(sliderData.images.length - 1, imageIndex));
                
                // Update image
                if (sliderData.element) {
                    sliderData.element.src = sliderData.images[clampedIndex];
                }
                
                // Update display value to show image number (1-based)
                valueDisplay.textContent = clampedIndex + 1;
            } else {
                // Fallback for any slider without image data
                const displayValue = Math.round(percentage / 2);
                valueDisplay.textContent = displayValue;
            }
        }
        
        function getPercentageFromEvent(e) {
            const rect = track.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            return (x / rect.width) * 100;
        }
        
        // Mouse events
        slider.addEventListener('mousedown', function(e) {
            isDragging = true;
            const percentage = getPercentageFromEvent(e);
            updateSlider(percentage);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const percentage = getPercentageFromEvent(e);
                updateSlider(percentage);
            }
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // Touch events for mobile
        slider.addEventListener('touchstart', function(e) {
            isDragging = true;
            const percentage = getPercentageFromEvent(e);
            updateSlider(percentage);
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', function(e) {
            if (isDragging) {
                const percentage = getPercentageFromEvent(e);
                updateSlider(percentage);
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', function() {
            isDragging = false;
        });
        
        // Initialize with default value (first image)
        updateSlider(currentValue);

        // --- Automatic random animation loop ---
        let direction = Math.random() < 0.5 ? 1 : -1; // 1 = toward 100, -1 = toward 0
        let targetValue = direction === 1 ? 100 : 0; // first target is an endpoint

        // Pick a random speed for this leg (percent per frame)
        const minSpeed = 0.8;   // ~48 % per second
        const maxSpeed = 2.2;   // ~130 % per second
        const randomSpeed = () => minSpeed + Math.random() * (maxSpeed - minSpeed);
        let speedPerFrame = randomSpeed();
        let isPaused = false;

        function animateSlider() {
            if (!isDragging) {
                if (isPaused) {
                    // Animation is paused, do nothing this frame.
                } else {
                    const diff = targetValue - currentValue;
                    if (Math.abs(diff) <= speedPerFrame) {
                        // === Reached Endpoint: Snap, Pause, and Reverse ===
                        currentValue = targetValue;
                        isPaused = true;

                        const pauseDurationMs = 1000 + Math.random() * 1500; // 1-2.5 sec
                        setTimeout(() => {
                            direction *= -1;
                            targetValue = direction === 1 ? 100 : 0;
                            speedPerFrame = randomSpeed(); // New speed for the return trip
                            isPaused = false; // Resume
                        }, pauseDurationMs);

                    } else {
                        // === Still Moving ===
                        currentValue += direction * speedPerFrame;
                    }
                    updateSlider(currentValue);
                }
            }
            requestAnimationFrame(animateSlider);
        }

        // Initialize slider at its random starting point
        updateSlider(currentValue);
        // Start the animation loop
        requestAnimationFrame(animateSlider);
        // --- End automatic animation loop ---
    });
    
    // Add subtle animations on card hover
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });
    });
});

// Add smooth transitions
const style = document.createElement('style');
style.textContent = `
    .card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .slider-fill, .slider-thumb {
        transition: all 0.15s ease-out;
    }
`;
document.head.appendChild(style); 