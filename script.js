// ============================
// Champbucks - FUN CARTOON JAVASCRIPT! 🎉
// Goofy animations, slideshow, mascot, and confetti!
// ============================
//
// 🚨 SETUP REQUIRED FOR EMAIL FUNCTIONALITY:
// 1. Sign up at https://www.emailjs.com/
// 2. Create an email service and email template
// 3. Replace these values in initEmailJS() function:
//    - "YOUR_PUBLIC_KEY" → Your EmailJS public key
//    - "YOUR_SERVICE_ID" → Your EmailJS service ID  
//    - "YOUR_TEMPLATE_ID" → Your EmailJS template ID
// 4. Test your forms and they'll send real emails!
//
// 💡 TIP: The form will work in demo mode without EmailJS setup
//     (Data stored in localStorage for testing)
// ============================

document.addEventListener('DOMContentLoaded', function() {
  try {
    // Migrate localStorage data from old Innovaris keys to new Champbucks keys
    migrateLocalStorageData();
    
    // Initialize EmailJS first
    initEmailJS();
    
    // Initialize all the fun stuff!
    initSlideshow();
    initScrollAnimations();
    initContactForm();
    initMascot();
    initFunEffects();
    initSmoothScroll();
    initCursorTrail();
    
    console.log('🎉 Champbucks initialized successfully!');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    // Try to initialize critical components even if some fail
    try {
      initContactForm();
    } catch (contactError) {
      console.error('Contact form initialization failed:', contactError);
    }
  }
});

// ============================
// EPIC SLIDESHOW! 🎬
// ============================
let currentSlide = 0;
let slideInterval;
let slides, dots, totalSlides;

function initSlideshow() {
  try {
    // Safe DOM queries with null checks
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');
    totalSlides = slides ? slides.length : 0;

    if (!slides || slides.length === 0) {
      console.warn('No slides found - slideshow disabled');
      return;
    }

    // Auto-advance every 10 seconds
    slideInterval = setInterval(() => {
      nextSlide();
    }, 10000);

    // Manual controls with null checks
    const nextBtn = document.getElementById('nextSlide');
    const prevBtn = document.getElementById('prevSlide');
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        nextSlide();
        restartSlideshow();
      });
    } else {
      console.warn('Next slide button not found');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        prevSlide();
        restartSlideshow();
      });
    } else {
      console.warn('Previous slide button not found');
    }

    // Dot controls with safe iteration
    if (dots && dots.length > 0) {
      dots.forEach((dot, index) => {
        if (dot) {
          dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(index);
            restartSlideshow();
          });
        }
      });
    } else {
      console.warn('No slide dots found');
    }
  } catch (error) {
    console.error('Slideshow initialization error:', error);
  }
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
  try {
    // Remove active from all slides and dots (safe iteration)
    if (slides && slides.length > 0) {
      slides.forEach(slide => {
        if (slide && slide.classList) {
          slide.classList.remove('active');
        }
      });
    }

    if (dots && dots.length > 0) {
      dots.forEach(dot => {
        if (dot && dot.classList) {
          dot.classList.remove('active');
        }
      });
    }
    
    // Add active to current (with bounds checking)
    if (slides && slides[currentSlide]) {
      slides[currentSlide].classList.add('active');
    }
    
    if (dots && dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
    
    // Trigger confetti on slide change
    if (Math.random() > 0.7) {
      createConfetti(10);
    }
  } catch (error) {
    console.error('Error updating slide:', error);
  }
}

function restartSlideshow() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    nextSlide();
  }, 10000);
}

