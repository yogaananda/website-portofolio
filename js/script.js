/* Blueprint Portfolio - Unified Logic */

// Tailwind Configuration (Optional: Can also be in <html>)
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    blueprint: {
                        light: '#f8f9fa',
                        dark: '#0a0a0b',
                        accent: '#4f46e5',
                        electric: '#2563eb',
                        grid: 'rgba(79, 70, 229, 0.05)',
                    },
                    navy: '#1e1b4b',
                },
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    syne: ['Syne', 'sans-serif'],
                }
            }
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Elements Cache
    const pageTransition = document.getElementById('page-transition');
    const transitionText = pageTransition?.querySelector('.loader-text');
    const cursorFollower = document.getElementById('cursor-follower');
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderPercent = document.getElementById('preloader-percent');
    const mainContent = document.getElementById('main-content');
    const themeToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.querySelector('nav .hidden.md\\:flex');

    // --- Theme Management ---
    let isDarkMode = localStorage.getItem('theme') === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            gsap.to('body', { duration: 0.5, ease: "power2.inOut" });
        });
    }

    // --- Custom Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    document.addEventListener('mousemove', (e) => {
        if (!isTouchDevice) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });

    if (!isTouchDevice && (cursorDot || cursorRing)) {
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());

            // Dot follows almost instantly
            dotX += (mouseX - dotX) * 0.5; // Very slight smoothing
            dotY += (mouseY - dotY) * 0.5;

            // Ring follows with noticeable lag
            ringX += (mouseX - ringX) * dt;
            ringY += (mouseY - ringY) * dt;

            if (cursorDot) gsap.set(cursorDot, { x: dotX, y: dotY });
            if (cursorRing) gsap.set(cursorRing, { x: ringX, y: ringY });
        });
    }

    const updateInteractiveListeners = () => {
        document.querySelectorAll('.interactive').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursorFollower && !isTouchDevice) cursorFollower.classList.add('cursor-hover');

                if (el.classList.contains('magnetic') && !isTouchDevice) {
                    el.addEventListener('mousemove', (e) => {
                        const rect = el.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.3 });
                    });
                }
            });

            el.addEventListener('mouseleave', () => {
                if (cursorFollower) cursorFollower.classList.remove('cursor-hover');

                if (el.classList.contains('magnetic')) {
                    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
                }
            });
        });
    };
    updateInteractiveListeners();

    // --- Preloader & Initialization ---
    // Rule: Preloader on Refresh/Initial entry. Curtain only on Page-to-Page navigation.
    const isNavigating = sessionStorage.getItem('isNavigating');
    sessionStorage.removeItem('isNavigating'); // Clear immediately to handle next refresh properly

    if (preloader && !isNavigating) {
        // Initial Entry or Refresh: Show Preloader
        if (pageTransition) gsap.set(pageTransition, { yPercent: -100 }); // Move curtain out of the way for preloader

        const tlPreloader = gsap.timeline({
            onComplete: () => {
                const tlExit = gsap.timeline({
                    onComplete: () => {
                        preloader.remove();
                    }
                });
                tlExit.to(preloader, { yPercent: -100, duration: 1.2, ease: "expo.inOut" });
                tlExit.fromTo(mainContent, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }, "-=0.8");
                initGlobalAnimations(true); // Skip curtain because preloader handled it
            }
        });

        tlPreloader.to(preloaderBar, {
            width: "100%",
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: function () {
                const percent = Math.round(this.progress() * 100);
                if (preloaderPercent) preloaderPercent.innerText = percent.toString().padStart(2, '0');
            }
        });
    } else {
        // Navigating from another page: Show Curtain, skip Preloader
        if (preloader) preloader.remove();
        if (mainContent) gsap.set(mainContent, { opacity: 1, scale: 1 });
        initGlobalAnimations(false); // Show curtain reveal
    }

    // --- Animation Engine ---
    function initGlobalAnimations(skipCurtain) {
        // Marquee (Velocity Tracks)
        const trackWeb = document.querySelector('.velocity-track-web');
        if (trackWeb) gsap.to(trackWeb, { xPercent: -50, ease: "none", duration: 25, repeat: -1 });

        const trackAI = document.querySelector('.velocity-track-ai');
        if (trackAI) {
            gsap.set(trackAI, { xPercent: -50 });
            gsap.to(trackAI, { xPercent: 0, ease: "none", duration: 25, repeat: -1 });
        }

        // --- Page Transitions ---
        if (pageTransition) {
            if (skipCurtain) {
                // If we had a preloader, just hide the curtain immediately
                gsap.set(pageTransition, { yPercent: -100 });
            } else {
                // Smooth entry reveal
                gsap.to(pageTransition, {
                    yPercent: -100,
                    duration: 1.2,
                    ease: "expo.inOut",
                    onComplete: () => {
                        // Reset to bottom for next navigation
                        gsap.set(pageTransition, { yPercent: 100 });
                    }
                });
            }

            // Intercept Internal Links
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel') && !link.hasAttribute('download') && link.hostname === window.location.hostname) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = href;

                        // Set flag so the target page knows we are NATIGATING, not REFRESHING
                        sessionStorage.setItem('isNavigating', 'true');

                        const tl = gsap.timeline({
                            onComplete: () => { window.location.href = target; }
                        });

                        tl.to(pageTransition, {
                            yPercent: 0,
                            duration: 0.8,
                            ease: "expo.inOut"
                        });
                        if (transitionText) {
                            tl.fromTo(transitionText, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
                        }
                    });
                }
            });
        }

        // Split Text
        document.querySelectorAll('.split-word').forEach(element => {
            const text = element.innerText;
            const words = text.split(' ');
            element.innerHTML = words.map(word => `<span class="inline-block overflow-hidden"><span class="inline-block translate-y-full">${word}&nbsp;</span></span>`).join('');
            gsap.to(element.querySelectorAll('span span'), {
                y: 0,
                duration: 1.5,
                stagger: 0.1,
                ease: "expo.out",
                scrollTrigger: { trigger: element, start: "top 90%" }
            });
        });

        // Timeline (Index)
        const timelineLine = document.querySelector('.timeline-line');
        if (timelineLine) {
            const updateTimeline = () => {
                const pathItems = document.querySelectorAll('.path-item');
                const container = document.getElementById('timeline-container');
                const dots = document.querySelectorAll('.timeline-dot');
                if (pathItems.length > 0 && dots.length > 0 && container) {
                    const containerRect = container.getBoundingClientRect();
                    const firstRect = dots[0].getBoundingClientRect();
                    const lastRect = dots[dots.length - 1].getBoundingClientRect();
                    const startY = firstRect.top - containerRect.top + (firstRect.height / 2);
                    const endHeight = (lastRect.top + (lastRect.height / 2)) - (firstRect.top + (firstRect.height / 2));
                    gsap.set(timelineLine, { top: startY, height: endHeight });
                    gsap.to(timelineLine, {
                        scaleY: 1,
                        duration: 1.5,
                        ease: "power2.inOut",
                        scrollTrigger: {
                            trigger: '#path',
                            start: "top 60%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            };
            updateTimeline();
            window.addEventListener('resize', updateTimeline);

            document.querySelectorAll('.timeline-dot').forEach(dot => {
                gsap.to(dot, { scale: 1, duration: 0.6, ease: "back.out(2)", scrollTrigger: { trigger: dot, start: "top 85%", toggleActions: "play none none reverse" } });
            });
        }

        // Section Reveals
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            gsap.from(el, { scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }, y: 60, opacity: 0, duration: 1.2, ease: "power4.out" });
        });

        // Parallax & Mouse Interaction
        const oversized = document.querySelector('.oversized-text');
        if (oversized) {
            document.addEventListener('mousemove', (e) => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                gsap.to(".oversized-text span span", { x: moveX * 2, y: moveY * 2, duration: 1, ease: "power2.out", stagger: 0.05 });
            });
        }

        // Scroll Progress
        const scrollProgress = document.getElementById('scroll-progress');
        if (scrollProgress) {
            gsap.to(scrollProgress, { width: "100%", ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.3 } });
        }

        // Project Hero (Project Pages)
        const projHeroImg = document.querySelector('.project-hero-img');
        if (projHeroImg) {
            gsap.from('h1', { y: 100, opacity: 0, duration: 1.5, ease: "expo.out", delay: 0.2 });
            gsap.from(projHeroImg, { scale: 1.2, opacity: 0, duration: 2, ease: "expo.out" });
        }

        // Local Time
        const updateLocalTime = () => {
            const timeEl = document.getElementById('local-time');
            if (timeEl) {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            }
        };
        setInterval(updateLocalTime, 1000);
        updateLocalTime();

        // Navbar Scroll
        const navbar = document.getElementById('navbar');
        if (navbar) {
            const hasInitialGlass = navbar.classList.contains('glass-nav');

            ScrollTrigger.create({
                start: "top -100",
                onEnter: () => {
                    navbar.classList.add('glass-nav');
                },
                onLeaveBack: () => {
                    if (!hasInitialGlass) {
                        navbar.classList.remove('glass-nav');
                    }
                }
            });
        }

        // Smooth Scroll Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    gsap.to(window, { duration: 1.5, scrollTo: targetId, ease: "power4.inOut" });
                }
            });
        });

        // Image Zoom Modal (Project Details)
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        if (modal && modalImg) {
            document.querySelectorAll('.zoomable').forEach(container => {
                container.addEventListener('click', () => {
                    const img = container.querySelector('img');
                    const caption = container.getAttribute('data-caption');
                    modalImg.src = img.getAttribute('src');
                    const modalCaption = document.getElementById('modal-caption');
                    if (modalCaption) modalCaption.textContent = caption;
                    modal.classList.remove('pointer-events-none');
                    gsap.to(modal, { opacity: 1, duration: 0.5, ease: "power2.out" });
                    gsap.from("#modal-container", { scale: 0.9, duration: 0.8, ease: "elastic.out(1, 0.75)" });
                });
            });

            const hideModal = () => {
                gsap.to(modal, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => { modal.classList.add('pointer-events-none'); modalImg.src = ''; } });
            };
            const closeBtn = document.getElementById('close-modal');
            if (closeBtn) closeBtn.addEventListener('click', hideModal);
            modal.addEventListener('click', (e) => { if (e.target === modal || e.target.id === 'modal-container') hideModal(); });
        }
    }

    // --- Mobile Menu ---
    if (mobileToggle && navLinksContainer) {
        let isMobileMenuOpen = false;

        // Ensure nav links have initial state for mobile
        const navLinks = navLinksContainer.querySelectorAll('.nav-link');

        mobileToggle.addEventListener('click', () => {
            isMobileMenuOpen = !isMobileMenuOpen;

            if (isMobileMenuOpen) {
                document.body.style.overflow = 'hidden';
                gsap.to(navLinksContainer, {
                    display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'var(--blueprint-bg)', justifyContent: 'center', alignItems: 'center', opacity: 1, duration: 0.5, ease: "power4.out",
                    onStart: () => {
                        navLinksContainer.classList.remove('hidden');
                        navLinksContainer.classList.add('z-[60]');
                        gsap.fromTo(navLinks, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.2 });
                    }
                });
            } else {
                document.body.style.overflow = '';
                gsap.to(navLinksContainer, {
                    opacity: 0, duration: 0.3, ease: "power2.in",
                    onComplete: () => {
                        navLinksContainer.classList.add('hidden');
                        navLinksContainer.classList.remove('z-[60]');
                        navLinksContainer.style = '';
                    }
                });
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) { // Account for tailwind md/lg breakpoints
                    isMobileMenuOpen = false;
                    document.body.style.overflow = '';
                    gsap.to(navLinksContainer, {
                        opacity: 0, duration: 0.3,
                        onComplete: () => {
                            navLinksContainer.classList.add('hidden');
                            navLinksContainer.classList.remove('z-[60]');
                            navLinksContainer.style = '';
                        }
                    });
                }
            });
        });
    }
});
