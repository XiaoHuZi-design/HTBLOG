// 成就徽章墙页面交互

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载成就数据
    loadAchievements();

    // 渲染成就网格
    renderAchievements();

    // 渲染进度
    renderProgress();

    // 绑定筛选按钮事件
    bindFilterEvents();
});

// 渲染成就网格
function renderAchievements(filter = 'all') {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    let filteredAchievements = achievements;

    // 根据筛选条件过滤
    if (filter === 'unlocked') {
        filteredAchievements = achievements.filter(a => a.unlocked);
    } else if (filter === 'locked') {
        filteredAchievements = achievements.filter(a => !a.unlocked);
    }

    container.innerHTML = filteredAchievements.map(achievement => {
        const rarityClass = achievement.rarity;
        const unlockedClass = achievement.unlocked ? 'unlocked' : 'locked';

        return `
            <div class="achievement-card ${rarityClass} ${unlockedClass}" data-id="${achievement.id}">
                <div class="achievement-header">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-rarity">${rarityConfig[achievement.rarity].name}</div>
                    </div>
                </div>
                <div class="achievement-description">
                    ${achievement.description}
                </div>
                <div class="achievement-condition">
                    <i class="fas fa-lock"></i>
                    ${achievement.condition}
                </div>
                ${achievement.unlocked ? `
                    <div class="achievement-date">
                        <i class="fas fa-calendar"></i>
                        解锁于：${achievement.unlockedDate}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    // 添加卡片点击事件
    bindAchievementClickEvents();
}

// 渲染进度
function renderProgress() {
    const unlockedCount = getUnlockedCount();
    const totalCount = getTotalCount();
    const percentage = Math.round((unlockedCount / totalCount) * 100);

    // 更新数字
    const unlockedCountEl = document.getElementById('unlocked-count');
    const totalCountEl = document.getElementById('total-count');
    const percentageEl = document.getElementById('progress-percentage');
    const progressFillEl = document.getElementById('overall-progress');

    if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (percentageEl) percentageEl.textContent = percentage;
    if (progressFillEl) {
        // 延迟一点以显示动画
        setTimeout(() => {
            progressFillEl.style.width = percentage + '%';
        }, 100);
    }
}

// 绑定筛选按钮事件
function bindFilterEvents() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // 添加当前按钮的active类
            this.classList.add('active');

            // 获取筛选条件
            const filter = this.getAttribute('data-filter');

            // 重新渲染成就
            renderAchievements(filter);
        });
    });
}

// 绑定成就卡片点击事件
function bindAchievementClickEvents() {
    const achievementCards = document.querySelectorAll('.achievement-card');

    achievementCards.forEach(card => {
        card.addEventListener('click', function() {
            const achievementId = this.getAttribute('data-id');
            const achievement = achievements.find(a => a.id === achievementId);

            if (achievement) {
                // 创建提示框
                showAchievementDetail(achievement);
            }
        });
    });
}

// 显示成就详情
function showAchievementDetail(achievement) {
    const rarityColor = rarityConfig[achievement.rarity].color;
    const rarityName = rarityConfig[achievement.rarity].name;

    // 使用原生alert或创建自定义弹窗
    const message = `
🏆 ${achievement.name}

📝 ${achievement.description}

⚡ 解锁条件：${achievement.condition}

🌟 稀有度：${rarityName}

${achievement.unlocked ? `✓ 已解锁于：${achievement.unlockedDate}` : '🔒 尚未解锁'}
    `;

    alert(message);
}

// 隐藏庆祝动画
window.hideCelebration = function() {
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
};

// 添加页面滚动动画
window.addEventListener('scroll', function() {
    const achievementCards = document.querySelectorAll('.achievement-card');

    achievementCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible && !card.classList.contains('animate__fadeIn')) {
            card.classList.add('animate__animated', 'animate__fadeIn');
        }
    });
});

// 页面加载完成后触发一次滚动动画
setTimeout(() => {
    window.dispatchEvent(new Event('scroll'));
}, 500);
