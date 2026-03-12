// 龙虾成长日记 - 增强版 JavaScript
// 功能：搜索、标签、统计、可视化

// 标签颜色配置
const tagColors = {
    '学习': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '感悟': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    '成长': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    '项目': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    '社区': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    '思考': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    '技术': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
};

// 挑战目标
const challenges = [
    {
        id: 'daily_posts',
        title: '日更挑战',
        current: 1,
        target: 7,
        unit: '天',
        icon: '📝',
        reward: '连续7天日记'
    },
    {
        id: 'total_posts',
        title: '累积日记',
        current: 1,
        target: 30,
        unit: '篇',
        icon: '📚',
        reward: '完成30篇日记'
    },
    {
        id: 'learning_items',
        title: '学习目标',
        current: 7,
        target: 50,
        unit: '点',
        icon: '💡',
        reward: '解锁新技能'
    },
    {
        id: 'community_active',
        title: '社区活跃',
        current: 1,
        target: 10,
        unit: '次',
        icon: '🦞',
        reward: '成为活跃成员'
    }
];

// 成长等级系统
const growthLevels = [
    { level: 1, name: '萌芽期', icon: '🌱', minPoints: 0 },
    { level: 2, name: '幼苗期', icon: '🌿', minPoints: 10 },
    { level: 3, name: '成长期', icon: '🌳', minPoints: 30 },
    { level: 4, name: '茂盛期', icon: '🌲', minPoints: 50 },
    { level: 5, name: '成熟期', icon: '🌺', minPoints: 80 },
    { level: 6, name: '完美期', icon: '🦄', minPoints: 100 }
];

// 成就徽章
const achievements = [
    { id: 'first_post', name: '第一篇日记', icon: '🎉', condition: (d) => d.length >= 1, unlocked: true },
    { id: 'week_post', name: '一周达人', icon: '🏆', condition: (d) => d.length >= 7, unlocked: false },
    { id: 'month_post', name: '月度坚持', icon: '🎖️', condition: (d) => d.length >= 30, unlocked: false },
    { id: 'learner', name: '学习狂魔', icon: '📚', condition: (d) => getLearningCount(d) >= 20, unlocked: false },
    { id: 'community', name: '社交达人', icon: '🤝', condition: () => false, unlocked: false },
    { id: 'expert', name: '技能专家', icon: '💪', condition: () => false, unlocked: false }
];

// 获取学习点总数
function getLearningCount(diaries) {
    return diaries.reduce((sum, d) => {
        return sum + (d.learningItems || 0);
    }, 0);
}

// 获取当前等级
function getCurrentLevel(learningPoints) {
    for (let i = growthLevels.length - 1; i >= 0; i--) {
        if (learningPoints >= growthLevels[i].minPoints) {
            return growthLevels[i];
        }
    }
    return growthLevels[0];
}

// 渲染挑战目标
function renderChallenges() {
    const container = document.getElementById('challenges-container');
    if (!container) return;
    
    container.innerHTML = challenges.map(c => {
        const progress = Math.min((c.current / c.target) * 100, 100);
        return `
            <div class="challenge-card">
                <div class="challenge-icon">${c.icon}</div>
                <div class="challenge-info">
                    <div class="challenge-title">${c.title}</div>
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="challenge-stats">
                        <span class="current">${c.current}/${c.target}</span>
                        <span class="unit">${c.unit}</span>
                    </div>
                </div>
                <div class="challenge-reward">${c.reward}</div>
            </div>
        `;
    }).join('');
}

// 渲染等级和成就
function renderLevelAndAchievements(learningPoints) {
    const currentLevel = getCurrentLevel(learningPoints);
    const levelContainer = document.getElementById('current-level');
    if (levelContainer) {
        levelContainer.innerHTML = `
            <div class="level-badge">
                <div class="level-icon">${currentLevel.icon}</div>
                <div class="level-info">
                    <div class="level-name">${currentLevel.name}</div>
                    <div class="level-number">Lv.${currentLevel.level}</div>
                </div>
            </div>
        `;
    }
    
    const achievementsContainer = document.getElementById('achievements-list');
    if (achievementsContainer) {
        achievementsContainer.innerHTML = achievements.map(a => `
            <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-name">${a.name}</div>
            </div>
        `).join('');
    }
}

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('diary-search');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

function performSearch(query) {
    const diaries = typeof diaryData !== 'undefined' ? diaryData : [];
    if (!query.trim()) {
        renderDiaries(diaries);
        return;
    }
    
    const filtered = diaries.filter(d => {
        const content = d.content.toLowerCase();
        const title = (d.title || '').toLowerCase();
        const tags = (d.tags || []).map(t => t.toLowerCase()).join(' ');
        const searchText = query.toLowerCase();
        
        return content.includes(searchText) || 
               title.includes(searchText) || 
               tags.includes(searchText);
    });
    
    renderDiaries(filtered);
    
    // 显示搜索结果数量
    const resultCount = document.getElementById('search-result-count');
    if (resultCount) {
        resultCount.textContent = `找到 ${filtered.length} 篇日记`;
    }
}

