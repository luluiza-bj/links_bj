// Theme management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
        this.theme = theme;
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Links management
class LinksManager {
    constructor() {
        this.linksContainer = document.getElementById('linksContainer');
        this.init();
    }

    async init() {
        try {
            const response = await fetch('config/links.json');
            const data = await response.json();
            this.renderLinks(data.links);
        } catch (error) {
            console.error('Error loading links:', error);
            this.renderFallbackLinks();
        }
    }

    renderLinks(links) {
        this.linksContainer.innerHTML = '';
        
        links.forEach((link, index) => {
            const linkElement = this.createLinkElement(link);
            linkElement.style.animationDelay = `${index * 0.1}s`;
            linkElement.classList.add('loading');
            this.linksContainer.appendChild(linkElement);
        });
    }

    createLinkElement(link) {
        const linkDiv = document.createElement('a');
        linkDiv.className = 'link-item';
        linkDiv.href = link.url;
        linkDiv.target = '_blank';
        linkDiv.rel = 'noopener noreferrer';
        
        linkDiv.innerHTML = `
            <div class="link-title">${link.title}</div>
            ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
        `;

        // Add click tracking and animation
        linkDiv.addEventListener('click', (e) => {
            this.trackClick(link.title, link.url);
            linkDiv.classList.add('clicked');
            setTimeout(() => linkDiv.classList.remove('clicked'), 300);
        });

        return linkDiv;
    }

    renderFallbackLinks() {
        const fallbackLinks = [
            {
                title: "My Portfolio",
                description: "Check out my latest projects",
                url: "https://yourportfolio.com"
            },
            {
                title: "Blog",
                description: "Read my latest articles",
                url: "https://yourblog.com"
            },
            {
                title: "Contact Me",
                description: "Get in touch",
                url: "mailto:jvldo@aluno.ifnmg.edu.br"
            }
        ];
        
        this.renderLinks(fallbackLinks);
    }

    trackClick(title, url) {
        // Simple click tracking - you can enhance this
        console.log(`Link clicked: ${title} -> ${url}`);
        
        // You could send this data to analytics services
        // Example: Google Analytics, Plausible, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'Link',
                event_label: title,
                value: url
            });
        }
    }
}

// Animation utilities
class AnimationUtils {
    static observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        // Observe all animated elements
        document.querySelectorAll('.link-item, .social-link').forEach(el => {
            observer.observe(el);
        });
    }

    static addHoverEffects() {
        // Add subtle animations to various elements
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.addEventListener('click', () => {
                profileImg.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    profileImg.style.transform = 'scale(1)';
                }, 300);
            });
        }
    }
}

// Utility functions
class Utils {
    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Link copied to clipboard!');
        });
    }

    static showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '1', 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    new ThemeManager();
    new LinksManager();
    
    // Initialize animations
    AnimationUtils.observeElements();
    AnimationUtils.addHoverEffects();
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 't' && e.ctrlKey) {
            e.preventDefault();
            document.getElementById('themeToggle').click();
        }
    });
    
    // Add context menu for copying links
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.link-item')) {
            e.preventDefault();
            const url = e.target.closest('.link-item').href;
            Utils.copyToClipboard(url);
        }
    });
    
    console.log('🚀 Your link tree is ready!');
});