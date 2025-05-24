/**
 * Kutumbinfo Main JavaScript
 * Contains navigation, animations, and component loading functionality
 * Optimized for performance and maintainability
 */

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// ----- Error Handling and Validation -----

/**
 * Global error handler
 */
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates form inputs
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - Whether form is valid
 */
function validateForm(form) {
    const emailInputs = form.querySelectorAll('input[type="email"]');
    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;

    // Check required fields
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    // Validate email fields
    emailInputs.forEach(input => {
        if (input.value && !isValidEmail(input.value)) {
            input.classList.add('error');
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Shows error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// ----- Core Utility Functions -----

/**
 * Gets the base path for navigation based on current URL
 */
function getBasePath() {
  const path = window.location.pathname;
  return (path.includes('/Services/') || 
          path.includes('/Expertise/') || 
          path.includes('/Products/')) ? '../' : './';
}

/**
 * Scrolls to top of page
 */
function scrollToTop(behavior = 'instant') {
  window.scrollTo({
    top: 0,
    behavior
  });
}

/**
 * Navigates to a page with optional scroll to top
 */
function navigateTo(page, scrollTop = true) {
  if (scrollTop) {
    scrollToTop();
  }
  window.location.href = getBasePath() + page;
}

// ----- Navigation Functions -----

/**
 * Toggles mobile menu state
 */
function toggleMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');
  const body = document.body;
  const navLinks = document.querySelector('.nav-links');

  // Toggle the menu open/closed state
  menuToggle.classList.toggle('open');
  navbar.classList.toggle('show');
  body.classList.toggle('menu-open');
  
  // Check if we're closing the menu
  if (!navbar.classList.contains('show')) {
    // Close any open dropdowns when toggling the menu
    const activeDropdowns = document.querySelectorAll('.dropdown.active');
    activeDropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
      dropdown.style.zIndex = ''; // Reset any custom z-index
      const dropdownContent = dropdown.querySelector('.dropdown-content');
      if (dropdownContent) {
        hideDropdownContent(dropdownContent);
        
        // Also reset styles on dropdown boxes
        const dropdownBoxes = dropdownContent.querySelectorAll('.dropdown-box');
        dropdownBoxes.forEach(box => {
          box.style.display = '';
          box.style.visibility = '';
          box.style.opacity = '';
        });
      }
    });
    
    // Ensure nav-links is hidden when menu is closed
    if (navLinks) {
      navLinks.style.display = 'none';
      navLinks.style.opacity = '0';
      navLinks.style.transform = 'translateY(-100%)';
    }
  } else {
    // Force display of nav-links when showing the menu
    if (navLinks) {
      navLinks.style.display = 'flex';
      navLinks.style.opacity = '1';
      navLinks.style.transform = 'translateY(0)';
    }
  }
}

/**
 * Toggles dropdown directly from HTML
 * @param {HTMLElement} element - The dropdown toggle element
 */
function toggleDropdown(element) {
  const dropdown = element.closest('.dropdown');
  if (!dropdown) return false;
  
  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;
  
  // Get all dropdowns to track their order
  const allDropdowns = Array.from(document.querySelectorAll('.dropdown'));
  const currentIndex = allDropdowns.indexOf(dropdown);
  
  // Get the dropdown text to determine if it's Products or Expertise
  const dropdownText = element.textContent.trim();
  const isProducts = dropdownText === 'Products';
  const isExpertise = dropdownText === 'Expertise';
  
  // For mobile view, special handling
  if (isMobile) {
    // If Expertise is being toggled and already active, hide Products too
    if (isExpertise && dropdown.classList.contains('active')) {
      const productsDropdown = document.querySelector('.dropdown:nth-child(4)');
      if (productsDropdown && productsDropdown.classList.contains('active')) {
        productsDropdown.classList.remove('active');
        const productsContent = productsDropdown.querySelector('.dropdown-content');
        if (productsContent) {
          hideDropdownContent(productsContent);
        }
      }
    }
    
    // If Products is clicked
    if (isProducts) {
      // Ensure Expertise is open
      const expertiseDropdown = document.querySelector('.dropdown:nth-child(3)');
      if (expertiseDropdown && !expertiseDropdown.classList.contains('active')) {
        // Open Expertise dropdown automatically
        expertiseDropdown.classList.add('active');
        const expertiseContent = expertiseDropdown.querySelector('.dropdown-content');
        if (expertiseContent) {
          showDropdownContent(expertiseContent, true);
        }
      }
    }
  }
  
  
  // Toggle current dropdown
  dropdown.classList.toggle('active');
  
  // Get the dropdown content
  const dropdownContent = dropdown.querySelector('.dropdown-content');
  if (dropdownContent) {
    if (dropdown.classList.contains('active')) {
      // Set z-index based on dropdown position to ensure proper stacking
      if (isMobile) {
        // For Products, set a lower z-index than Expertise
        if (isProducts) {
          dropdown.style.zIndex = '3';
          // Find Expertise dropdown and ensure it has higher z-index
          allDropdowns.forEach(d => {
            const toggle = d.querySelector('.dropdown-toggle');
            if (toggle && toggle.textContent.trim() === 'Expertise') {
              d.style.zIndex = '4';
            }
          });
        } else {
          dropdown.style.zIndex = 5 - currentIndex;
        }
      }
      
      showDropdownContent(dropdownContent, isMobile);
      
      // Ensure the dropdown content is visible in the viewport on mobile
      if (isMobile) {
        const rect = dropdownContent.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.bottom > viewportHeight) {
          dropdownContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    } else {
      hideDropdownContent(dropdownContent);
    }
  }
  
  // Prevent default action
  return false;
}

/**
 * Handles navbar scroll effect
 */
function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const scrollPosition = window.scrollY;
  
  if (scrollPosition > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/**
 * Initializes particles for sections with gradient backgrounds
 */
function initGradientSectionParticles() {
  // Particles functionality removed
  return;
}

// ----- Navigation Click Handlers -----

// Main navigation handlers
function handleHomeClick() { navigateTo('index.html'); }
function handleWhyKutumbinfoClick() { navigateTo('why_kutumbinfo.html', false); }
function handleWorkWithUsClick() { navigateTo('work_with_us.html', false); }

// Services navigation handlers
function handleWebDevelopmentClick() { navigateTo('Services/web_dev.html'); }
function handleMobileAppDevClick() { navigateTo('Services/mob_app.html'); }
function handleCustomSoftDevClick() { navigateTo('Services/custom_soft.html'); }
function handleUIUXDesignClick() { navigateTo('Services/ui_ux_design.html'); }
function handleAPIdevClick() { navigateTo('Services/api_dev.html'); }
function handleMaintainanceSupportClick() { navigateTo('Services/maintain_support.html'); }

// Expertise navigation handlers
function goToAngular() { navigateTo('Expertise/angular.html'); }
function goToReact() { navigateTo('Expertise/react.html'); }
function goToVuejs() { navigateTo('Expertise/vuejs.html'); }
function goToWordpress() { navigateTo('Expertise/wordpress.html'); }
function goToFlutter() { navigateTo('Expertise/flutter.html'); }
function goToJava() { navigateTo('Expertise/java.html'); }
function goToNodejs() { navigateTo('Expertise/nodejs.html'); }
function goToPhp() { navigateTo('Expertise/php.html'); }

// Products navigation handlers
function goToNonFintech() { navigateTo('Products/non_fintech.html'); }
function goToFintech() { navigateTo('Products/fintech.html'); }

/**
 * Handle contact form navigation when accessed via hash fragment
 */
function handleContactFormNavigation() {
  const contactForm = document.querySelector('#contact-form');
  if (!contactForm) return;
  
  // Make the section visible immediately
  contactForm.classList.add('active');
  const formItems = contactForm.querySelectorAll('.reveal-item');
  formItems.forEach(item => item.classList.add('active'));
  
  // Scroll after everything is loaded and visible
  setTimeout(() => {
    const headerHeight = document.querySelector('header') ? 
      document.querySelector('header').offsetHeight : 0;
    
    // Scroll to contact form
    window.scrollTo({
      top: contactForm.offsetTop - headerHeight - 20,
      behavior: 'auto'
    });
  }, 800); // Longer delay for cross-page navigation
}

// ----- Navbar Initialization Functions -----

/**
 * Initializes navbar functionality
 */
function initializeNavbar() {
  // Initialize menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    // Remove any existing click handlers by cloning the element
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    
    // Add a fresh click handler
    newMenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu();
    });
  }
  
  
  // Close menu on navigation link click
  const navLinks = document.querySelectorAll('.nav-links a:not(.dropdown-toggle)');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          toggleMobileMenu();
        }, 100);
      }
    });
  });
 
  // Setup mobile dropdown box click behavior
  setupMobileDropdownBoxes();
}

