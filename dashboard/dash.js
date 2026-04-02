/**
 * Dashboard Initialization & UI Functions
 */

// Initialize dashboard on page load
function initDashboard() {
    initScrollReveal();
    initForm();
    initMenuToggle();
}

// Show notification messages
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 4000);
}

// Start initialization when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// ScrollReveal initialization
function initScrollReveal() {
    try {
        ScrollReveal({ distance: "30px", easing: "ease-in" });

        ScrollReveal().reveal(".title", {
            delay: 300,
            origin: "top",
        });

        ScrollReveal().reveal(".paragraph", {
            delay: 800,
            origin: "top",
        });

        ScrollReveal().reveal("#form", {
            delay: 1200,
            origin: "bottom",
        });
    } catch (e) {
        // ScrollReveal error
    }
}

// Form initialization
function initForm() {
    try {
        const emailId = document.getElementById("email-id");
        const form = document.getElementById("form");
        
        if (!emailId || !form) return;
        
        const mailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        emailId.addEventListener("input", (e) => {
            const emailInputValue = e.currentTarget.value;
            if (mailRegex.test(emailInputValue)) {
                emailId.style.outline = "2px dotted rgb(118, 167, 63)";
            } else {
                emailId.style.outline = "2px dotted rgb(117, 152, 242)";
            }
        });

        form.addEventListener("submit", (e) => {
            if (emailId.value.match(mailRegex)) {
                e.preventDefault();
                form.innerHTML = `<p style="font-size: 2rem; font-weight: 500; color: rgb(118, 167, 63);">Subscribed! 🎉</p>`;
                setTimeout(() => { 
                    window.location.href = "#card-container";
                }, 1700);
            } else {
                e.preventDefault();
                showNotification("Please enter a valid email", "error");
            }
        });

        // Typing animation for placeholder
        let i = 0;
        let placeholder = "";
        const txt = "example@domain.com";
        const speed = 150;

        setTimeout(() => {
            typeEmail();
        }, 1600);

        function typeEmail() {
            placeholder += txt.charAt(i);
            emailId.setAttribute("placeholder", placeholder);
            i++;
            if (i < txt.length) {
                setTimeout(typeEmail, speed);
            }
        }
    } catch (e) {
        // Form initialization error
    }
}

// Menu toggle function
function initMenuToggle() {
    // Menu toggle is handled by toggleMenu() function
}

// Toggle hamburger menu
function toggleMenu() {
    const menu = document.getElementById("menu");
    if (menu) {
        menu.classList.toggle("active");
    }
}
