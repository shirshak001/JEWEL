// Image Stack Gallery for Mobile
// Swipeable card stack implementation

class ImageStack {
    constructor(container, images, options = {}) {
        this.container = container;
        this.images = images;
        this.options = {
            sensitivity: options.sensitivity || 180,
            randomRotation: options.randomRotation !== false,
            mobileOnly: options.mobileOnly !== false,
            mobileBreakpoint: options.mobileBreakpoint || 768,
            ...options
        };
        
        this.currentIndex = images.length - 1;
        this.cards = [];
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        this.init();
    }
    
    init() {
        // Check if mobile
        if (this.options.mobileOnly && window.innerWidth >= this.options.mobileBreakpoint) {
            this.renderFallback();
            return;
        }
        
        this.container.classList.add('image-stack-container');
        this.container.innerHTML = '';
        
        // Create cards
        this.images.forEach((image, index) => {
            const card = this.createCard(image, index);
            this.cards.push(card);
            this.container.appendChild(card);
        });
        
        this.updateStack();
        this.attachEvents();
    }
    
    createCard(imageSrc, index) {
        const card = document.createElement('div');
        card.className = 'stack-card';
        card.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Product image ${index + 1}`;
        img.draggable = false;
        
        card.appendChild(img);
        return card;
    }
    
    updateStack() {
        this.cards.forEach((card, index) => {
            const position = this.images.length - 1 - index;
            const randomRotate = this.options.randomRotation ? (Math.random() * 10 - 5) : 0;
            const rotation = position * 4 + randomRotate;
            const scale = 1 + position * 0.06 - this.images.length * 0.06;
            const zIndex = index;
            
            card.style.transform = `
                translateX(0px) 
                translateY(0px)
                rotate(${rotation}deg) 
                scale(${scale})
            `;
            card.style.zIndex = zIndex;
            card.style.transformOrigin = '90% 90%';
        });
    }
    
    attachEvents() {
        const topCard = this.cards[this.currentIndex];
        if (!topCard) return;
        
        // Touch events
        topCard.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
        topCard.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        topCard.addEventListener('touchend', this.handleEnd.bind(this));
        
        // Mouse events
        topCard.addEventListener('mousedown', this.handleStart.bind(this));
        topCard.addEventListener('mousemove', this.handleMove.bind(this));
        topCard.addEventListener('mouseup', this.handleEnd.bind(this));
        topCard.addEventListener('mouseleave', this.handleEnd.bind(this));
        
        // Click to send to back
        topCard.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.sendToBack();
            }
        });
    }
    
    handleStart(e) {
        this.isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        
        const card = this.cards[this.currentIndex];
        card.style.cursor = 'grabbing';
    }
    
    handleMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        this.currentX = touch.clientX - this.startX;
        this.currentY = touch.clientY - this.startY;
        
        const card = this.cards[this.currentIndex];
        const rotation = this.currentX * 0.1;
        
        card.style.transform = `
            translateX(${this.currentX}px) 
            translateY(${this.currentY}px)
            rotate(${rotation}deg)
        `;
    }
    
    handleEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const card = this.cards[this.currentIndex];
        card.style.cursor = 'grab';
        
        const distance = Math.sqrt(this.currentX ** 2 + this.currentY ** 2);
        
        if (distance > this.options.sensitivity) {
            this.sendToBack();
        } else {
            // Snap back
            card.style.transition = 'transform 0.3s ease';
            this.updateStack();
            setTimeout(() => {
                card.style.transition = '';
            }, 300);
        }
        
        this.currentX = 0;
        this.currentY = 0;
    }
    
    sendToBack() {
        const card = this.cards[this.currentIndex];
        
        // Animate out
        card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        card.style.transform = `translateX(${this.currentX > 0 ? 200 : -200}%) rotate(${this.currentX > 0 ? 45 : -45}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
            // Move to back of array
            const movedCard = this.cards.pop();
            this.cards.unshift(movedCard);
            this.currentIndex = this.cards.length - 1;
            
            // Reset and update
            card.style.transition = '';
            card.style.opacity = '1';
            this.updateStack();
            
            // Re-attach events to new top card
            this.detachEvents(card);
            this.attachEvents();
        }, 400);
    }
    
    detachEvents(card) {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        const index = this.cards.findIndex(c => c.dataset.index === card.dataset.index);
        if (index !== -1) {
            this.cards[index] = newCard;
        }
    }
    
    renderFallback() {
        // Render regular grid for desktop
        this.container.classList.add('image-grid-fallback');
        this.container.innerHTML = this.images.map((src, i) => `
            <div class="grid-image-item">
                <img src="${src}" alt="Product image ${i + 1}">
            </div>
        `).join('');
    }
}

// Auto-initialize for product pages
if (typeof window !== 'undefined') {
    window.ImageStack = ImageStack;
}