/**
 * Sets up click behavior for mobile dropdown boxes
 */
function setupMobileDropdownBoxes() {
  // This function handles dropdown box interactions on mobile
  const dropdownBoxes = document.querySelectorAll('.dropdown-box');
  if (!dropdownBoxes.length) return;
  
  dropdownBoxes.forEach(box => {
    // Ensure click events only fire once by removing and re-adding
    const newBox = box.cloneNode(true);
    box.parentNode.replaceChild(newBox, box);
    
    // Add the event listener to the new element
    newBox.addEventListener('click', function(e) {
      // Prevent event from bubbling to parent elements
      e.stopPropagation();
    });
  });
}

// ----- Animation Functions -----

/**
 * Creates particle background effect for hero sections
 */
function createParticles() {
  // Find all particle containers across the page
  const particlesContainers = document.querySelectorAll('.particles-container');
  if (!particlesContainers.length) return;
  
  // Loop through each container and create particles
  particlesContainers.forEach(particlesContainer => {
    // Clear any existing particles first
    particlesContainer.innerHTML = '';
    
    // Create 20 particles with random sizes, positions and animations
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random size between 2px and 5px (smaller range than before)
      const size = Math.random() * 3 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      
      // Random animation delay for more natural effect
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      // Random animation duration between 8s and 20s for varied speeds
      particle.style.animationDuration = `${Math.random() * 12 + 8}s`;
      
      // Add randomized movement direction through custom animation name
      const animations = ['floatParticleUp', 'floatParticleDown', 'floatParticleLeft', 'floatParticleRight', 'floatParticleDiagonal'];
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      particle.style.animationName = randomAnimation;
      
      // Add different colors for variety with more transparency
      if (i % 3 === 0) {
        // Blue particles (more transparent)
        particle.style.backgroundColor = 'rgba(25, 41, 60, 0.3)';
      } else if (i % 3 === 1) {
        // White particles (more transparent)
        particle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
      } else {
        // Brand color particles (more transparent)
        particle.style.backgroundColor = 'rgba(57, 226, 157, 0.3)';
      }
      
      // Add particle to container
      particlesContainer.appendChild(particle);
    }
  });
}

