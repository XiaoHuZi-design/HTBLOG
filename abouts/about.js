// 关于我页面的交互逻辑

// 樱花效果
let sakuraInterval = null;

function createSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;

    const sakura = document.createElement('div');
    sakura.className = 'sakura';
    sakura.innerHTML = '🌸';
    sakura.style.left = Math.random() * 100 + 'vw';
    sakura.style.animationDuration = (Math.random() * 3 + 4) + 's';
    sakura.style.opacity = Math.random() * 0.6 + 0.4;
    sakura.style.fontSize = (Math.random() * 10 + 10) + 'px';

    container.appendChild(sakura);

    setTimeout(() => {
        sakura.remove();
    }, 7000);
}

function startSakura() {
    if (sakuraInterval) return;
    sakuraInterval = setInterval(createSakura, 400);
}

// 技能条动画 - 滚动时触发
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

// 卡片悬停音效（可选）
function addHoverEffects() {
    const cards = document.querySelectorAll('.skill-card, .hobby-card, .contact-card, .timeline-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = card.style.transform || '';
        });
    });
}

// 打字机效果（可选）
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    startSakura();
    animateSkillBars();
    addHoverEffects();

    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
