/**
 * 二次元博客页面交互脚本
 * 功能：樱花飘落、星星背景、主题切换、GitHub博客集成、文章模态框、评论系统
 */

// ==================== 配置 ====================
// 默认仓库配置（公开读取，无需Token）
const DEFAULT_REPO = {
    owner: 'XiaoHuZi-design',
    repo: 'HTBLOG',
    branch: 'main',
    path: 'posts'
};

// Gitalk 配置（需要用户自行配置）
const gitalkConfig = {
    clientID: 'Ov23litZBDaEbUtqG4PL',
    clientSecret: 'ba2e7cc6838a651fd8a43242351fdce6ae00b9fa',
    repo: 'HTBLOG',
    owner: 'XiaoHuZi-design',
    admin: ['XiaoHuZi-design'],
    distractionFreeMode: false,
    language: 'zh-CN'
};

// 全局状态
let allPosts = [];
let filteredPosts = [];
let allTags = new Set();
let currentGitalk = null;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initMarked();
    initSakura();
    initStars();
    initThemeToggle();
    initTabSwitch();
    initLightbox();
    initBlogSystem();
    initPostModal();
});

// 初始化 Marked 配置
function initMarked() {
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
    }
}

// ==================== GitHub 博客系统 ====================
async function initBlogSystem() {
    showLoading(true);
    try {
        await loadPostsFromGitHub();
        updateStats();
        renderTagsFilter();
        renderPosts(allPosts);
        showLoading(false);
    } catch (error) {
        console.error('加载失败:', error);
        showEmpty();
        showLoading(false);
    }
}

// 从公开仓库加载文章
async function loadPostsFromGitHub() {
    const { owner, repo, branch, path } = DEFAULT_REPO;
    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const files = await publicGithubAPI(endpoint);
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
        showEmpty();
        return;
    }

    // 获取每篇文章的内容
    allPosts = await Promise.all(
        mdFiles.map(async (file) => {
            const content = await publicGithubAPI(`/repos/${owner}/${repo}/contents/${path}/${file.name}?ref=${branch}`);
            const decoded = decodeBase64(content.content);
            const parsed = parseMarkdown(decoded, file.name);
            return {
                ...parsed,
                sha: content.sha,
                path: file.path,
                filename: file.name
            };
        })
    );

    // 按日期排序
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 收集所有标签
    allTags = new Set();
    allPosts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });

    filteredPosts = [...allPosts];
}

// 公开 API 请求
async function publicGithubAPI(endpoint) {
    const baseUrl = 'https://api.github.com';
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '请求失败');
    }

    return response.json();
}