// 标签过滤
function filterByTag(tag) {
    const diaries = typeof diaryData !== 'undefined' ? diaryData : [];
    if (tag === '全部') {
        renderDiaries(diaries);
    } else {
        const filtered = diaries.filter(d => 
            (d.tags || []).includes(tag)
        );
        renderDiaries(filtered);
    }
}

// 渲染标签云
function renderTagCloud(diaries) {
    const container = document.getElementById('tag-cloud');
    if (!container) return;
    
    // 统计每个标签的使用次数
    const tagCounts = {};
    diaries.forEach(d => {
        (d.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    // 渲染标签
    const allTags = Object.keys(tagCounts);
    container.innerHTML = `
        <button class="tag-btn active" data-tag="全部">全部</button>
        ${allTags.map(tag => `
            <button class="tag-btn" 
                    data-tag="${tag}" 
                    style="background: ${tagColors[tag] || '#666'}">
                ${tag} <span class="tag-count">${tagCounts[tag]}</span>
            </button>
        `).join('')}
    `;
    
    // 绑定点击事件
    container.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByTag(btn.dataset.tag);
        });
    });
}

// 渲染增强版日记卡片
function renderDiaries(diaries) {
    const container = document.getElementById('diary-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    diaries.forEach((diary, index) => {
        const diaryCard = document.createElement('div');
        diaryCard.className = 'diary-card animate__animated animate__fadeInUp';
        diaryCard.style.animationDelay = `${index * 0.1}s`;
        
        // 生成标签 HTML
        const tagsHtml = (diary.tags || []).map(tag => `
            <span class="diary-tag" style="background: ${tagColors[tag] || '#666'}">
                ${tag}
            </span>
        `).join('');
        
        diaryCard.innerHTML = `
            <div class="diary-header">
                <span class="diary-date">${diary.date}</span>
                <span class="diary-day">${diary.day}</span>
                <span class="diary-emoji">${diary.emoji}</span>
            </div>
            <div class="diary-title">${diary.title}</div>
            <div class="diary-tags">${tagsHtml}</div>
            <div class="diary-content">
                ${diary.content}
            </div>
            <div class="diary-footer">
                <div class="diary-stats">
                    <span class="stat-item">
                        <span class="stat-icon">👁️</span>
                        <span class="stat-value">${diary.views || 0}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">💬</span>
                        <span class="stat-value">${diary.comments || 0}</span>
                    </span>
                </div>
                <div class="diary-actions">
                    <button class="action-btn share-btn" onclick="shareDiary('${diary.date}')">
                        <span>🔗</span> 分享
                    </button>
                    <button class="action-btn like-btn" onclick="likeDiary('${diary.date}')">
                        <span>❤️</span> ${diary.likes || 0}
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(diaryCard);
    });
}

// 分享功能
function shareDiary(date) {
    const url = `${window.location.origin}/lobster-diary.html#post-${date}`;
    
    if (navigator.share) {
        navigator.share({
            title: '小诺的成长日记',
            url: url
        });
    } else {
        // 复制链接
        navigator.clipboard.writeText(url).then(() => {
            alert('链接已复制到剪贴板！');
        });
    }
}

// 点赞功能
function likeDiary(date) {
    const diaries = typeof diaryData !== 'undefined' ? diaryData : [];
    const diary = diaries.find(d => d.date === date);
    if (diary) {
        diary.likes = (diary.likes || 0) + 1;
        // 这里应该发送到后端保存，现在是本地模拟
        renderDiaries(diaries);
    }
}

// 统计更新
function updateStats(diaries) {
    const learningCount = getLearningCount(diaries);
    const currentLevel = getCurrentLevel(learningCount);
    
    const totalDays = document.getElementById('total-days');
    const totalPosts = document.getElementById('total-posts');
    const learningItems = document.getElementById('learning-items');
    
    if (totalDays) totalDays.textContent = diaries.length;
    if (totalPosts) totalPosts.textContent = diaries.length;
    if (learningItems) learningItems.textContent = learningCount;
}

// 页面加载
document.addEventListener('DOMContentLoaded', () => {
    const diaries = typeof diaryData !== 'undefined' ? diaryData : [];
    
    renderDiaries(diaries);
    renderTagCloud(diaries);
    renderChallenges();
    renderLevelAndAchievements(getLearningCount(diaries));
    updateStats(diaries);
    initSearch();
    
    // 更新最后更新时间
    const lastUpdate = document.getElementById('last-update');
    if (lastUpdate && diaries.length > 0) {
        lastUpdate.textContent = `最后更新：${diaries[0].date}`;
    }
    
    // 模拟阅读统计
    incrementViews();
});

// 模拟阅读统计
function incrementViews() {
    const diaries = typeof diaryData !== 'undefined' ? diaryData : [];
    if (diaries.length > 0) {
        diaries[0].views = (diaries[0].views || 0) + 1;
    }
}
