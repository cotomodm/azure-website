/**
 * Optimized Hero Text Splitting
 * Single instance, cached canvas, efficient resize handling
 */

class HeroTextSplitter {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.resizeTimer = null;
    this.heroElements = new Map();
  }

  // Initialize once, reuse canvas
  getContext() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
    }
    return this.context;
  }

  // Split text for a specific hero element
  splitText(heroElement) {
    if (!heroElement) return;
    
    const originalText = heroElement.dataset.text;
    if (!originalText) return;
    
    // Reset to original text first
    heroElement.innerHTML = originalText;
    
    // Get styles
    const computedStyle = window.getComputedStyle(heroElement);
    const fontSize = computedStyle.fontSize;
    const fontFamily = computedStyle.fontFamily;
    const fontWeight = computedStyle.fontWeight;
    const containerWidth = heroElement.offsetWidth;
    
    // Set up canvas for measurement
    const context = this.getContext();
    context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    
    // Split into words and measure
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = context.measureText(testLine).width;
      
      if (testWidth > containerWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Create HTML with line breaks
    heroElement.innerHTML = lines
      .map(line => `<span class="text-line">${line}</span>`)
      .join('<br>');
  }

  // Initialize all hero elements on page
  init() {
    const elements = document.querySelectorAll('[data-text]');
    
    elements.forEach(element => {
      this.heroElements.set(element.id, element);
      this.splitText(element);
    });
    
    // Single resize listener for all heroes
    this.setupResizeListener();
  }

  // Optimized resize handling
  setupResizeListener() {
    let isResizing = false;
    
    window.addEventListener('resize', () => {
      // Prevent transitions during resize
      if (!isResizing) {
        document.body.style.transition = 'none';
        isResizing = true;
      }
      
      // Debounce the actual recalculation
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.heroElements.forEach(element => {
          this.splitText(element);
        });
        
        // Re-enable transitions
        document.body.style.transition = '';
        isResizing = false;
      }, 250);
    });
  }
}

// Export for use
const heroTextSplitter = new HeroTextSplitter();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => heroTextSplitter.init());
} else {
  heroTextSplitter.init();
}

export default heroTextSplitter;