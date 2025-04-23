document.addEventListener('DOMContentLoaded', function() {
    // Initialize all category images with loaded state
    initImageLoadStates();
    
    // Initialize grids with carousel functionality if enabled
    initResponsiveGrids();
});

function initImageLoadStates() {
    const images = document.querySelectorAll('.cg-category-image');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            // Optional: Add error handling
            img.addEventListener('error', function() {
                console.error('Image failed to load:', this.src);
            });
        }
    });
}

function initResponsiveGrids() {
    const grids = document.querySelectorAll('.cg-grid-container[data-carousel="true"]');
    
    grids.forEach(grid => {
        // Initialize based on current viewport
        handleGridLayout(grid);
        
        // Update on window resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                handleGridLayout(grid);
            }, 250);
        });
    });
}

function handleGridLayout(container) {
    const isMobile = window.innerWidth <= 767;
    const isCarouselEnabled = container.dataset.carousel === 'true';
    
    // Clean up previous state
    container.classList.remove('cg-carousel-mode', 'cg-grid-mode');
    
    if (isMobile && isCarouselEnabled) {
        initCarousel(container);
    } else {
        initGridLayout(container);
    }
}

function initGridLayout(container) {
    container.classList.add('cg-grid-mode');
    
    const columns = window.innerWidth >= 768 
        ? parseInt(container.dataset.columns) || 3 
        : parseInt(container.dataset.mobileColumns) || 2;
    
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // Ensure all items are visible (in case they were hidden by carousel)
    const items = container.querySelectorAll('.cg-bx');
    items.forEach(item => {
        item.style.display = '';
    });
}

function initCarousel(container) {
    container.classList.add('cg-carousel-mode');
    
    // Get all items and calculate slides
    const items = Array.from(container.querySelectorAll('.cg-bx')); // Corrected selector
    const mobileColumns = parseInt(container.dataset.mobileColumns) || 2;
    const itemsPerSlide = mobileColumns * 2; // 2 rows of mobileColumns
    
    const slides = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
        slides.push(items.slice(i, i + itemsPerSlide));
    }
    
    // Create carousel structure
    const carouselInner = document.createElement('div');
    carouselInner.className = 'cg-carousel-inner';
    
    slides.forEach((slideItems, index) => {
        const slide = document.createElement('div');
        slide.className = 'cg-carousel-slide';
        slide.setAttribute('data-slide-index', index);
        slideItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.style.width = `${100 / mobileColumns}%`; // Ensure correct item width
            slide.appendChild(clone);
        });
        carouselInner.appendChild(slide);
    });
    
    // Clear container and add carousel
    container.innerHTML = '';
    container.appendChild(carouselInner);
    
    // Add dots if needed
    if (slides.length > 1) addCarouselDots(container, slides.length);
    
    // Initialize controls
    setupTouchControls(container, slides.length);
    initImageLoadStates();
}

function addCarouselDots(container, slideCount) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'cg-carousel-dots';
    
    for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('button');
        dot.className = `cg-carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('data-slide-index', i);
        dotsContainer.appendChild(dot);
    }
    
    container.appendChild(dotsContainer);
    
    // Add click handlers
    dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.cg-carousel-dot');
        if (dot) {
            const index = parseInt(dot.getAttribute('data-slide-index'));
            goToSlide(container, index);
        }
    });
}

function setupTouchControls(container, slideCount) {
    let touchStartX = 0;
    let currentSlide = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlide < slideCount - 1) {
                goToSlide(container, currentSlide + 1);
            } else if (diff < 0 && currentSlide > 0) {
                goToSlide(container, currentSlide - 1);
            }
        }
    }, { passive: true });
}

function goToSlide(container, index) {
    const carouselInner = container.querySelector('.cg-carousel-inner');
    const slideCount = container.querySelectorAll('.cg-carousel-slide').length;
    const dots = container.querySelectorAll('.cg-carousel-dot');
    
    // Validate index
    index = Math.max(0, Math.min(index, slideCount - 1));
    
    // Update slide position
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
    
    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // Update current slide reference
    container.dataset.currentSlide = index;
}