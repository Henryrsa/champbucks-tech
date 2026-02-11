// Simple contact form handler
const form = document.getElementById("contact-form");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submit-btn");

// EmailJS configuration - Replace with your actual IDs from EmailJS dashboard
const SERVICE_ID = 'your_service_id';
const TEMPLATE_ID = 'your_template_id';
const PUBLIC_KEY = 'your_public_key';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  // Clear previous toast
  hideToast();

  // Validate all fields
  if (!name || !email || !message) {
    showToast("Please fill in all fields.", "error");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  // Disable submit button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  // Prepare template parameters
  const templateParams = {
    from_name: name,
    from_email: email,
    message: message,
    to_name: 'Innovaris Tech'
  };

  // Send email using EmailJS
  emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
    .then(function(response) {
      showToast(`Thank you, ${name}. Your message has been sent successfully!`, "success");
      form.reset();
    }, function(error) {
      showToast("Sorry, there was an error sending your message. Please try again later.", "error");
      console.error('EmailJS error:', error);
    })
    .finally(function() {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Theme toggle functionality
const toggle = document.getElementById('theme-toggle');
const body = document.body;
toggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
});

// Responsive navbar toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Toast notification functions
function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  setTimeout(hideToast, 5000); // Auto hide after 5 seconds
}

function hideToast() {
  toast.style.display = 'none';
}
