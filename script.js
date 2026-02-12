// ============================
// Innovaris Tech - FUN CARTOON JAVASCRIPT! 🎉
// Goofy animations, slideshow, mascot, and confetti!
// ============================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all the fun stuff!
  initSlideshow();
  initScrollAnimations();
  initContactForm();
  initMascot();
  initFunEffects();
});

// ============================
// EPIC SLIDESHOW! 🎬
// ============================
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;

function initSlideshow() {
  // Auto-advance every 7 seconds
  slideInterval = setInterval(() => {
    nextSlide();
  }, 7000);

  // Manual controls
  document.getElementById('nextSlide').addEventListener('click', () => {
    clearInterval(slideInterval);
    nextSlide();
    restartSlideshow();
  });

  document.getElementById('prevSlide').addEventListener('click', () => {
    clearInterval(slideInterval);
    prevSlide();
    restartSlideshow();
  });

  // Dot controls
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      goToSlide(index);
      restartSlideshow();
    });
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlide();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlide();
}

function updateSlide() {
  // Remove active from all slides and dots
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Add active to current
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  
  // Trigger confetti on slide change
  if (Math.random() > 0.7) {
    createConfetti(10);
  }
}

function restartSlideshow() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    nextSlide();
  }, 7000);
}

// ============================
// SCROLL ANIMATIONS! ✨
// ============================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation
        setTimeout(() => {
          entry.target.classList.add('visible');
          
          // Random chance for confetti
          if (Math.random() > 0.8) {
            createConfetti(5);
          }
        }, index * 100);
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ============================
// MASCOT ROBOT! 🤖
// ============================
const mascotMessages = [
  "Hi! Need help? 🤖",
  "We fix computers! 💻",
  "CCTV installed! 📹",
  "Fast WiFi! 📶",
  "Call us! 📞",
  "Thohoyandou! 🏠",
  "24-48 hours! ⚡",
  "Best prices! 💰"
];

let mascotIndex = 0;

function initMascot() {
  // Click-to-show: No automatic popups!
  // Only shows speech bubble when user clicks the robot
  
  // Show "Click me!" hint briefly on page load
  setTimeout(() => {
    const speech = document.getElementById('mascotSpeech');
    speech.textContent = "Click me! 🤖";
    speech.classList.add('show');
    setTimeout(() => {
      speech.classList.remove('show');
    }, 2500);
  }, 3000);
}

function mascotTalk() {
  const speech = document.getElementById('mascotSpeech');
  const mascotContainer = document.getElementById('mascot');
  const randomMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
  
  // Hide click hint permanently after first click
  mascotContainer.classList.add('clicked');
  
  speech.textContent = randomMessage;
  speech.classList.add('show');
  
  // Create confetti burst!
  createConfetti(20);
  
  setTimeout(() => {
    speech.classList.remove('show');
  }, 3000);
}

// Make mascotTalk global
window.mascotTalk = mascotTalk;

// ============================
// CONFETTI EFFECT! 🎊
// ============================
function createConfetti(count = 30) {
  const colors = ['#ff006e', '#39ff14', '#fff01f', '#00ffff', '#bc13fe', '#ff6b35'];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

// Make confetti global
window.createConfetti = createConfetti;

// ============================
// CONTACT FORM! 📧
// ============================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Validation
      if (!name || !email || !message) {
        showToast('Oops! Fill in all fields! 📝', 'error');
        return;
      }
      
      // Loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending... 🚀';
      submitBtn.disabled = true;
      
      // Simulate sending (replace with EmailJS in production)
      setTimeout(() => {
        // MASSIVE CONFETTI CELEBRATION! 🎉
        createConfetti(100);
        
        showToast(`Yay! Message sent, ${name}! 🎉 We'll contact you soon!`, 'success');
        form.reset();
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 1500);
    });
  }
}

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.animation = 'slideIn 0.5s ease';
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  } else {
    toast.style.background = 'linear-gradient(135deg, #bc13fe, #ff006e)';
  }
  
  // Small confetti burst
  createConfetti(15);
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// ============================
// FUN EFFECTS! 🎮
// ============================
function initFunEffects() {
  // Add wiggle effect to nav brand on hover
  const navBrand = document.querySelector('.navbar-brand');
  if (navBrand) {
    navBrand.addEventListener('mouseenter', () => {
      navBrand.style.animation = 'wiggle 0.5s ease-in-out';
    });
    navBrand.addEventListener('animationend', () => {
      navBrand.style.animation = 'wiggle 2s ease-in-out infinite';
    });
  }
  
  // Add click effects to all buttons
  document.querySelectorAll('.btn-fun').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Create mini confetti burst
      const rect = this.getBoundingClientRect();
      for (let i = 0; i < 8; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = rect.left + rect.width / 2 + 'px';
        confetti.style.top = rect.top + 'px';
        confetti.style.width = '8px';
        confetti.style.height = '8px';
        confetti.style.backgroundColor = ['#ff006e', '#39ff14', '#fff01f', '#00ffff'][Math.floor(Math.random() * 4)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'all 0.6s ease-out';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${-Math.random() * 100 - 50}px) scale(0)`;
          confetti.style.opacity = '0';
        }, 10);
        
        setTimeout(() => confetti.remove(), 600);
      }
    });
  });
  
  // Fun hover effects on cards
  document.querySelectorAll('.fun-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (Math.random() > 0.7) {
        createConfetti(3);
      }
    });
  });
  
  // Easter egg: Konami code for MEGA CONFETTI!
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      // MEGA CONFETTI EXPLOSION!
      createConfetti(200);
      showToast('🎉 KONAMI CODE ACTIVATED! MEGA CONFETTI! 🎉', 'success');
    }
  });
}

// ============================
// SMOOTH SCROLL! 🛹
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Tiny confetti on scroll
      createConfetti(5);
    }
  });
});

// ============================
// CURSOR TRAIL! ✨
// ============================
let cursorTrail = [];
let isMoving = false;

document.addEventListener('mousemove', (e) => {
  if (!isMoving) {
    isMoving = true;
    setTimeout(() => {
      if (Math.random() > 0.9) {
        const trail = document.createElement('div');
        trail.style.position = 'fixed';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.width = '12px';
        trail.style.height = '12px';
        trail.style.backgroundColor = ['#ff006e', '#39ff14', '#fff01f', '#00ffff'][Math.floor(Math.random() * 4)];
        trail.style.borderRadius = '50%';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9998';
        trail.style.opacity = '0.8';
        trail.style.transition = 'all 0.5s ease-out';
        trail.style.boxShadow = '0 0 10px currentColor';
        document.body.appendChild(trail);
        
        setTimeout(() => {
          trail.style.transform = 'scale(0) translateY(-20px)';
          trail.style.opacity = '0';
        }, 50);
        
        setTimeout(() => trail.remove(), 500);
      }
      isMoving = false;
    }, 50);
  }
});

// Console welcome message
console.log('%c 🎉 Innovaris Tech 🎉 ', 'background: linear-gradient(135deg, #ff006e, #bc13fe); color: white; font-size: 24px; font-weight: bold; padding: 15px 25px; border-radius: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
console.log('%c 🚀 Fun IT Solutions in Thohoyandou! 🚀 ', 'color: #ff006e; font-size: 16px; font-weight: bold;');
console.log('%c 🎮 Try the Konami code: ↑↑↓↓←→←→BA ', 'color: #39ff14; font-size: 14px;');
console.log('%c 💡 Click the robot mascot for confetti! ', 'color: #00ffff; font-size: 14px;');
