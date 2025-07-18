// Theme management
class ThemeManager {
    constructor() {
        // Use in-memory storage instead of localStorage for compatibility
        this.theme = 'main';
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
        document.body.className = theme === 'default' ? 'default-theme' : '';
        
        if (this.themeToggle) {
            this.themeToggle.textContent = theme === 'default' ? '🐒' : '🕴️';
        }
        this.theme = theme;
    }

    toggleTheme() {
        const newTheme = this.theme === 'main' ? 'default' : 'main';
        this.setTheme(newTheme);
    }
}

// Countdown Timer Manager
class CountdownManager {
    constructor(targetDateString = null) {
        this.countdownInterval = null;
        this.targetDate = null;
        this.isActive = false;
        this.countdownElement = null;
        
        // *** DEFINA SUA DATA FINAL AQUI ***
        // Formato: 'YYYY-MM-DD HH:MM:SS' ou 'YYYY-MM-DDTHH:MM:SS'
        // Exemplos:
        // '2025-12-31 23:59:59' - Ano Novo
        // '2025-07-15 18:30:00' - 15 de julho às 18:30
        // '2025-06-30 12:00:00' - 30 de junho ao meio-dia
        const FINAL_DATE = targetDateString || '2025-12-31 23:59:59';
        
        this.setTargetDate(FINAL_DATE);
        this.init();
    }

    init() {
        // Check if countdown elements exist in DOM
        this.countdownElement = document.getElementById('countdown');
        if (!this.countdownElement) return;

        // Auto-start countdown if elements exist and target date is set
        if (this.countdownElement && this.targetDate) {
            this.startCountdown();
        }
    }

    setTargetDate(dateString) {
        try {
            // Handle different date formats
            let formattedDate = dateString;
            if (!dateString.includes('T') && dateString.includes(' ')) {
                formattedDate = dateString.replace(' ', 'T');
            }
            
            this.targetDate = new Date(formattedDate);
            
            // Validate the date
            if (isNaN(this.targetDate.getTime())) {
                throw new Error('Data inválida');
            }
            
            // Check if date is in the future
            if (this.targetDate <= new Date()) {
                console.warn('⚠️ Data definida já passou! Definindo para 24 horas a partir de agora.');
                this.targetDate = new Date();
                this.targetDate.setHours(this.targetDate.getHours() + 24);
            }
            
            console.log(`🎯 Countdown definido para: ${this.targetDate.toLocaleString('pt-BR')}`);
            
        } catch (error) {
            console.error('❌ Erro ao definir data do countdown:', error);
            // Fallback: 24 hours from now
            this.targetDate = new Date();
            this.targetDate.setHours(this.targetDate.getHours() + 24);
            console.log('🔄 Usando data padrão (24h a partir de agora)');
        }
    }