// ============================
// SCROLL ANIMATIONS! ✨
// ============================
function initScrollAnimations() {
  try {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      try {
        entries.forEach((entry, index) => {
          if (entry && entry.isIntersecting && entry.target) {
            // Stagger animation with error handling
            setTimeout(() => {
              try {
                if (entry.target && entry.target.classList) {
                  entry.target.classList.add('visible');
                  
                  // Random chance for confetti
                  if (Math.random() > 0.8) {
                    createConfetti(5);
                  }
                }
              } catch (animError) {
                console.warn('Error animating element:', animError);
              }
            }, index * 100);
            
            try {
              observer.unobserve(entry.target);
            } catch (unobserveError) {
              console.warn('Error unobserving element:', unobserveError);
            }
          }
        });
      } catch (entriesError) {
        console.error('Error processing intersection entries:', entriesError);
      }
    }, observerOptions);

    // Observe all animated elements with safe iteration
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements && animatedElements.length > 0) {
      animatedElements.forEach(el => {
        if (el) {
          observer.observe(el);
        }
      });
    } else {
      console.warn('No scroll-animated elements found');
    }
  } catch (error) {
    console.error('Scroll animations initialization error:', error);
  }
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
  try {
    // Check if mascot elements exist
    const speech = document.getElementById('mascotSpeech');
    const mascotContainer = document.getElementById('mascot');
    
    if (!speech || !mascotContainer) {
      console.warn('Mascot elements not found - mascot disabled');
      return;
    }
    
    // Click-to-show: No automatic popups!
    // Only shows speech bubble when user clicks the robot
    
    // Show "Click me!" hint briefly on page load
    setTimeout(() => {
      try {
        speech.textContent = "Click me! 🤖";
        speech.classList.add('show');
        setTimeout(() => {
          if (speech.classList) {
            speech.classList.remove('show');
          }
        }, 2500);
      } catch (hintError) {
        console.warn('Error showing mascot hint:', hintError);
      }
    }, 3000);
  } catch (error) {
    console.error('Mascot initialization error:', error);
  }
}

function mascotTalk() {
  try {
    const speech = document.getElementById('mascotSpeech');
    const mascotContainer = document.getElementById('mascot');
    
    if (!speech || !mascotContainer) {
      console.warn('Mascot elements not found for talk');
      return;
    }
    
    const randomMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
    
    // Hide click hint permanently after first click
    if (mascotContainer.classList) {
      mascotContainer.classList.add('clicked');
    }
    
    speech.textContent = randomMessage;
    if (speech.classList) {
      speech.classList.add('show');
    }
    
    // Create confetti burst!
    createConfetti(20);
    
    setTimeout(() => {
      if (speech.classList) {
        speech.classList.remove('show');
      }
    }, 3000);
  } catch (error) {
    console.error('Error in mascot talk:', error);
  }
}

// Make mascotTalk global
window.mascotTalk = mascotTalk;

// ============================
// CONFETTI EFFECT! 🎊 (Memory Leak Fixed!)
// ============================
const confettiElements = new Set();
const MAX_CONFETTI = 500; // Prevent excessive confetti
let cleanupInterval;

function createConfetti(count = 30) {
  try {
    // Don't create too much confetti at once
    if (confettiElements.size > MAX_CONFETTI) {
      console.warn('Max confetti reached, skipping creation');
      return;
    }
    
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
      
      // Add data attribute for tracking
      confetti.dataset.confettiId = Date.now() + '_' + i;
      
      document.body.appendChild(confetti);
      confettiElements.add(confetti);
      
      // Remove after animation with error handling
      const removalTimeout = setTimeout(() => {
        try {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
          confettiElements.delete(confetti);
        } catch (error) {
          console.warn('Error removing confetti:', error);
        }
      }, 3000);
      
      // Store timeout for potential cleanup
      confetti.dataset.timeoutId = removalTimeout;
    }
    
    // Start cleanup interval if not already running
    if (!cleanupInterval) {
      startConfettiCleanup();
    }
    
  } catch (error) {
    console.error('Error creating confetti:', error);
  }
}

// Cleanup orphaned confetti elements
function startConfettiCleanup() {
  cleanupInterval = setInterval(() => {
    try {
      const allConfetti = document.querySelectorAll('.confetti');
      const staleElements = [];
      
      allConfetti.forEach(confetti => {
        if (!confettiElements.has(confetti)) {
          staleElements.push(confetti);
        }
      });
      
      // Remove stale elements
      staleElements.forEach(element => {
        try {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          console.warn('Error cleaning up stale confetti:', error);
        }
      });
      
      // Stop interval if no active confetti
      if (confettiElements.size === 0 && staleElements.length === 0) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    } catch (error) {
      console.error('Confetti cleanup error:', error);
    }
  }, 2000);
}

