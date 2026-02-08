// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

// Close mobile menu when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', scrollActive);

// Header Shadow on Scroll
const header = document.getElementById('header');

function scrollHeader() {
    if (window.scrollY >= 50) {
        header.classList.add('scroll-header');
    } else {
        header.classList.remove('scroll-header');
    }
}

window.addEventListener('scroll', scrollHeader);

// Animate Stats on Scroll
const stats = document.querySelectorAll('.stat__number');
let animated = false;

function animateStats() {
    const statsSection = document.querySelector('.hero__stats');
    if (!statsSection) return;

    const sectionTop = statsSection.offsetTop;
    const sectionHeight = statsSection.offsetHeight;
    const scrollY = window.pageYOffset + window.innerHeight;

    if (scrollY > sectionTop && scrollY < sectionTop + sectionHeight + 500 && !animated) {
        stats.forEach(stat => {
            const target = parseInt(stat.textContent);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current) + (stat.textContent.includes('+') ? '+' : '%');
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + (stat.textContent.includes('+') ? '+' : '%');
                }
            };

            updateCounter();
        });
        animated = true;
    }
}

window.addEventListener('scroll', animateStats);

// Animate Service Cards on Scroll
const serviceCards = document.querySelectorAll('.service-card');

function animateCards() {
    serviceCards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (cardTop < windowHeight - 100) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
}

// Initialize card animation styles
serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', animateCards);
animateCards(); // Initial check

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value;

        // Create message for WhatsApp or Email
        const whatsappNumber = '971501984302';
        const emailAddress = 'bimalapillai@gmail.com';

        // Format message
        const formattedMessage = `
New Service Request:
--------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}
Message: ${message}
        `.trim();

        // Show success message
        showNotification('Thank you! We will contact you soon.', 'success');

        // Option 1: Open WhatsApp (uncomment to use)
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
        
        // Option 2: Open email client
        const mailtoUrl = `mailto:${emailAddress}?subject=Service Request from ${name}&body=${encodeURIComponent(formattedMessage)}`;

        // Prompt user to choose
        setTimeout(() => {
            if (confirm('Would you like to send this via WhatsApp? (Click OK for WhatsApp, Cancel for Email)')) {
                window.open(whatsappUrl, '_blank');
            } else {
                window.location.href = mailtoUrl;
            }
        }, 1000);

        // Reset form
        contactForm.reset();
    });
}

// Notification Function
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.5s ease;
        font-weight: 600;
        max-width: 300px;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Hover Effect for Service Cards
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Dynamic Current Year in Footer
const currentYear = new Date().getFullYear();
const yearElements = document.querySelectorAll('.footer__bottom p');
if (yearElements.length > 0) {
    yearElements[0].textContent = `© ${currentYear} Prime Solid Contracting & General Maintenance. All rights reserved.`;
}

// Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Scroll to Top Button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #ff6b35, #ff8c69);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
`;

document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.visibility = 'visible';
    } else {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.visibility = 'hidden';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollTopBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
});

scrollTopBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
});

// Phone number click tracking
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        console.log('Phone number clicked');
    });
});

// Email click tracking
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
        console.log('Email clicked');
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all service cards and feature elements
document.querySelectorAll('.service-card, .feature, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Console welcome message
console.log('%c🔧 Prime Solid Contracting & General Maintenance', 'font-size: 20px; font-weight: bold; color: #ff6b35;');
console.log('%cYour trusted partner for building maintenance in Abu Dhabi', 'font-size: 14px; color: #004e89;');
console.log('%cLicense No: CN-4306575', 'font-size: 12px; color: #666;');
