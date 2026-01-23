// 主题切换功能
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const skyBody = document.getElementById('sky-body');
const robot = document.getElementById('robot');
const cardToggle = document.getElementById('card-toggle');
const cardSection = document.getElementById('card-section');
const closeCardBtn = document.getElementById('close-card');

let isDay = true;
let cardSwiper = null;

// 切换日夜模式
themeToggle.addEventListener('click', () => {
    isDay = !isDay;
    body.classList.toggle('day', isDay);
    body.classList.toggle('night', !isDay);
    skyBody.className = isDay ? 'sky-body sun' : 'sky-body moon';

    if (!isDay) {
        addStars();
        addShootingStars();
        stopSakura();
    } else {
        document.querySelectorAll('.star, .shooting-star').forEach(el => el.remove());
        startSakura();
    }
});

// 卡片展示切换
cardToggle.addEventListener('click', (e) => {
    e.preventDefault();
    cardSection.classList.toggle('hidden');
    if (!cardSection.classList.contains('hidden') && !cardSwiper) {
        initCardSwiper();
    }
});

closeCardBtn.addEventListener('click', () => {
    cardSection.classList.add('hidden');
});

// 初始化卡片Swiper
function initCardSwiper() {
    cardSwiper = new Swiper('.card-swiper', {
        effect: 'cards',
        grabCursor: true,
        loop: true,
        speed: 500,
        keyboard: {
            enabled: true,
        },
    });
}

// ===== Game 区域的开关逻辑 =====
const gameToggle = document.getElementById('game-toggle');   // 上面的 Game 按钮
const gameSection = document.getElementById('game-section'); // 下面的游戏区域
const closeGameBtn = document.getElementById('close-game');  // 右上角的 ✕

if (gameToggle && gameSection) {
    gameToggle.addEventListener('click', (e) => {
        e.preventDefault();               // 阻止 <a> 默认跳转
        gameSection.classList.toggle('hidden');  // 显示 / 隐藏
    });
}

if (closeGameBtn && gameSection) {
    closeGameBtn.addEventListener('click', () => {
        gameSection.classList.add('hidden');     // 关闭
    });
}

// 添加星星
function addStars() {
    const starsContainer = document.getElementById('stars-container');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 7 + 3;
        star.classList.add('star');
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.animationDuration = Math.random() * 5 + 5 + 's';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// 添加流星
function addShootingStars() {
    const starsContainer = document.getElementById('stars-container');
    for (let i = 0; i < 2; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.top = Math.random() * 50 + 'vh';
        shootingStar.style.left = Math.random() * 50 + 'vw';
        shootingStar.style.animationDelay = `${Math.random() * 5}s`;
        starsContainer.appendChild(shootingStar);
    }
}

// 樱花飘落效果
let sakuraInterval = null;

function createSakura() {
    const sakuraContainer = document.getElementById('sakura-container');
    if (!sakuraContainer) return;

    const sakura = document.createElement('div');
    sakura.className = 'sakura';
    sakura.innerHTML = '🌸';
    sakura.style.left = Math.random() * 100 + 'vw';
    sakura.style.animationDuration = (Math.random() * 3 + 4) + 's';
    sakura.style.opacity = Math.random() * 0.6 + 0.4;
    sakura.style.fontSize = (Math.random() * 10 + 10) + 'px';

    sakuraContainer.appendChild(sakura);

    setTimeout(() => {
        sakura.remove();
    }, 7000);
}

function startSakura() {
    if (sakuraInterval) return;
    sakuraInterval = setInterval(createSakura, 300);
}

function stopSakura() {
    if (sakuraInterval) {
        clearInterval(sakuraInterval);
        sakuraInterval = null;
    }
    const sakuraContainer = document.getElementById('sakura-container');
    if (sakuraContainer) {
        sakuraContainer.innerHTML = '';
    }
}

// 机器人互动消息 - 二次元风格
const messages = [
    "欧尼酱，今天也要元气满满哦~",
    "你好呀！今天也是可爱的一天！",
    "生活总是充满惊喜desu~",
    "哇，你真棒呢！给你比个心💕",
    "开心每一天！Fighting!",
    "要好好照顾自己哦，笨蛋~",
    "今天的你也超级闪耀✨",
    "加油！相信自己！",
    "(*^▽^*) 嘿嘿~",
    "一起来看看有趣的文章吧！"
];

robot.addEventListener('click', () => {
    const message = messages[Math.floor(Math.random() * messages.length)];
    const messageEl = document.createElement('div');
    messageEl.className = 'robot-message animate__animated animate__fadeIn';
    messageEl.textContent = message;
    messageEl.style.position = 'absolute';
    messageEl.style.top = '-40px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    // 根据当前主题设置不同的样式
    if (body.classList.contains('night')) {
        messageEl.style.background = 'rgba(255, 255, 255, 0.95)';
        messageEl.style.color = '#0a0a2a';
        messageEl.style.boxShadow = '0 2px 10px rgba(255, 255, 255, 0.2)';
    } else {
        messageEl.style.background = 'rgba(255, 255, 255, 0.9)';
        messageEl.style.color = '#6a4a3c';
        messageEl.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    messageEl.style.padding = '8px 16px';
    messageEl.style.borderRadius = '20px';
    messageEl.style.fontSize = '1.1rem';
    messageEl.style.fontWeight = '500';
    messageEl.style.zIndex = '1000';
    messageEl.style.whiteSpace = 'nowrap';

    // 添加可爱的表情
    const randomEmoji = ['💖', '✨', '🌟', '🎈', '🌸', '🍀', '💫', '🎀'][Math.floor(Math.random() * 8)];
    messageEl.textContent = `${randomEmoji} ${message} ${randomEmoji}`;

    robot.appendChild(messageEl);

    // 添加消失动画
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(-50%) translateY(-20px)';
        messageEl.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            messageEl.remove();
        }, 500);
    }, 2000);
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    body.classList.add('day');
    startSakura();
}); 