/**
 * Initializes scroll animations
 */
function initScrollAnimations() {
  if ('IntersectionObserver' in window) {
    console.log("Using IntersectionObserver for reveal animations");
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('active');
            
            // Animate children with staggered delay
            const items = target.querySelectorAll('.reveal-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('active');
              }, 100 + (index * 100)); // Staggered delay based on index
            });
            
            // Unobserve after animation is triggered
            observer.unobserve(target);
          }
        });
      }, 
      {
        threshold: 0.1 // 10% of the element must be visible
      }
    );

    // Observe all sections
    document.querySelectorAll('.reveal-section').forEach(section => {
      observer.observe(section);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    console.log("Using scroll event fallback for reveal animations");
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
  }
}

/**
 * Initializes all counter animations on the page
 */
function initializeCounters() {
  const counters = document.querySelectorAll(".counter");
  const counterSection = document.querySelector(".counter-section");

  if (!counterSection || counters.length === 0) return;

  const counterObserver = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        counters.forEach(counter => animateCounter(counter));
        counterObserver.unobserve(entries[0].target);
      }
    },
    { threshold: 0.5 }
  );

  counterObserver.observe(counterSection);
}

/**
 * Animates a counter element from 0 to target value
 */
function animateCounter(counter) {
  counter.textContent = '0';
  
  const target = +counter.dataset.target;
  const duration = 5000; // 5 seconds duration
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easedProgress * target);
    counter.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target;
    }
  }
  
  requestAnimationFrame(updateCounter);
}

/**
 * Handles the display of FAQs on the Work With Us page
 * This function is deprecated since we've switched to a static FAQ layout
 * Keeping as a comment for reference
 */