// Force cleanup all confetti
function cleanupAllConfetti() {
  try {
    confettiElements.forEach(confetti => {
      try {
        const timeoutId = confetti.dataset.timeoutId;
        if (timeoutId) {
          clearTimeout(parseInt(timeoutId));
        }
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      } catch (error) {
        console.warn('Error removing individual confetti:', error);
      }
    });
    confettiElements.clear();
    
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  } catch (error) {
    console.error('Error in confetti cleanup:', error);
  }
}

// Make confetti functions global
window.createConfetti = createConfetti;
window.cleanupAllConfetti = cleanupAllConfetti;

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', cleanupAllConfetti);

// ============================
// EMAILJS CONFIGURATION! 📧
// ============================
let emailJSInitialized = false;

function initEmailJS() {
  try {
    // Initialize EmailJS with your service details
    // IMPORTANT: Replace these with your actual EmailJS credentials
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
    emailJSInitialized = true;
    console.log('EmailJS initialized successfully!');
  } catch (error) {
    console.warn('EmailJS initialization failed, using fallback mode:', error);
    emailJSInitialized = false;
  }
}

// ============================
// CONTACT FORM! 📧
// ============================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  
  if (!form || !submitBtn) {
    console.warn('Contact form elements not found');
    return;
  }
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const service = document.getElementById('service');
      const message = document.getElementById('message');
      
      // Validate all required fields exist
      if (!name || !email || !message) {
        showToast('Oops! Form elements missing! 📝', 'error');
        return;
      }
      
      const nameValue = name.value.trim();
      const emailValue = email.value.trim();
      const phoneValue = phone ? phone.value.trim() : '';
      const serviceValue = service ? service.value : '';
      const messageValue = message.value.trim();
      
      // Enhanced validation
      if (!nameValue || !emailValue || !messageValue) {
        showToast('Oops! Fill in all required fields! 📝', 'error');
        highlightRequiredFields();
        return;
      }
      
      if (!validateEmail(emailValue)) {
        showToast('Please enter a valid email address! 📧', 'error');
        email.focus();
        return;
      }
      
      if (phoneValue && !validatePhone(phoneValue)) {
        showToast('Please enter a valid phone number! 📱', 'error');
        phone.focus();
        return;
      }
      
      // Loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending... 🚀';
      submitBtn.disabled = true;
      
      // Prepare form data
      const formData = {
        name: nameValue,
        email: emailValue,
        phone: phoneValue,
        service: serviceValue,
        message: messageValue,
        timestamp: new Date().toISOString()
      };
      
      // Try to send via EmailJS first
      if (emailJSInitialized) {
        try {
          await sendEmailWithEmailJS(formData);
          // MASSIVE CONFETTI CELEBRATION! 🎉
          createConfetti(100);
          showToast(`Message sent successfully, ${nameValue}! 🎉 We'll contact you soon!`, 'success');
          form.reset();
        } catch (emailError) {
          console.error('EmailJS failed:', emailError);
          // Fallback to simulation if EmailJS fails
          simulateFormSubmission(formData, nameValue);
        }
      } else {
        // Fallback simulation mode
        simulateFormSubmission(formData, nameValue);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      showToast('Oops! Something went wrong. Please try again! 🔄', 'error');
    } finally {
      // Reset button state
      submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Send Message! 🚀';
      submitBtn.disabled = false;
    }
  });
}

// Enhanced email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (supports South African format)
function validatePhone(phone) {
  const phoneRegex = /^(\+27|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Highlight required fields that are empty
function highlightRequiredFields() {
  const requiredFields = ['name', 'email', 'message'];
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && !field.value.trim()) {
      field.style.borderColor = '#ef4444';
      field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
      setTimeout(() => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
      }, 3000);
    }
  });
}

// Send email using EmailJS
async function sendEmailWithEmailJS(formData) {
  try {
    // Replace with your actual EmailJS service and template IDs
    await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      service: formData.service,
      message: formData.message,
      timestamp: formData.timestamp
    });
  } catch (error) {
    throw new Error(`EmailJS failed: ${error.message}`);
  }
}

