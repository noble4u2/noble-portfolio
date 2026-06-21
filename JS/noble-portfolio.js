const words = ["Responsive Web Developer", "Frontend Experience Builder", "Business Website Specialist"];
const desktopMenuQuery = window.matchMedia("(min-width: 960px)");

function startTypewriter() {
    const display = document.querySelector(".typing");

    if (!display) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        display.textContent = words[0];
        return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            charIndex -= 1;
        } else {
            charIndex += 1;
        }

        display.textContent = currentWord.slice(0, charIndex);

        let delay = isDeleting ? 45 : 95;

        if (!isDeleting && charIndex === currentWord.length) {
            delay = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 350;
        }

        window.setTimeout(tick, delay);
    };

    tick();
}

function setupNavbar() {
    const navbar = document.querySelector(".nav-bar");

    if (!navbar) return;

    let isTicking = false;

    const updateNavbarState = () => {
        navbar.classList.toggle("scrolled-from-hero", window.scrollY > 24);
        isTicking = false;
    };

    updateNavbarState();

    window.addEventListener("scroll", () => {
        if (isTicking) return;

        isTicking = true;
        window.requestAnimationFrame(updateNavbarState);
    }, { passive: true });
}

function setupMobileMenu() {
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const navItems = document.querySelector(".nav-items");
    const navLinks = document.querySelectorAll(".nav-item");

    if (!hamburgerMenu || !navItems) return;

    const setMenuState = isOpen => {
        hamburgerMenu.classList.toggle("active", isOpen);
        navItems.classList.toggle("active", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
        hamburgerMenu.setAttribute("aria-expanded", String(isOpen));
    };

    hamburgerMenu.setAttribute("aria-label", "Toggle navigation menu");
    hamburgerMenu.setAttribute("aria-expanded", "false");

    hamburgerMenu.addEventListener("click", () => {
        const isOpen = navItems.classList.contains("active");
        setMenuState(!isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });

    document.addEventListener("click", event => {
        const clickedInsideMenu = navItems.contains(event.target);
        const clickedToggle = hamburgerMenu.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle && navItems.classList.contains("active")) {
            setMenuState(false);
        }
    });

    const handleDesktopChange = event => {
        if (event.matches) {
            setMenuState(false);
        }
    };

    if (typeof desktopMenuQuery.addEventListener === "function") {
        desktopMenuQuery.addEventListener("change", handleDesktopChange);
    } else if (typeof desktopMenuQuery.addListener === "function") {
        desktopMenuQuery.addListener(handleDesktopChange);
    }
}

function setupActiveNavLinks() {
    const navLinks = Array.from(document.querySelectorAll(".nav-item"));
    const sections = document.querySelectorAll("header[id], main article[id]");

    if (navLinks.length === 0 || sections.length === 0) return;

    const setActiveLink = id => {
        navLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveLink(entry.target.id);
            }
        });
    }, {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.05
    });

    sections.forEach(section => observer.observe(section));
}

function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll(
        ".about-me-background, .about-me-education, .skill, .project-card, .service-card, .testimonial-card, .contact-info, .contact-form, .hero-metrics li"
    );

    if (revealTargets.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    revealTargets.forEach((element, index) => {
        element.classList.add("reveal");
        element.style.setProperty("--reveal-delay", `${Math.min(index * 60, 240)}ms`);
    });

    if (prefersReducedMotion) {
        revealTargets.forEach(element => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
    });

    revealTargets.forEach(element => observer.observe(element));
}

function setupSkillProgress() {
    const progressBars = document.querySelectorAll(".progress");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (progressBars.length === 0) return;

    const fillBars = () => {
        progressBars.forEach(bar => {
            const percent = bar.getAttribute("data-progress");
            bar.style.width = `${percent}%`;
        });
    };

    if (prefersReducedMotion) {
        fillBars();
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fillBars();
                observer.disconnect();
            }
        });
    }, {
        threshold: 0.4
    });

    const skillsSection = document.getElementById("skills");

    if (skillsSection) {
        observer.observe(skillsSection);
    } else {
        fillBars();
    }
}

function setupContactForm() {
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.querySelector(".form-status");
    const submitButton = contactForm?.querySelector(".submit-btn");
    const honeypotField = contactForm?.querySelector('input[name="company"]');
    const emailJsConfig = window.EMAILJS_CONFIG;

    if (!contactForm || !formStatus || !submitButton) return;

    const setFormStatus = (message, state = "") => {
        formStatus.textContent = message;
        formStatus.dataset.state = state;
    };

    const setSubmitButtonState = isLoading => {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? "Sending..." : "Send Message";
    };

    const initializeEmailJs = () => {
        if (
            !window.emailjs
            || !emailJsConfig?.publicKey
            || !emailJsConfig?.serviceId
            || !emailJsConfig?.templateId
        ) {
            return false;
        }

        const initOptions = {
            publicKey: emailJsConfig.publicKey,
            blockHeadless: true,
            limitRate: {
                id: "noble-portfolio-contact-form",
                throttle: emailJsConfig.rateLimitMs ?? 30000
            }
        };

        if (Array.isArray(emailJsConfig.blockedEmails) && emailJsConfig.blockedEmails.length > 0) {
            initOptions.blockList = {
                list: emailJsConfig.blockedEmails,
                watchVariable: "email"
            };
        }

        window.emailjs.init(initOptions);
        return true;
    };

    const isEmailJsReady = initializeEmailJs();

    if (!isEmailJsReady) {
        setFormStatus("Add your EmailJS config file to enable this form.", "error");
        return;
    }

    const clearStatus = () => {
        if (!formStatus.textContent) return;
        setFormStatus("", "");
    };

    contactForm.addEventListener("input", clearStatus);

    contactForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (honeypotField?.value.trim()) {
            setFormStatus("Message blocked. Please try again.", "error");
            return;
        }

        if (!contactForm.reportValidity()) {
            setFormStatus("Please complete all required fields.", "error");
            return;
        }

        const formData = new FormData(contactForm);
        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const message = String(formData.get("message") ?? "").trim();

        setSubmitButtonState(true);
        setFormStatus("Sending your message...", "loading");

        try {
            await window.emailjs.send(emailJsConfig.serviceId, emailJsConfig.templateId, {
                name,
                email,
                message,
                from_name: name,
                from_email: email,
                reply_to: email,
                sender_name: name,
                sender_email: email,
                submitted_at: new Date().toLocaleString()
            });

            contactForm.reset();
            setFormStatus("Your message has been sent successfully.", "success");
        } catch (error) {
            console.error("EmailJS send failed:", error);
            setFormStatus("Message failed to send. Please try again later.", "error");
        } finally {
            setSubmitButtonState(false);
        }
    });
}

function initializePortfolio() {
    startTypewriter();
    setupNavbar();
    setupMobileMenu();
    setupActiveNavLinks();
    setupRevealAnimations();
    setupSkillProgress();
    setupContactForm();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolio);
} else {
    initializePortfolio();
}