// 解析 Markdown 文章
function parseMarkdown(content, filename) {
    const post = {
        title: filename.replace('.md', ''),
        date: new Date().toISOString().split('T')[0],
        tags: [],
        content: content,
        excerpt: '',
        wordCount: 0,
        coverImage: null
    };

    // 解析 Front Matter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (fmMatch) {
        const frontMatter = fmMatch[1];
        post.content = fmMatch[2];

        // 解析标题
        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        if (titleMatch) post.title = titleMatch[1].trim().replace(/^["']|["']$/g, '');

        // 解析日期
        const dateMatch = frontMatter.match(/date:\s*(.+)/);
        if (dateMatch) post.date = dateMatch[1].trim();

        // 解析标签
        const tagsMatch = frontMatter.match(/tags:\s*\[([^\]]+)\]/);
        if (tagsMatch) {
            post.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
        }

        // 解析封面图
        const coverMatch = frontMatter.match(/cover:\s*(.+)/);
        if (coverMatch) post.coverImage = coverMatch[1].trim().replace(/^["']|["']$/g, '');
    }

    // 生成摘要
    const plainText = post.content.replace(/[#*`\[\]()]/g, '').trim();
    post.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // 计算字数
    const chineseChars = (post.content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (post.content.replace(/[\u4e00-\u9fa5]/g, '').match(/[a-zA-Z]+/g) || []).length;
    post.wordCount = chineseChars + englishWords;

    // 如果没有封面图，使用随机图片
    if (!post.coverImage) {
        const hash = hashCode(post.title);
        post.coverImage = `https://picsum.photos/400/250?random=${hash}`;
    }

    return post;
}

// 字符串转哈希（用于生成随机图片）
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Base64 解码
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

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 渲染文章列表
function renderPosts(posts) {
    const container = document.getElementById('blog-list-container');
    const emptyState = document.getElementById('empty-state');

    if (posts.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = posts.map(post => `
        <article class="blog-post-card" data-path="${post.path}">
            <div class="blog-post-cover">
                <img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}">
                <div class="blog-post-overlay">
                    <button class="read-more-btn">📖 阅读全文</button>
                </div>
            </div>
            <div class="blog-post-content">
                <h3 class="blog-post-title">${escapeHtml(post.title)}</h3>
                <p class="blog-post-excerpt">${escapeHtml(post.excerpt)}</p>
                <div class="blog-post-meta">
                    <span class="post-date">📅 ${post.date}</span>
                    <span class="post-words">📝 ${post.wordCount} 字</span>
                    <span class="post-time">⏱️ ${Math.ceil(post.wordCount / 400)} 分钟</span>
                </div>
                <div class="blog-post-tags">
                    ${post.tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');

    // 添加点击事件
    document.querySelectorAll('.blog-post-card').forEach(card => {
        card.addEventListener('click', () => {
            const path = card.dataset.path;
            const post = allPosts.find(p => p.path === path);
            if (post) {
                openPostModal(post);
            }
        });
    });
}

// 渲染标签过滤器
function renderTagsFilter() {
    const container = document.getElementById('tags-filter');

    container.innerHTML = `
        <button class="tag-filter-btn active" data-tag="all">全部</button>
        ${Array.from(allTags).map(tag => `
            <button class="tag-filter-btn" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>
        `).join('')}
    `;

    // 添加点击事件
    container.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByTag(btn.dataset.tag);
        });
    });
}

// 按标签过滤
function filterByTag(tag) {
    if (tag === 'all') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => post.tags.includes(tag));
    }
    renderPosts(filteredPosts);
}

// 更新统计信息
function updateStats() {
    document.getElementById('post-count').textContent = allPosts.length;
    document.getElementById('tag-count').textContent = allTags.size;

    const totalWords = allPosts.reduce((sum, post) => sum + post.wordCount, 0);
    document.getElementById('word-count').textContent = formatNumber(totalWords);
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// 显示加载状态
function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    const listContainer = document.getElementById('blog-list-container');
    const emptyState = document.getElementById('empty-state');

    if (show) {
        loadingState.style.display = 'block';
        listContainer.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
    }
}

// 显示空状态
function showEmpty() {
    const container = document.getElementById('blog-list-container');
    const emptyState = document.getElementById('empty-state');
    container.style.display = 'none';
    emptyState.style.display = 'block';
}

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce((e) => {
        const keyword = e.target.value.trim().toLowerCase();
        if (!keyword) {
            filteredPosts = [...allPosts];
        } else {
            filteredPosts = allPosts.filter(post =>
                post.title.toLowerCase().includes(keyword) ||
                post.content.toLowerCase().includes(keyword) ||
                post.tags.some(tag => tag.toLowerCase().includes(keyword))
            );
        }
        renderPosts(filteredPosts);
    }, 300));
}

// ==================== 文章详情模态框 ====================
function initPostModal() {
    const modal = document.getElementById('post-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', closePostModal);
    overlay.addEventListener('click', closePostModal);

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePostModal();
        }
    });

    // 初始化搜索
    initSearch();
}

function openPostModal(post) {
    const modal = document.getElementById('post-modal');
    const content = document.getElementById('post-modal-content');
    const meta = document.getElementById('post-modal-meta');

    // 计算阅读时间
    const readingTime = Math.ceil(post.wordCount / 400);

    // 渲染内容
    content.innerHTML = `
        <h1 class="modal-post-title">${escapeHtml(post.title)}</h1>
        <div class="modal-post-info">
            <span>📅 ${post.date}</span>
            <span>📝 ${post.wordCount} 字</span>
            <span>⏱️ 预计阅读 ${readingTime} 分钟</span>
        </div>
        <div class="modal-post-body markdown-body">
            ${marked ? marked.parse(post.content) : escapeHtml(post.content)}
        </div>
    `;

    // 代码高亮
    if (typeof hljs !== 'undefined') {
        content.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // 渲染元数据
    meta.innerHTML = `
        <div class="modal-tags">
            ${post.tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}
        </div>
    `;

    // 初始化评论
    initGitalkComments(post);

    // 显示模态框
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePostModal() {
    const modal = document.getElementById('post-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentGitalk = null;
}

// 初始化 Gitalk 评论
function initGitalkComments(post) {
    const container = document.getElementById('gitalk-container');
    container.innerHTML = '';

    if (typeof Gitalk === 'undefined') {
        container.innerHTML = '<p>评论系统加载中...</p>';
        return;
    }

    // 生成唯一 ID
    const id = 'post-' + post.filename.replace('.md', '');

    currentGitalk = new Gitalk({
        clientID: gitalkConfig.clientID,
        clientSecret: gitalkConfig.clientSecret,
        repo: gitalkConfig.repo,
        owner: gitalkConfig.owner,
        admin: gitalkConfig.admin,
        id: id,
        distractionFreeMode: gitalkConfig.distractionFreeMode,
        language: gitalkConfig.language
    });

    currentGitalk.render('gitalk-container');
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

        setTimeout(() => {
            sakura.remove();
        }, duration * 1000);
    };

    for (let i = 0; i < 15; i++) {
        setTimeout(createSakura, Math.random() * 3000);
    }

    setInterval(createSakura, 800);
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

// ==================== 主题切换 ====================
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('animeBlogTheme') || 'sakura';
    setTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const body = document.body;
        const isSakura = body.classList.contains('sakura-theme');
        const newTheme = isSakura ? 'star' : 'sakura';

        setTheme(newTheme);
        localStorage.setItem('animeBlogTheme', newTheme);
    });
}

function setTheme(theme) {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');

    if (theme === 'sakura') {
        body.classList.remove('star-theme');
        body.classList.add('sakura-theme');
        if (themeBtn) {
            themeBtn.querySelector('.nav-icon').textContent = '🌸';
        }
    } else {
        body.classList.remove('sakura-theme');
        body.classList.add('star-theme');
        if (themeBtn) {
            themeBtn.querySelector('.nav-icon').textContent = '✨';
        }
    }
}

// ==================== 标签页切换 ====================
function initTabSwitch() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(tabId + '-content');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ==================== 灯箱效果 ====================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const characterCards = document.querySelectorAll('.character-card');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentIndex = 0;
    const characters = [];

    characterCards.forEach((card, index) => {
        const img = card.querySelector('.card-image img');
        const name = card.querySelector('.character-name').textContent;
        const source = card.querySelector('.character-source').textContent;

        characters.push({
            img: img.src,
            name: name,
            source: source
        });

        card.addEventListener('click', () => {
            currentIndex = index;
            showLightbox(index);
        });
    });

    function showLightbox(index) {
        const character = characters[index];
        document.getElementById('lightbox-image').src = character.img;
        document.getElementById('lightbox-name').textContent = character.name;
        document.getElementById('lightbox-source').textContent = character.source;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + characters.length) % characters.length;
        showLightbox(currentIndex);
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % characters.length;
        showLightbox(currentIndex);
    }

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });
}

// ==================== 工具函数 ====================
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

// 页面滚动动画
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.blog-post-card, .character-card, .testimonial-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

setTimeout(animateOnScroll, 100);

console.log('✿ 二次元博客已加载 ~ 樱花飘落效果已启动 ✿');
