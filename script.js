// Theme management
class ThemeManager {
    constructor() {
        // Use in-memory storage instead of localStorage for compatibility
        this.theme = 'light';
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
        
        if (this.themeToggle) {
            this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
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
            const response = await fetch('/config/links.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Handle different JSON structures
            const links = data.links || data;
            this.renderLinks(links);
        } catch (error) {
            console.error('Error loading links:', error);
            this.renderFallbackLinks();
        }
    }

    renderLinks(links) {
        if (!this.linksContainer) {
            console.error('Links container not found');
            return;
        }

        this.linksContainer.innerHTML = '';
        
        links.forEach((link, index) => {
            const linkElement = this.createLinkElement(link);
            linkElement.style.animationDelay = `${index * 0.1}s`;
            linkElement.classList.add('link-animate');
            this.linksContainer.appendChild(linkElement);
        });

        // Trigger animations after a brief delay
        setTimeout(() => {
            document.querySelectorAll('.link-animate').forEach(el => {
                el.classList.add('link-visible');
            });
        }, 100);
    }

    createLinkElement(link) {
        const linkDiv = document.createElement('a');
        linkDiv.className = 'link-item';
        linkDiv.href = link.url;
        
        // Don't open mailto links in new tab
        if (!link.url.startsWith('mailto:')) {
            linkDiv.target = '_blank';
            linkDiv.rel = 'noopener noreferrer';
        }
        
        // Handle different icon types
        let iconHtml = '';
        if (link.icon) {
            // Check if it's a file path or emoji
            if (link.icon.includes('.') || link.icon.includes('/')) {
                // It's a file path
                const iconPath = link.icon.startsWith('assets/') ? link.icon : `assets/icons/${link.icon}`;
                iconHtml = `<img src="${iconPath}" alt="${link.title}" class="link-icon">`;
            } else {
                // It's an emoji or text
                iconHtml = `<span class="link-icon-emoji">${link.icon}</span>`;
            }
        }
        
        linkDiv.innerHTML = `
            <div class="link-content">
                ${iconHtml}
                <div class="link-text">
                    <div class="link-title">${link.title}</div>
                    ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                </div>
            </div>
        `;

        // Add click tracking and special handling for email links
        linkDiv.addEventListener('click', (e) => {
            if (link.url.startsWith('mailto:')) {
                // Handle email links specially
                e.preventDefault();
                this.handleEmailClick(link.url, link.title);
            } else {
                this.trackClick(link.title, link.url);
            }
            
            linkDiv.classList.add('clicked');
            setTimeout(() => linkDiv.classList.remove('clicked'), 300);
        });

        // Add hover effect
        linkDiv.addEventListener('mouseenter', () => {
            linkDiv.classList.add('hover');
        });

        linkDiv.addEventListener('mouseleave', () => {
            linkDiv.classList.remove('hover');
        });

        return linkDiv;
    }

    renderFallbackLinks() {
        const fallbackLinks = [
            {
                title: "Spotify - Meus Sons",
                description: "Ouça minhas músicas no Spotify",
                url: "https://open.spotify.com/intl-pt/artist/61OsjR06HJtGksrUP0tqnI",
                icon: "assets/icons/spotify.svg"
            },
            {
                title: "Apple Music",
                description: "Também disponível na Apple Music",
                url: "https://music.apple.com/us/artist/bj/1819834296",
                icon: "assets/icons/apple-music.svg"
            },
            {
                title: "YouTube",
                description: "Vídeos e clipes oficiais",
                url: "https://youtube.com/@o_bejota",
                icon: "assets/icons/youtube.svg"
            },
            {
                title: "Instagram",
                description: "Acompanhe meu dia a dia",
                url: "https://instagram.com/o_bejota",
                icon: "📸"
            },
            {
                title: "Contato",
                description: "Entre em contato comigo",
                url: "mailto:jvldo@aluno.ifnmg.edu.br",
                icon: "assets/icons/email.svg"
            }
        ];
        
        this.renderLinks(fallbackLinks);
    }

    handleEmailClick(emailUrl, title) {
        // Extract email from mailto: link
        const email = emailUrl.replace('mailto:', '');
        
        // Create Gmail compose URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
        
        try {
            // Open Gmail in new tab
            window.open(gmailUrl, '_blank');
            this.trackClick(title, gmailUrl);
            Utils.showToast('📧 Abrindo Gmail...');
        } catch (error) {
            // Fallback: copy email to clipboard
            console.error('Error opening Gmail:', error);
            Utils.copyToClipboard(email);
            Utils.showToast('📧 Email copiado para área de transferência!');
        }
    }

    trackClick(title, url) {
        console.log(`🎵 Link clicado: ${title} -> ${url}`);
        
        // Add analytics tracking here if needed
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'Music Link',
                event_label: title,
                value: url
            });
        }
    }
}