/* 
function initializeFAQs() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (!faqItems.length) return;
  
  // Add click event listener to each FAQ question
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (!question || !answer) return;
    
    // Initialize FAQs to be closed
    answer.style.display = 'none';
    
    // Add click handler to question
    question.addEventListener('click', () => {
      // Toggle answer visibility
      const isOpen = answer.style.display === 'block';
      
      // Close all other FAQs
      document.querySelectorAll('.faq-answer').forEach(a => {
        a.style.display = 'none';
      });
      
      // Toggle current FAQ
      answer.style.display = isOpen ? 'none' : 'block';
      
      // Add/remove active class for styling
      faqItems.forEach(fi => fi.classList.remove('active'));
      
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}
*/

/**
 * Handles contact form submission on the Work With Us page
 */
function initializeContactForm() {
  const contactForm = document.querySelector('.inquiry-form');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic form validation
    const name = contactForm.querySelector('#name').value.trim();
    const company = contactForm.querySelector('#company').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();
    
    if (!name || !company || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Form would be submitted to backend here
    alert('Thank you for your inquiry! We will get back to you within 24 hours.');
    
    // Reset form
    contactForm.reset();
  });
}

/**
 * Enhances the Why Work With Us section with staggered animations
 */
function enhanceWorkWithUsSection() {
  const benefitCards = document.querySelectorAll('.benefit-card');
  
  if (!benefitCards.length) return;
  
  // Add staggered animation delays to benefit cards
  benefitCards.forEach((card, index) => {
    // Set staggered animation delays
    card.style.transitionDelay = `${index * 0.1}s`;
    
    // Add hover interaction for desktop
    if (window.innerWidth > 768) {
      card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.benefit-icon');
        if (icon) {
          icon.style.transform = 'rotate(15deg) scale(1.05)';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.benefit-icon');
        if (icon) {
          icon.style.transform = '';
        }
      });
    }
  });
}

/**
 * Handles the loading of navbar and footer for services pages
 */
function loadNavbarAndFooter() {
  // Load navbar
  fetch('../navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;
        
      // After the navbar is loaded, attach event handlers to it
      initializeNavbar();
    });
  
  // Load footer
  fetch('../footer.html')
    .then(response => response.text())
    .then(data => {
      // Fix image paths in footer for services pages
      data = data.replace(/src="images\//g, 'src="../images/');
      
      document.getElementById('footer-placeholder').innerHTML = data;
      
      // Further fix social icon paths specifically
      setTimeout(function() {
        // Fix footer logo
        const footerLogo = document.querySelector('.footer-logo img');
        if (footerLogo && !footerLogo.src.includes('../images/')) {
          footerLogo.src = '../images/logo kutumbinfo13.png';
        }
        
        // Fix social media icons
        const socialIcons = document.querySelectorAll('.social-icons img');
        socialIcons.forEach(icon => {
          // Extract the filename
          const srcParts = icon.src.split('/');
          const filename = srcParts[srcParts.length - 1];
          
          // Update with correct path
          icon.src = `../images/social_icon/${filename}`;
        });
      }, 300);
    });
}

/**
 * Adds click event listeners to "Talk to our team" buttons
 */
function initializeTalkToTeamButtons() {
  const talkButtons = document.querySelectorAll('.talk-to-team, .cta-button');
  
  talkButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (button.getAttribute('href') === null) {
        e.preventDefault();
        window.location.href = '../Services/contact.html';
      }
    });
  });
}

/**
 * Handles smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      if (targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/**
 * Adds active state to navbar based on the current page
 */
function setActiveNavbarItem() {
  setTimeout(() => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      
      if (currentPath.includes(linkPath) && linkPath !== '/') {
        link.classList.add('active');
      } else if (currentPath === '/' && linkPath === '/') {
        link.classList.add('active');
      }
    });
  }, 1000); // Delay to ensure navbar is loaded
}

// ----- Product Page Specific Functions -----

/**
 * Initialize fintech specific features
 */
function initFintechFeatures() {
    // Initialize tabs functionality
    initTabs();
    
    // Initialize slider
    initSlider();
    
    // Initialize forms
    initForms();
}

/**
 * Initialize product particles using ParticlesJS library
 */
function createProductParticles() {
  // Particles functionality removed
  return;
}

/**
 * Switch between content tabs
 */
