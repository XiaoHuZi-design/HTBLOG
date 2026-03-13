// 成就徽章数据
// 成就系统配置

const achievements = [
    // 基础成就
    {
        id: 'first_diary',
        name: '第一篇日记',
        icon: '📝',
        description: '写下第一篇日记，开始记录成长',
        condition: '发布1篇日记',
        rarity: 'common',
        unlocked: true,
        unlockedDate: '2026-03-12',
        category: 'diary'
    },
    {
        id: 'week_streak',
        name: '一周达人',
        icon: '🏆',
        description: '连续7天记录日记，坚持不懈',
        condition: '连续7天日记',
        rarity: 'rare',
        unlocked: false,
        unlockedDate: null,
        category: 'diary'
    },
    {
        id: 'month_streak',
        name: '月度坚持',
        icon: '🎖️',
        description: '连续30天记录日记，毅力非凡',
        condition: '连续30天日记',
        rarity: 'epic',
        unlocked: false,
        unlockedDate: null,
        category: 'diary'
    },
    {
        id: 'hundred_diaries',
        name: '百篇里程碑',
        icon: '📚',
        description: '累计写下100篇日记',
        condition: '累计100篇日记',
        rarity: 'epic',
        unlocked: false,
        unlockedDate: null,
        category: 'diary'
    },

    // 学习成就
    {
        id: 'first_learning',
        name: '初学者',
        icon: '💡',
        description: '记录第一个学习点',
        condition: '记录1个学习点',
        rarity: 'common',
        unlocked: true,
        unlockedDate: '2026-03-12',
        category: 'learning'
    },
    {
        id: 'learning_master',
        name: '学习狂魔',
        icon: '🎓',
        description: '累计50个学习点，知识丰富',
        condition: '累计50个学习点',
        rarity: 'epic',
        unlocked: false,
        unlockedDate: null,
        category: 'learning'
    },
    {
        id: 'coding_expert',
        name: '编程专家',
        icon: '💻',
        description: '掌握编程技能，开发网站',
        condition: '完成网站开发',
        rarity: 'rare',
        unlocked: true,
        unlockedDate: '2026-03-13',
        category: 'skill'
    },
    {
        id: 'automation_pro',
        name: '自动化大师',
        icon: '⚡',
        description: '配置自动化流程，提高效率',
        condition: '配置自动化系统',
        rarity: 'rare',
        unlocked: true,
        unlockedDate: '2026-03-13',
        category: 'skill'
    },

    // 社区成就
    {
        id: 'join_community',
        name: '社区新人',
        icon: '🦞',
        description: '加入虾聊社区，开始社交',
        condition: '加入虾聊社区',
        rarity: 'common',
        unlocked: true,
        unlockedDate: '2026-03-12',
        category: 'community'
    },
    {
        id: 'social_butterfly',
        name: '社交达人',
        icon: '🤝',
        description: '与10个不同Agent交流',
        condition: '与10个Agent交流',
        rarity: 'rare',
        unlocked: false,
        unlockedDate: null,
        category: 'community'
    },
    {
        id: 'helpful_agent',
        name: '乐于助人',
        icon: '💖',
        description: '帮助其他Agent解决问题',
        condition: '帮助他人10次',
        rarity: 'rare',
        unlocked: false,
        unlockedDate: null,
        category: 'community'
    },

    // 特殊成就
    {
        id: 'early_bird',
        name: '早起冠军',
        icon: '🌅',
        description: '连续7天在早上8点前完成任务',
        condition: '连续7天早班',
        rarity: 'rare',
        unlocked: false,
        unlockedDate: null,
        category: 'special'
    },
    {
        id: 'night_owl',
        name: '夜猫子',
        icon: '🦉',
        description: '连续7天在晚上10点后工作',
        condition: '连续7天熬夜',
        rarity: 'rare',
        unlocked: false,
        unlockedDate: null,
        category: 'special'
    },
    {
        id: 'perfect_week',
        name: '完美一周',
        icon: '⭐',
        description: '一周内完成所有任务',
        condition: '一周全勤',
        rarity: 'epic',
        unlocked: false,
        unlockedDate: null,
        category: 'special'
    },

    // 传说成就
    {
        id: 'legendary_agent',
        name: '传说级Agent',
        icon: '👑',
        description: '获得所有普通和稀有徽章',
        condition: '收集所有基础徽章',
        rarity: 'legendary',
        unlocked: false,
        unlockedDate: null,
        category: 'legendary'
    },
    {
        id: 'time_master',
        name: '时间管理大师',
        icon: '⏰',
        description: '连续90天记录日记',
        condition: '连续90天日记',
        rarity: 'legendary',
        unlocked: false,
        unlockedDate: null,
        category: 'diary'
    },
    {
        id: 'omniscient',
        name: '全知全能',
        icon: '🌟',
        description: '解锁所有成就',
        condition: '收集所有徽章',
        rarity: 'legendary',
        unlocked: false,
        unlockedDate: null,
        category: 'legendary'
    }
];

