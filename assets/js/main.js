document.addEventListener("DOMContentLoaded", () => {
    // New navigation elements
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const backToTop = document.querySelector(".back-to-top");
    const currentYear = document.getElementById("current-year");
    const consultationForm = document.getElementById("consultation-form");
    const newsletterForm = document.getElementById("newsletter-form");

    // Dynamic navigation highlighting based on scroll position
    const updateActiveNavLink = () => {
        const sections = document.querySelectorAll("section[id], header[id]");
        const scrollPosition = window.scrollY + 150; // Offset for better detection

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    const href = link.getAttribute("href");
                    if (href === `#${sectionId}` || (href === "#top" && sectionId === "top")) {
                        link.classList.add("active");
                    }
                });
            }
        });
    };

    // Handle mobile navigation toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", String(!expanded));
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                navToggle.setAttribute("aria-expanded", "false");
                
                // Handle smooth scrolling for same-page anchor links
                const href = link.getAttribute("href");
                if (href && href.includes("#") && href.startsWith("index.html#")) {
                    const targetId = href.split("#")[1];
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                } else if (href && href.startsWith("#")) {
                    const targetElement = document.getElementById(href.substring(1));
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            });
        });

        // Close menu on escape key
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
                navToggle.setAttribute("aria-expanded", "false");
            }
        });

        // Close menu when clicking outside
        document.addEventListener("click", (event) => {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // Back to top button
    const updateBackToTop = () => {
        if (!backToTop) return;
        if (window.scrollY > 360) {
            backToTop.classList.add("is-visible");
        } else {
            backToTop.classList.remove("is-visible");
        }
    };


    // Reveal components when they enter the viewport
    const revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });

        revealElements.forEach(el => observer.observe(el));
    }

    // Scroll event listener with dynamic nav updates
    window.addEventListener("scroll", () => {
        updateBackToTop();
        updateActiveNavLink();
    });

    // Initial call to set active link on page load
    updateActiveNavLink();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Inline feedback helper for forms
    const displayFeedback = (el, message, state = "success") => {
        if (!el) return;
        el.textContent = message;
        el.dataset.state = state;
    };

    if (consultationForm) {
        consultationForm.addEventListener("submit", event => {
            event.preventDefault();
            if (!consultationForm.reportValidity()) {
                displayFeedback(consultationForm.querySelector(".form-feedback"), "Please complete the required fields.", "error");
                return;
            }

            const feedback = consultationForm.querySelector(".form-feedback");
            displayFeedback(feedback, "Thank you. Our concierge will respond within 24 hours.");
            consultationForm.reset();
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();
            if (!newsletterForm.reportValidity()) {
                displayFeedback(newsletterForm.querySelector(".newsletter-feedback"), "Please provide a valid email.", "error");
                return;
            }

            const feedback = newsletterForm.querySelector(".newsletter-feedback");
            displayFeedback(feedback, "Welcome to the Collector Circle.");
            newsletterForm.reset();
        });
    }

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Manage resize state for mobile nav to avoid stuck layout when resizing
    window.addEventListener("resize", () => {
        if (!navBar || !navToggle) return;
        if (window.innerWidth > 900) {
            navToggle.setAttribute("aria-expanded", "false");
            navBar.classList.remove("nav-open");
        }
    });

    window.addEventListener("scroll", () => {
        updateNavScrollState();
        updateBackToTop();
    }, { passive: true });

    // Collection filtering functionality
    initializeCollectionFilters();
});

function initializeCollectionFilters() {
    const categoryFilter = document.getElementById("category-filter");
    const metalFilter = document.getElementById("metal-filter");
    const priceFilter = document.getElementById("price-filter");
    const sortFilter = document.getElementById("sort-filter");
    const resetBtn = document.getElementById("reset-filters");
    const resultsCount = document.getElementById("results-count");

    if (!categoryFilter || !metalFilter || !priceFilter || !sortFilter) return;

    function applyFilters() {
        const cards = Array.from(document.querySelectorAll(".collection-card"));
        const category = categoryFilter.value;
        const metal = metalFilter.value;
        const priceRange = priceFilter.value;
        const sortBy = sortFilter.value;

        let visibleCards = cards.filter(card => {
            const cardCategory = card.dataset.category || "";
            const cardMetal = card.dataset.metal || "";
            const cardPrice = parseInt(card.dataset.price || "0");

            const categoryMatch = category === "all" || cardCategory === category;
            const metalMatch = metal === "all" || cardMetal === metal;

            let priceMatch = true;
            if (priceRange !== "all") {
                const [min, max] = priceRange.split("-").map(Number);
                priceMatch = cardPrice >= min && cardPrice <= max;
            }

            return categoryMatch && metalMatch && priceMatch;
        });

        // Apply sorting
        if (sortBy === "price-low") {
            visibleCards.sort((a, b) => parseInt(a.dataset.price) - parseInt(b.dataset.price));
        } else if (sortBy === "price-high") {
            visibleCards.sort((a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price));
        } else if (sortBy === "name") {
            visibleCards.sort((a, b) => {
                const nameA = a.querySelector("h3").textContent;
                const nameB = b.querySelector("h3").textContent;
                return nameA.localeCompare(nameB);
            });
        }

        // Hide all cards first
        cards.forEach(card => card.style.display = "none");

        // Show and reorder visible cards
        const grid = document.querySelector(".collection-grid");
        visibleCards.forEach(card => {
            card.style.display = "";
            grid.appendChild(card);
        });

        // Update results count
        if (resultsCount) {
            const count = visibleCards.length;
            resultsCount.textContent = count === cards.length 
                ? "Showing all products" 
                : `Showing ${count} of ${cards.length} products`;
        }
    }

    categoryFilter.addEventListener("change", applyFilters);
    metalFilter.addEventListener("change", applyFilters);
    priceFilter.addEventListener("change", applyFilters);
    sortFilter.addEventListener("change", applyFilters);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            categoryFilter.value = "all";
            metalFilter.value = "all";
            priceFilter.value = "all";
            sortFilter.value = "featured";
            applyFilters();
        });
    }
}
