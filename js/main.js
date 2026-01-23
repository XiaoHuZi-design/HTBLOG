/**
 * ============================================
 * 机械仔的小站 - 统一主脚本
 * ============================================
 */

// ==================== 配置 ====================
const CONFIG = {
    GITHUB: {
        owner: 'XiaoHuZi-design',
        repo: 'HTBLOG',
        branch: 'main',
        path: 'posts'
    },
    GITALK: {
        clientID: 'Ov23litZBDaEbUtqG4PL',
        clientSecret: 'ba2e7cc6838a651fd8a43242351fdce6ae00b9fa',
        repo: 'HTBLOG',
        owner: 'XiaoHuZi-design',
        admin: ['XiaoHuZi-design']
    }
};

// ==================== 全局状态 ====================
let sakuraInterval = null;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initBackToTop();
    initSakura();
    initStars();
    loadStats();
    loadLatestPosts();
});

// ==================== 主题系统 ====================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('siteTheme') || 'sakura';

    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('sakura-theme') ? 'sakura' : 'star';
            const newTheme = currentTheme === 'sakura' ? 'star' : 'sakura';

            setTheme(newTheme);
            localStorage.setItem('siteTheme', newTheme);
        });
    }
}

function setTheme(theme) {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    body.classList.remove('sakura-theme', 'star-theme');
    body.classList.add(theme + '-theme');

    if (themeIcon) {
        themeIcon.textContent = theme === 'sakura' ? '🌸' : '✨';
    }
}

// ==================== 移动端菜单 ====================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuBtn && mobileNav) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });

        // 点击链接后关闭菜单
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
                menuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
            }
        });
    }
}

// ==================== 回到顶部 ====================
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');

    if (backToTop) {
        // 滚动时显示/隐藏
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, 100));

        // 点击回到顶部
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==================== 樱花飘落效果 ====================
function initSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;

    const sakuraSymbols = ['🌸', '✿', '❀', '💮'];

    const createSakura = () => {
        const sakura = document.createElement('div');
        sakura.className = 'sakura';
        sakura.textContent = sakuraSymbols[Math.floor(Math.random() * sakuraSymbols.length)];

        sakura.style.left = Math.random() * 100 + '%';
        sakura.style.fontSize = (Math.random() * 15 + 10) + 'px';
        sakura.style.opacity = Math.random() * 0.5 + 0.5;

        const duration = Math.random() * 5 + 8;
        sakura.style.animationDuration = duration + 's';

        container.appendChild(sakura);

        setTimeout(() => sakura.remove(), duration * 1000);
    };

    // 初始创建
    for (let i = 0; i < 15; i++) {
        setTimeout(createSakura, Math.random() * 3000);
    }

    // 持续创建
    sakuraInterval = setInterval(createSakura, 800);
}

// ==================== 星星背景效果 ====================
function initStars() {
    const container = document.getElementById('stars-container');
    if (!container) return;

    const createStar = () => {
        const star = document.createElement('div');
        star.className = 'star';

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';

        container.appendChild(star);
    };

    for (let i = 0; i < 50; i++) {
        createStar();
    }
}

// ==================== GitHub API ====================
async function githubAPI(endpoint) {
    const url = `https://api.github.com${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
}

// Expose to window for other scripts to use
window.githubAPI = githubAPI;

function decodeBase64(str) {
    try {
        const binaryStr = atob(str);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        return decodeURIComponent(escape(atob(str)));
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseMarkdown(content, filename) {
    const post = {
        title: filename.replace('.md', ''),
        date: new Date().toISOString().split('T')[0],
        tags: [],
        excerpt: '',
        wordCount: 0
    };

    // 解析 Front Matter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (fmMatch) {
        const frontMatter = fmMatch[1];
        post.content = fmMatch[2];

        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        if (titleMatch) post.title = titleMatch[1].trim().replace(/^["']|["']$/g, '');

        const dateMatch = frontMatter.match(/date:\s*(.+)/);
        if (dateMatch) post.date = dateMatch[1].trim();

        const tagsMatch = frontMatter.match(/tags:\s*\[([^\]]+)\]/);
        if (tagsMatch) {
            post.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
        }
    } else {
        post.content = content;
    }

    // 生成摘要
    const plainText = post.content.replace(/[#*`\[\]()]/g, '').trim();
    post.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // 计算字数
    const chineseChars = (post.content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (post.content.replace(/[\u4e00-\u9fa5]/g, '').match(/[a-zA-Z]+/g) || []).length;
    post.wordCount = chineseChars + englishWords;

    return post;
}