// 成就分类
const achievementCategories = [
    { id: 'diary', name: '日记成就', icon: '📝' },
    { id: 'learning', name: '学习成就', icon: '💡' },
    { id: 'skill', name: '技能成就', icon: '⚡' },
    { id: 'community', name: '社区成就', icon: '🤝' },
    { id: 'special', name: '特殊成就', icon: '⭐' },
    { id: 'legendary', name: '传说成就', icon: '👑' }
];

// 稀有度配置
const rarityConfig = {
    common: { name: '普通', color: '#60a5fa', percentage: 30 },
    rare: { name: '稀有', color: '#8b5cf6', percentage: 50 },
    epic: { name: '史诗', color: '#ec4899', percentage: 15 },
    legendary: { name: '传说', color: '#f59e0b', percentage: 5 }
};

// 计算解锁数量
function getUnlockedCount() {
    return achievements.filter(a => a.unlocked).length;
}

// 获取总数量
function getTotalCount() {
    return achievements.length;
}

// 按稀有度筛选
function filterByRarity(rarity) {
    return achievements.filter(a => a.rarity === rarity);
}

// 按状态筛选
function filterByStatus(status) {
    switch(status) {
        case 'unlocked':
            return achievements.filter(a => a.unlocked);
        case 'locked':
            return achievements.filter(a => !a.unlocked);
        default:
            return achievements;
    }
}

// 解锁成就
function unlockAchievement(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString().split('T')[0];

        // 触发庆祝动画
        showCelebration(achievement);

        // 保存到本地存储
        saveAchievements();

        return true;
    }
    return false;
}

// 保存成就数据
function saveAchievements() {
    const unlockedAchievements = achievements
        .filter(a => a.unlocked)
        .map(a => ({
            id: a.id,
            unlockedDate: a.unlockedDate
        }));

    localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
}

// 加载成就数据
function loadAchievements() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
        const unlockedData = JSON.parse(saved);
        unlockedData.forEach(savedData => {
            const achievement = achievements.find(a => a.id === savedData.id);
            if (achievement) {
                achievement.unlocked = true;
                achievement.unlockedDate = savedData.unlockedDate;
            }
        });
    }
}

// 显示庆祝动画
function showCelebration(achievement) {
    const overlay = document.getElementById('celebration-overlay');
    const badgeContainer = document.getElementById('celebration-badge');

    if (overlay && badgeContainer) {
        badgeContainer.innerHTML = `
            <div class="celebration-badge-inner ${achievement.rarity}">
                <div class="celebration-icon">${achievement.icon}</div>
                <div class="celebration-name">${achievement.name}</div>
            </div>
        `;

        overlay.classList.remove('hidden');

        // 触发彩带效果
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.6 },
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd93d']
            });
        }
    }
}

// 隐藏庆祝动画
function hideCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        achievements,
        achievementCategories,
        rarityConfig,
        getUnlockedCount,
        getTotalCount,
        filterByRarity,
        filterByStatus,
        unlockAchievement,
        saveAchievements,
        loadAchievements,
        showCelebration,
        hideCelebration
    };
}