function switchTab(tabName) {
    // Find all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    // First, remove active class from all tabs and buttons
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Then add active class to the selected tab and button
    document.getElementById(tabName + '-content').classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

/**
 * Initialize product tabs
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productTabs = document.querySelectorAll('.product-tab');
    
    if (tabButtons.length === 0) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            productTabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show the corresponding tab
            const tabId = this.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

/**
 * Initialize case study slider
 */
function initSlider() {
    const sliderDots = document.querySelectorAll('.slider-dot');
    const sliderSlides = document.querySelectorAll('.case-study-slide');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    if (sliderDots.length === 0 || sliderSlides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        // Hide all slides
        sliderSlides.forEach(slide => slide.classList.remove('active'));
        // Remove active class from all dots
        sliderDots.forEach(dot => dot.classList.remove('active'));
        
        // Show the selected slide
        sliderSlides[index].classList.add('active');
        // Add active class to the corresponding dot
        sliderDots[index].classList.add('active');
        
        currentSlide = index;
    }
    
    // Dot click event
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // Previous arrow click event
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            let newIndex = currentSlide - 1;
            if (newIndex < 0) newIndex = sliderSlides.length - 1;
            showSlide(newIndex);
        });
    }
    
    // Next arrow click event
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            let newIndex = currentSlide + 1;
            if (newIndex >= sliderSlides.length) newIndex = 0;
            showSlide(newIndex);
        });
    }
    
    // Auto-rotate slides every 5 seconds
    setInterval(() => {
        let newIndex = currentSlide + 1;
        if (newIndex >= sliderSlides.length) newIndex = 0;
        showSlide(newIndex);
    }, 5000);
}

/**
 * Initialize form handling for product pages
 */
function initForms() {
    const demoForm = document.getElementById('demo-form');
    
    if (demoForm) {
        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const nameInput = document.getElementById('demo-name');
            const emailInput = document.getElementById('demo-email');
            const companyInput = document.getElementById('demo-company');
            
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                isValid = false;
                nameInput.classList.add('error');
            } else {
                nameInput.classList.remove('error');
            }
            
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                isValid = false;
                emailInput.classList.add('error');
            } else {
                emailInput.classList.remove('error');
            }
            
            if (!companyInput.value.trim()) {
                isValid = false;
                companyInput.classList.add('error');
            } else {
                companyInput.classList.remove('error');
            }
            
            if (isValid) {
                // If form is valid, show a success message for demonstration
                const formContainer = demoForm.parentElement;
                formContainer.innerHTML = '<div class="success-message"><h3>Thank you for your interest!</h3><p>We\'ve received your request and will get back to you shortly.</p></div>';
            }
        });
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}

/**
 * Set up contact form links
 */
function setupContactFormLinks() {
    const contactLinks = document.querySelectorAll('a[href*="#contact"]:not([href*="work_with_us.html#contact"])');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').split('#')[1];
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Scroll to the target section
                const offset = 100; // Adjust this value as needed
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Adds particles containers to all hero sections
 */
function addParticlesToHeroSections() {
  // Get all hero sections - various classes used across different templates
  const heroSections = document.querySelectorAll(
    '.hero-section, .web-hero-section, .expertise-hero-section, .why-hero-section, .work-hero-section'
  );
  
  // If no hero sections found, exit
  if (!heroSections.length) return;
  
  // For each hero section
  heroSections.forEach(section => {
    // Skip if particles container already exists
    if (section.querySelector('.particles-container')) return;
    
    // Create particles container
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    
    // Insert as first child of hero section
    section.insertBefore(particlesContainer, section.firstChild);
  });
  
  // Now create particles in all containers
  createParticles();
}

// ----- Main Initialization -----
document.addEventListener('DOMContentLoaded', function() {
  // Initialize standard features
  initializeNavbar();
  initScrollAnimations();
  initializeCounters();
  initializeContactForm();
  setActiveNavbarItem();
  setupMobileDropdownBoxes();
  loadNavbarAndFooter();
  initializeTalkToTeamButtons();
  initializeSmoothScrolling();
  
  // Add particles to all hero sections
  addParticlesToHeroSections();
  
  // Initialize fintech features
  if (document.querySelector('.fintech-hero-section, .product-hero-section')) {
    initFintechFeatures();
  }
  
  // Initialize tabs for products
  const tabButtons = document.querySelectorAll('.tab-button');
  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.id.replace('-tab', '');
        switchTab(tabName);
      });
    });
  }
  
  // Enhance the Work With Us section if present
  enhanceWorkWithUsSection();
  
  // Set up contact form links
  setupContactFormLinks();
});