// ==================== 加载统计信息 ====================
async function loadStats() {
    const postsEl = document.getElementById('stat-posts');
    const notesEl = document.getElementById('stat-notes');
    const wordsEl = document.getElementById('stat-words');

    if (!postsEl) return;

    try {
        // 加载博客文章统计
        const files = await githubAPI(`/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.path}?ref=${CONFIG.GITHUB.branch}`);
        const mdFiles = files.filter(f => f.name.endsWith('.md'));

        postsEl.textContent = mdFiles.length;

        // 计算总字数
        let totalWords = 0;
        for (const file of mdFiles.slice(0, 10)) { // 限制加载数量
            try {
                const content = await githubAPI(`/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.path}/${file.name}?ref=${CONFIG.GITHUB.branch}`);
                const decoded = decodeBase64(content.content);
                const parsed = parseMarkdown(decoded, file.name);
                totalWords += parsed.wordCount;
            } catch (e) {
                console.warn(`Failed to load ${file.name}:`, e);
            }
        }

        wordsEl.textContent = formatNumber(totalWords);

        // 加载笔记统计
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            const notes = JSON.parse(savedNotes);
            notesEl.textContent = notes.length;
        } else {
            notesEl.textContent = '0';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
        postsEl.textContent = '0';
        notesEl.textContent = '0';
        wordsEl.textContent = '0';
    }
}

// ==================== 加载最新文章 ====================
async function loadLatestPosts() {
    const container = document.getElementById('latest-posts-grid');
    if (!container) return;

    try {
        const files = await githubAPI(`/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.path}?ref=${CONFIG.GITHUB.branch}`);
        const mdFiles = files.filter(f => f.name.endsWith('.md')).slice(0, 3);

        const posts = await Promise.all(
            mdFiles.map(async (file) => {
                const content = await githubAPI(`/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.path}/${file.name}?ref=${CONFIG.GITHUB.branch}`);
                const decoded = decodeBase64(content.content);
                const parsed = parseMarkdown(decoded, file.name);
                return { ...parsed, path: file.path };
            })
        );

        // 按日期排序
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 渲染文章卡片
        container.innerHTML = posts.map(post => `
            <a href="blogs/blog.html" class="post-card">
                <div class="post-cover">
                    <img src="https://picsum.photos/400/250?random=${hashCode(post.title)}" alt="${escapeHtml(post.title)}">
                </div>
                <div class="post-content">
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
                    <div class="post-meta">
                        <span>📅 ${post.date}</span>
                        <div class="post-tags">
                            ${post.tags.slice(0, 2).map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Failed to load posts:', error);
        container.innerHTML = `
            <div class="card text-center">
                <p>文章加载中...</p>
            </div>
        `;
    }
}

// ==================== 工具函数 ====================
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function formatNumber(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== 导航栏滚动效果 ====================
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// ==================== 鼠标跟随特效 ====================
class CursorTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 20;
        this.currentTheme = 'sakura';
        this.init();
    }

    init() {
        // 检测当前主题
        this.updateTheme();

        // 监听主题变化
        const observer = new MutationObserver(() => this.updateTheme());
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        // 监听鼠标移动
        document.addEventListener('mousemove', (e) => this.addTrail(e));

        // 开始动画循环
        this.animate();
    }

    updateTheme() {
        if (document.body.classList.contains('star-theme')) {
            this.currentTheme = 'star';
        } else {
            this.currentTheme = 'sakura';
        }
    }

    addTrail(e) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';

        if (this.currentTheme === 'sakura') {
            trail.innerHTML = '🌸';
            trail.style.color = '#ffb3d1';
        } else {
            trail.innerHTML = '✨';
            trail.style.color = '#ffd700';
        }

        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.position = 'fixed';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9999';
        trail.style.fontSize = '16px';
        trail.style.opacity = '1';
        trail.style.transition = 'all 0.8s ease-out';

        document.body.appendChild(trail);
        this.trails.push(trail);

        // 限制轨迹数量
        if (this.trails.length > this.maxTrails) {
            const oldTrail = this.trails.shift();
            oldTrail.remove();
        }
    }

    animate() {
        this.trails.forEach((trail, index) => {
            const progress = index / this.trails.length;
            trail.style.opacity = 1 - progress;
            trail.style.transform = `translateY(${index * 2}px) scale(${1 - progress * 0.5})`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// 初始化鼠标跟随
document.addEventListener('DOMContentLoaded', () => {
    // 只在非触摸设备上启用
    if (window.matchMedia('(hover: hover)').matches) {
        new CursorTrail();
    }
});

console.log('✿ 机械仔的小站已加载 ~ 欢迎访问 ✿');
