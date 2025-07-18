document.addEventListener('DOMContentLoaded', function() {
  
  // Form elements
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectSelect = document.getElementById('subject');
  const messageTextarea = document.getElementById('message');
  const submitBtn = document.querySelector('.submit-btn');


  // Email : 
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Error message
  function showError(element, message) {
    element.style.borderColor = '#d32f2f';
    element.style.backgroundColor = '#fff5f5';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    element.parentNode.appendChild(errorDiv);
  }

  // Clear errors
  function clearErrors() {
    const inputs = [nameInput, emailInput, subjectSelect, messageTextarea];
    inputs.forEach(input => {
      input.style.borderColor = '#e1e8ed';
      input.style.backgroundColor = '#f8fafc';
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }

  // Success message
  function showSuccessMessage() {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #012b03ff;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(76, 128, 200, 0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap:10px;">
        <div style="width: 20px; height: 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">       <span style="color: #4caf50; font-weight: bold;">✓</span>
        </div>
        <span>Message sent successfully!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // remove message sent with sucess after three sec : 
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      },300);
    }, 3000);
  }
  

  // Form validation and submission : 
   contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    

    // loading : 
    submitBtn.innerHTML = '<span>Sending...</span><div class="btn-icon"><img src="assests/send.png" alt="Loading" style="width:20px;height:20px;"></div>';
    submitBtn.disabled = true;
    
    
    // set some time for the submition ( simulation ) : 
    setTimeout(() => {
      showSuccessMessage();
      resetForm();
      submitBtn.innerHTML = '<span>Send Message</span><div class="btn-icon"><img src="assests/send.png" alt="Send Icon" style="width:20px;height:20px;"></div>';
      submitBtn.disabled = false;
    }, 2000);
  });
  function validateForm() {
    let isValid = true;
    
    clearErrors();
    
    // name : 
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Name is required');
      isValid = false;
    } else if (nameInput.value.trim().length < 2) {
      showError(nameInput, 'Name must be at least 2 characters');
      isValid = false;
    }
    
    // email : 
    if (!emailInput.value.trim()) {
      showError(emailInput, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address');
      isValid = false;
    }
    
    //subject : 
    if (!subjectSelect.value) {
      showError(subjectSelect, 'Please select a subject');
      isValid = false;
    }
    
    // Validate message : 
    if (!messageTextarea.value.trim()) {
      showError(messageTextarea, 'Message is required');
      isValid = false;
    } else if (messageTextarea.value.trim().length < 10) {
      showError(messageTextarea, 'Message must be at least 10 characters');
      isValid = false;
    }
    
    return isValid;
  }

  // Reset after sending  : 
  function resetForm() {
    contactForm.reset();
    clearErrors();
  }

  nameInput.addEventListener('blur', function() {
    if (this.value.trim() && this.value.trim().length < 2) {
      showError(this, 'Name must be at least 2 characters');
    }
  });

  emailInput.addEventListener('blur', function() {
    if (this.value.trim() && !isValidEmail(this.value)) {
      showError(this, 'Please enter a valid email address');
    }
  });

  messageTextarea.addEventListener('blur', function() {
    if (this.value.trim() && this.value.trim().length < 10) {
      showError(this, 'Message must be at least 10 characters');
    }
  });

  // Clear errors :
  [nameInput, emailInput, subjectSelect, messageTextarea].forEach(input => {
    input.addEventListener('input', function() {
      if (this.style.borderColor === 'rgb(211, 47, 47)') {
        this.style.borderColor = '#e1e8ed';
        this.style.backgroundColor = '#f8fafc';
        const errorMsg = this.parentNode.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });
  });

  // Smooth scroll :  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // hover effect : 
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // click effect : 
  const socialIcons = document.querySelectorAll('.social-icon');
  socialIcons.forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      showTooltip(this, 'Link coming soon!');
    });
  });

  // css animation 
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);


  // Initialize page with animations : 
  setTimeout(() => {
    const animatedElements = document.querySelectorAll('.contact-info, .contact-form, .faq-item');
    animatedElements.forEach((element, index) => {
      element.style.opacity = 0;
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.6s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 10);
    });
  }, 500);
}); 