// Fallback simulation for development/testing
function simulateFormSubmission(formData, name) {
  console.log('🚀 Form Data Submitted:', formData);
  
  // Store in localStorage for development testing
  const submissions = JSON.parse(localStorage.getItem('champbucks_submissions') || '[]');
  submissions.push(formData);
  localStorage.setItem('champbucks_submissions', JSON.stringify(submissions));
  
  setTimeout(() => {
    createConfetti(50);
    showToast(`Demo mode: Message received, ${name}! 🎉 (Check console for data)`, 'success');
  }, 1000);
}

// Toast notification
function showToast(message, type = 'success') {
  try {
    const toast = document.getElementById('toast');
    if (!toast) {
      console.warn('Toast element not found, using fallback alert');
      alert(message);
      return;
    }
    
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
      try {
        toast.style.display = 'none';
      } catch (hideError) {
        console.warn('Error hiding toast:', hideError);
      }
    }, 4000);
  } catch (error) {
    console.error('Toast error:', error);
    alert(message); // Fallback to browser alert
  }
}

// ============================
// FUN EFFECTS! 🎮
// ============================
function initFunEffects() {
  try {
    // Add wiggle effect to nav brand on hover
    const navBrand = document.querySelector('.navbar-brand');
    if (navBrand) {
      navBrand.addEventListener('mouseenter', () => {
        try {
          navBrand.style.animation = 'wiggle 0.5s ease-in-out';
        } catch (animError) {
          console.warn('Error setting wiggle animation:', animError);
        }
      });
      navBrand.addEventListener('animationend', () => {
        try {
          navBrand.style.animation = 'wiggle 2s ease-in-out infinite';
        } catch (animError) {
          console.warn('Error resetting wiggle animation:', animError);
        }
      });
    }
    
    // Add click effects to all buttons
    const funButtons = document.querySelectorAll('.btn-fun');
    if (funButtons && funButtons.length > 0) {
      funButtons.forEach(btn => {
        if (btn) {
          btn.addEventListener('click', function(e) {
            try {
              // Create mini confetti burst
              const rect = this.getBoundingClientRect();
              const colors = ['#ff006e', '#39ff14', '#fff01f', '#00ffff'];
              
              for (let i = 0; i < 8; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = rect.left + rect.width / 2 + 'px';
                confetti.style.top = rect.top + 'px';
                confetti.style.width = '8px';
                confetti.style.height = '8px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.transition = 'all 0.6s ease-out';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                  try {
                    confetti.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${-Math.random() * 100 - 50}px) scale(0)`;
                    confetti.style.opacity = '0';
                  } catch (transformError) {
                    // Ignore transform errors
                  }
                }, 10);
                
                setTimeout(() => {
                  try {
                    if (confetti.parentNode) {
                      confetti.parentNode.removeChild(confetti);
                    }
                  } catch (removeError) {
                    // Ignore removal errors
                  }
                }, 600);
              }
            } catch (confettiError) {
              console.warn('Error creating button confetti:', confettiError);
            }
          });
        }
      });
    }
    
    // Fun hover effects on cards
    const funCards = document.querySelectorAll('.fun-card');
    if (funCards && funCards.length > 0) {
      funCards.forEach(card => {
        if (card) {
          card.addEventListener('mouseenter', () => {
            try {
              if (Math.random() > 0.7) {
                createConfetti(3);
              }
            } catch (hoverConfettiError) {
              console.warn('Error creating hover confetti:', hoverConfettiError);
            }
          });
        }
      });
    }
    
    // Easter egg: Konami code for MEGA CONFETTI!
    initKonamiCode();
    
  } catch (error) {
    console.error('Fun effects initialization error:', error);
  }
}

// Separate function for Konami code to keep it clean
function initKonamiCode() {
  try {
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', (e) => {
      try {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
          // MEGA CONFETTI EXPLOSION!
          createConfetti(200);
          showToast('🎉 KONAMI CODE ACTIVATED! MEGA CONFETTI! 🎉', 'success');
        }
      } catch (konamiError) {
        console.warn('Konami code error:', konamiError);
      }
    });
  } catch (error) {
    console.error('Konami code initialization error:', error);
  }
}

// ============================
// SMOOTH SCROLL! 🛹
// ============================
function initSmoothScroll() {
  try {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors && anchors.length > 0) {
      anchors.forEach(anchor => {
        if (anchor) {
          anchor.addEventListener('click', function(e) {
            try {
              e.preventDefault();
              const targetId = this.getAttribute('href');
              const target = document.querySelector(targetId);
              
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
              } else {
                console.warn('Scroll target not found:', targetId);
              }
            } catch (scrollError) {
              console.error('Smooth scroll error:', scrollError);
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Smooth scroll initialization error:', error);
  }
}

// ============================
// CURSOR TRAIL! ✨
// ============================
let cursorTrail = [];
let isMoving = false;

function initCursorTrail() {
  try {
    document.addEventListener('mousemove', (e) => {
      if (!isMoving) {
        isMoving = true;
        setTimeout(() => {
          try {
            if (Math.random() > 0.9) {
              const colors = ['#ff006e', '#39ff14', '#fff01f', '#00ffff'];
              const trail = document.createElement('div');
              trail.style.position = 'fixed';
              trail.style.left = e.clientX + 'px';
              trail.style.top = e.clientY + 'px';
              trail.style.width = '12px';
              trail.style.height = '12px';
              trail.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
              trail.style.borderRadius = '50%';
              trail.style.pointerEvents = 'none';
              trail.style.zIndex = '9998';
              trail.style.opacity = '0.8';
              trail.style.transition = 'all 0.5s ease-out';
              trail.style.boxShadow = '0 0 10px currentColor';
              document.body.appendChild(trail);
              
              setTimeout(() => {
                try {
                  trail.style.transform = 'scale(0) translateY(-20px)';
                  trail.style.opacity = '0';
                } catch (transformError) {
                  // Ignore transform errors
                }
              }, 50);
              
              setTimeout(() => {
                try {
                  if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                  }
                } catch (removeError) {
                  // Ignore removal errors
                }
              }, 500);
            }
          } catch (trailError) {
            console.warn('Error creating cursor trail:', trailError);
          }
          isMoving = false;
        }, 50);
      }
    });
  } catch (error) {
    console.error('Cursor trail initialization error:', error);
  }
}

// Migrate localStorage data from Innovaris to Champbucks
function migrateLocalStorageData() {
  try {
    // Check for old Innovaris keys and migrate to Champbucks
    const oldSubmissionsKey = 'innovaris_submissions';
    const newSubmissionsKey = 'champbucks_submissions';
    
    const oldData = localStorage.getItem(oldSubmissionsKey);
    if (oldData) {
      const existingNewData = localStorage.getItem(newSubmissionsKey);
      if (!existingNewData) {
        // Only migrate if new key doesn't exist yet
        localStorage.setItem(newSubmissionsKey, oldData);
        console.log('✅ Migrated data from innovaris_submissions to champbucks_submissions');
      }
      // Remove old key after migration
      localStorage.removeItem(oldSubmissionsKey);
      console.log('🗑️ Removed old innovaris_submissions key');
    }
    
    // Also migrate admin session if it exists
    const oldSessionKey = 'innovaris_admin_session';
    const newSessionKey = 'champbucks_admin_session';
    
    const oldSession = localStorage.getItem(oldSessionKey);
    if (oldSession) {
      const existingNewSession = localStorage.getItem(newSessionKey);
      if (!existingNewSession) {
        localStorage.setItem(newSessionKey, oldSession);
        console.log('✅ Migrated admin session');
      }
      localStorage.removeItem(oldSessionKey);
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Console welcome message
console.log('%c 🎉 Champbucks 🎉 ', 'background: linear-gradient(135deg, #ff006e, #bc13fe); color: white; font-size: 24px; font-weight: bold; padding: 15px 25px; border-radius: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
console.log('%c 🚀 Fun IT Solutions in Thohoyandou! 🚀 ', 'color: #ff006e; font-size: 16px; font-weight: bold;');
console.log('%c 🎮 Try the Konami code: ↑↑↓↓←→←→BA ', 'color: #39ff14; font-size: 14px;');
console.log('%c 💡 Click the robot mascot for confetti! ', 'color: #00ffff; font-size: 14px;');