// Animation utilities
class AnimationUtils {
    static observeElements() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            document.querySelectorAll('.link-item, .social-link').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animated');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '10px'
        });

        // Observe all animated elements
        document.querySelectorAll('.link-item, .social-link, .profile-section').forEach(el => {
            observer.observe(el);
        });
    }

    static addProfileEffects() {
        // Add click effect to profile image
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.addEventListener('click', () => {
                profileImg.style.transform = 'scale(1.1) rotate(5deg)';
                profileImg.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    profileImg.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            });
        }

        // Add floating animation to profile section
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
            profileSection.addEventListener('mouseenter', () => {
                profileSection.style.transform = 'translateY(-2px)';
                profileSection.style.transition = 'transform 0.3s ease';
            });

            profileSection.addEventListener('mouseleave', () => {
                profileSection.style.transform = 'translateY(0)';
            });
        }
    }

    static addSocialEffects() {
        // Add hover effects to social links
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'scale(1.2) rotate(10deg)';
                link.style.transition = 'transform 0.2s ease';
            });

            link.addEventListener('mouseleave', () => {
                link.style.transform = 'scale(1) rotate(0deg)';
            });

            // Add click effect
            link.addEventListener('click', () => {
                link.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    link.style.transform = 'scale(1.2) rotate(10deg)';
                }, 100);
            });
        });
    }
}

// Utility functions
class Utils {
    static copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                Utils.showToast('🎵 Link copiado!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                Utils.fallbackCopyTextToClipboard(text);
            });
        } else {
            Utils.fallbackCopyTextToClipboard(text);
        }
    }

    static fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-1000px";
        textArea.style.left = "-1000px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            Utils.showToast('🎵 Link copiado!');
        } catch (err) {
            console.error('Fallback: Could not copy text: ', err);
            Utils.showToast('❌ Não foi possível copiar');
        }
        
        document.body.removeChild(textArea);
    }

    static showToast(message, duration = 2500) {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
}

// Add essential CSS animations
const style = document.createElement('style');
style.textContent = `
    .link-animate {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .link-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .link-item.clicked {
        transform: scale(0.95);
        transition: transform 0.15s ease;
    }
    
    .link-item.hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .link-content {
        display: flex;
        align-items: center;
        width: 100%;
    }
    
    .link-icon {
        width: 24px;
        height: 24px;
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .link-icon-emoji {
        font-size: 24px;
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .link-text {
        flex: 1;
    }
    
    .link-title {
        font-weight: 600;
        margin-bottom: 2px;
    }
    
    .link-description {
        font-size: 0.9em;
        opacity: 0.7;
    }
    
    /* Profile animations */
    .profile-section {
        transition: transform 0.3s ease;
    }
    
    .profile-img {
        transition: transform 0.3s ease;
        cursor: pointer;
    }
    
    /* Social link animations */
    .social-link {
        transition: transform 0.2s ease;
    }
    
    /* Theme toggle animation */
    .theme-btn {
        transition: transform 0.3s ease;
    }
    
    .theme-btn:hover {
        transform: scale(1.1);
    }
    
    .theme-btn:active {
        transform: scale(0.9);
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🎵 Inicializando bejota links...');
        
        // Initialize managers
        const themeManager = new ThemeManager();
        const linksManager = new LinksManager();
        
        // Initialize animations
        AnimationUtils.observeElements();
        AnimationUtils.addProfileEffects();
        AnimationUtils.addSocialEffects();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+T for theme toggle
            if (e.key === 't' && e.ctrlKey) {
                e.preventDefault();
                const themeToggle = document.getElementById('themeToggle');
                if (themeToggle) {
                    themeToggle.click();
                }
            }
            
            // ESC to close any modals or reset animations
            if (e.key === 'Escape') {
                document.querySelectorAll('.clicked, .hover').forEach(el => {
                    el.classList.remove('clicked', 'hover');
                });
            }
        });
        
        // Add context menu for copying links
        document.addEventListener('contextmenu', (e) => {
            const linkItem = e.target.closest('.link-item');
            if (linkItem && linkItem.href) {
                e.preventDefault();
                Utils.copyToClipboard(linkItem.href);
            }
        });
        
        // Easter egg: Konami code
        let konamiCode = [];
        const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konami.length) {
                konamiCode.shift();
            }
            
            if (konamiCode.join(',') === konami.join(',')) {
                Utils.showToast('🎤 Easter Egg! Bejota no beat! 🥁', 3000);
                document.querySelector('.profile-img').style.animation = 'spin 2s linear infinite';
                setTimeout(() => {
                    document.querySelector('.profile-img').style.animation = '';
                }, 2000);
                konamiCode = [];
            }
        });
        
        // Add spin animation for easter egg
        const spinStyle = document.createElement('style');
        spinStyle.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinStyle);
        
        console.log('🚀 bejota links carregado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        Utils.showToast('❌ Erro ao carregar links');
    }
});