    startCountdown() {
        if (!this.targetDate) {
            console.error('❌ Data final não definida');
            return;
        }
        
        // Clear any existing interval
        this.stopCountdown();
        
        // Update immediately
        this.updateCountdown();
        
        // Update every second
        this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
        this.isActive = true;
        
        console.log('⏰ Countdown iniciado!');
    }

    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
            this.isActive = false;
            console.log('⏰ Countdown parado');
        }
    }

    // Método para atualizar a data final (útil para mudanças dinâmicas)
    updateTargetDate(newDateString) {
        const wasActive = this.isActive;
        this.stopCountdown();
        this.setTargetDate(newDateString);
        
        if (wasActive) {
            this.startCountdown();
        }
    }

    // Método para obter informações do countdown
    getCountdownInfo() {
        if (!this.targetDate) return null;
        
        const now = new Date().getTime();
        const distance = this.targetDate.getTime() - now;
        
        if (distance < 0) return { finished: true };
        
        return {
            finished: false,
            totalSeconds: Math.floor(distance / 1000),
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            targetDate: this.targetDate,
            isActive: this.isActive
        };
    }

    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.targetDate.getTime() - now;

        if (distance < 0) {
            // Countdown finished
            this.showCountdownFinished();
            this.stopCountdown();
            return;
        }

        // Show countdown, hide finished message
        this.showCountdownActive();

        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update display with zero padding
        this.updateTimeDisplay('days', days);
        this.updateTimeDisplay('hours', hours);
        this.updateTimeDisplay('minutes', minutes);
        this.updateTimeDisplay('seconds', seconds);
    }

    updateTimeDisplay(unit, value) {
        const element = document.getElementById(unit);
        if (element) {
            element.textContent = value.toString().padStart(2, '0');
        }
    }

    showCountdownActive() {
        const countdownDisplay = document.getElementById('countdown');
        const finishedDisplay = document.getElementById('finished');
        
        if (countdownDisplay) countdownDisplay.style.display = 'flex';
        if (finishedDisplay) finishedDisplay.style.display = 'none';
    }

    showCountdownFinished() {
        const countdownDisplay = document.getElementById('countdown');
        const finishedDisplay = document.getElementById('finished');
        
        if (countdownDisplay) countdownDisplay.style.display = 'none';
        if (finishedDisplay) finishedDisplay.style.display = 'block';
        
        Utils.showToast('🎉 Tempo esgotado!', 3000);
        
        // Add celebration animation
        this.triggerCelebration();
    }

    triggerCelebration() {
        // Add confetti-like effect using existing profile image
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.style.animation = 'celebration 2s ease-in-out';
            setTimeout(() => {
                profileImg.style.animation = '';
            }, 2000);
        }
    }

    // Simple countdown utility for other components
    static createSimpleCountdown(seconds, callback) {
        let timeLeft = seconds;
        
        const interval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(interval);
                if (callback) callback();
                return;
            }
            
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            console.log(`Countdown: ${mins}:${secs.toString().padStart(2, '0')}`);
            
            timeLeft--;
        }, 1000);
        
        return interval;
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
            document.querySelectorAll('.link-item, .social-link, .countdown-container').forEach(el => {
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

        // Observe all animated elements including countdown
        document.querySelectorAll('.link-item, .social-link, .profile-section, .countdown-container').forEach(el => {
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

    static addCountdownEffects() {
        // Add hover effects to countdown controls
        document.querySelectorAll('.countdown-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });

        // Add pulse effect to time units
        document.querySelectorAll('.time-unit').forEach(unit => {
            unit.addEventListener('mouseenter', () => {
                unit.style.transform = 'scale(1.1)';
                unit.style.transition = 'transform 0.2s ease';
            });

            unit.addEventListener('mouseleave', () => {
                unit.style.transform = 'scale(1)';
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

    // Format time for countdown display
    static formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    
    /* Countdown animations */
    .countdown-container {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .countdown-container.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .time-unit {
        transition: transform 0.2s ease;
    }
    
    .countdown-btn {
        transition: transform 0.2s ease;
    }
    
    .countdown-finished {
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes celebration {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(5deg); }
        50% { transform: scale(1.2) rotate(-5deg); }
        75% { transform: scale(1.1) rotate(5deg); }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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
        
        const countdownManager = new CountdownManager('2025-07-20 20:00:00');
        
        // Initialize animations
        AnimationUtils.observeElements();
        AnimationUtils.addProfileEffects();
        AnimationUtils.addSocialEffects();
        AnimationUtils.addCountdownEffects();
        
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
            
            // Ctrl+Space for countdown toggle
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                if (countdownManager.isActive) {
                    countdownManager.stopCountdown();
                } else {
                    countdownManager.startCountdown();
                }
            }
            
            // ESC to close any modals or reset animations
            if (e.key === 'Escape') {
                document.querySelectorAll('.clicked, .hover').forEach(el => {
                    el.classList.remove('clicked', 'hover');
                });
                countdownManager.stopCountdown();
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
                
                // Start a fun countdown
                CountdownManager.createSimpleCountdown(10, () => {
                    Utils.showToast('🎵 Beat drop! 🎶', 2000);
                });
                
                setTimeout(() => {
                    const profileImg = document.querySelector('.profile-img');
                    if (profileImg) {
                        profileImg.style.animation = '';
                    }
                }, 2000);
                konamiCode = [];
            }
        });
        
        // Store managers globally for potential external access
        window.bejotaManagers = {
            theme: themeManager,
            links: linksManager,
            countdown: countdownManager
        };
        
        console.log('🚀 bejota links carregado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        Utils.showToast('❌ Erro ao carregar links');
    }
});