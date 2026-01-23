/**
 * ============================================
 * 博客页面专用脚本
 * ============================================
 */

// 博客全局状态
let allPosts = [];
let filteredPosts = [];
let allTags = new Set();
let currentGitalk = null;
let currentPage = 1;
const postsPerPage = 9;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initBlogSystem();
    initLightbox();
    initPostModal();
});

// ==================== 博客系统 ====================
async function initBlogSystem() {
    showLoading(true);
    try {
        await loadPostsFromGitHub();
        updateBlogStats();
        renderTagsFilter();
        renderPosts(allPosts);
        showLoading(false);
    } catch (error) {
        console.error('加载失败:', error);
        showEmpty();
        showLoading(false);
    }
}

async function loadPostsFromGitHub() {
    // 优先使用本地文章索引
    if (typeof LOCAL_POSTS !== 'undefined' && LOCAL_POSTS.length > 0) {
        return await loadLocalPosts();
    }

    // 回退到 GitHub API
    return await loadGitHubAPIPosts();
}

async function loadLocalPosts() {
    allPosts = await Promise.all(
        LOCAL_POSTS.map(async (postInfo) => {
            try {
                // 首先尝试本地 fetch
                let response, content;
                try {
                    response = await fetch(postInfo.path);
                    content = await response.text();
                } catch (localError) {
                    // 本地 fetch 失败，回退到 GitHub API
                    console.log(`本地加载失败，尝试 GitHub API: ${postInfo.path}`);
                    const filename = postInfo.path.split('/').pop();
                    const { owner, repo, branch, path } = CONFIG.GITHUB;
                    const githubContent = await githubAPI(`/repos/${owner}/${repo}/contents/${path}/${filename}?ref=${branch}`);
                    if (githubContent) {
                        content = decodeBase64(githubContent.content);
                    } else {
                        throw new Error('GitHub API also failed');
                    }
                }
                const parsed = parseMarkdown(content, postInfo.path.split('/').pop());
                return {
                    ...parsed,
                    title: postInfo.title,
                    date: postInfo.date,
                    tags: postInfo.tags,
                    path: postInfo.path,
                    filename: postInfo.path.split('/').pop()
                };
            } catch (error) {
                console.warn('加载文章失败:', postInfo.path, error);
                return null;
            }
        })
    );

    // 过滤掉加载失败的文章
    allPosts = allPosts.filter(post => post !== null);

    if (allPosts.length === 0) {
        showEmpty();
        return;
    }

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    allTags = new Set();
    allPosts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });

    filteredPosts = [...allPosts];
}

async function loadGitHubAPIPosts() {
    const { owner, repo, branch, path } = CONFIG.GITHUB;
    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const files = await githubAPI(endpoint);
    if (!files) {
        showEmpty();
        return;
    }

    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
        showEmpty();
        return;
    }

    allPosts = await Promise.all(
        mdFiles.map(async (file) => {
            const content = await githubAPI(`/repos/${owner}/${repo}/contents/${path}/${file.name}?ref=${branch}`);
            if (!content) return null;
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

    allPosts = allPosts.filter(post => post !== null);

    if (allPosts.length === 0) {
        showEmpty();
        return;
    }

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    allTags = new Set();
    allPosts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });

    filteredPosts = [...allPosts];
}

function updateBlogStats() {
    const postCountEl = document.getElementById('post-count');
    const tagCountEl = document.getElementById('tag-count');
    const totalWordsEl = document.getElementById('total-words');

    if (postCountEl) postCountEl.textContent = allPosts.length;
    if (tagCountEl) tagCountEl.textContent = allTags.size;

    if (totalWordsEl) {
        const totalWords = allPosts.reduce((sum, post) => sum + post.wordCount, 0);
        totalWordsEl.textContent = formatNumber(totalWords);
    }
}

function renderTagsFilter() {
    const container = document.getElementById('tags-filter');
    if (!container) return;

    container.innerHTML = `
        <button class="tag-filter-btn active" data-tag="all">全部</button>
        ${Array.from(allTags).map(tag => `
            <button class="tag-filter-btn" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>
        `).join('')}
    `;

    container.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByTag(btn.dataset.tag);
        });
    });
}

function filterByTag(tag) {
    currentPage = 1; // 重置到第一页
    if (tag === 'all') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => post.tags.includes(tag));
    }
    renderPosts(filteredPosts);
}

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

    // 分页计算
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    container.innerHTML = currentPosts.map(post => `
        <article class="blog-post-card" data-path="${post.path}">
            <div class="blog-post-cover">
                <img src="https://picsum.photos/400/250?random=${hashCode(post.title)}" alt="${escapeHtml(post.title)}">
                <div class="blog-post-overlay">
                    <button class="read-more-btn">📖 阅读全文</button>
                </div>
            </div>
            <div class="blog-post-content">
                <h3 class="blog-post-title">${escapeHtml(post.title)}</h3>
                <p class="blog-post-excerpt">${escapeHtml(post.excerpt)}</p>
                <div class="blog-post-meta">
                    <span>📅 ${post.date}</span>
                    <span>📝 ${post.wordCount} 字</span>
                    <span>⏱️ ${Math.ceil(post.wordCount / 400)} 分钟</span>
                </div>
                <div class="blog-post-tags">
                    ${post.tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');

    // 渲染分页导航
    renderPagination(totalPages);

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

// 渲染分页导航
function renderPagination(totalPages) {
    const blogSection = document.querySelector('.blog-section');

    // 移除旧的分页
    const oldPagination = document.getElementById('pagination');
    if (oldPagination) oldPagination.remove();

    if (totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.id = 'pagination';
    pagination.className = 'pagination';
    pagination.innerHTML = `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
            ‹ 上一页
        </button>
        <div class="pagination-pages">
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                <button class="pagination-page ${page === currentPage ? 'active' : ''}" onclick="goToPage(${page})">
                    ${page}
                </button>
            `).join('')}
        </div>
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
            下一页 ›
        </button>
    `;

    blogSection.appendChild(pagination);
}

// 跳转到指定页
function goToPage(page) {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderPosts(filteredPosts);
    // 滚动到文章列表顶部
    document.querySelector('.blog-section').scrollIntoView({ behavior: 'smooth' });
}

// 搜索功能
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
        currentPage = 1; // 重置到第一页
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

    if (closeBtn) {
        closeBtn.addEventListener('click', closePostModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closePostModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePostModal();
        }
    });
}

function openPostModal(post) {
    const modal = document.getElementById('post-modal');
    const content = document.getElementById('post-modal-content');
    const meta = document.getElementById('post-modal-meta');

    if (!modal || !content || !meta) return;

    const readingTime = Math.ceil(post.wordCount / 400);

    content.innerHTML = `
        <h1 class="modal-post-title">${escapeHtml(post.title)}</h1>
        <div class="modal-post-info">
            <span>📅 ${post.date}</span>
            <span>📝 ${post.wordCount} 字</span>
            <span>⏱️ 预计阅读 ${readingTime} 分钟</span>
        </div>
        <div class="modal-post-body markdown-body">
            ${typeof marked !== 'undefined' ? marked.parse(post.content) : escapeHtml(post.content)}
        </div>
    `;

    // 代码高亮
    if (typeof hljs !== 'undefined') {
        content.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    meta.innerHTML = `
        <div class="modal-tags">
            ${post.tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}
        </div>
    `;

    initGitalkComments(post);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePostModal() {
    const modal = document.getElementById('post-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
    currentGitalk = null;
}

// Gitalk 评论
function initGitalkComments(post) {
    const container = document.getElementById('gitalk-container');
    if (!container) return;

    container.innerHTML = '';

    if (typeof Gitalk === 'undefined') {
        container.innerHTML = '<p>评论系统加载中...</p>';
        return;
    }

    const id = 'post-' + post.filename.replace('.md', '');

    currentGitalk = new Gitalk({
        clientID: CONFIG.GITALK.clientID,
        clientSecret: CONFIG.GITALK.clientSecret,
        repo: CONFIG.GITALK.repo,
        owner: CONFIG.GITALK.owner,
        admin: CONFIG.GITALK.admin,
        id: id,
        distractionFreeMode: false,
        language: 'zh-CN'
    });

    currentGitalk.render('gitalk-container');
}

// ==================== 灯箱效果 ====================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const characterCards = document.querySelectorAll('.character-card');

    if (!lightbox) return;

    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentIndex = 0;
    const characters = [];

    characterCards.forEach((card, index) => {
        const img = card.querySelector('.card-image img');
        const name = card.querySelector('.character-name').textContent;
        const source = card.querySelector('.character-source').textContent;

        characters.push({ img: img.src, name: name, source: source });

        card.addEventListener('click', () => {
            currentIndex = index;
            showLightbox(index);
        });
    });

    function showLightbox(index) {
        const character = characters[index];
        const imageEl = document.getElementById('lightbox-image');
        const nameEl = document.getElementById('lightbox-name');
        const sourceEl = document.getElementById('lightbox-source');

        if (imageEl) imageEl.src = character.img;
        if (nameEl) nameEl.textContent = character.name;
        if (sourceEl) sourceEl.textContent = character.source;

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

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
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
function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    const listContainer = document.getElementById('blog-list-container');
    const emptyState = document.getElementById('empty-state');

    if (!loadingState) return;

    if (show) {
        loadingState.style.display = 'block';
        if (listContainer) listContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
    }
}

function showEmpty() {
    const container = document.getElementById('blog-list-container');
    const emptyState = document.getElementById('empty-state');

    if (container) container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}

// 复用 main.js 中的工具函数
function githubAPI(endpoint) {
    return window.githubAPI ? window.githubAPI(endpoint) : null;
}

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
        content: content,
        excerpt: '',
        wordCount: 0
    };

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
    }

    const plainText = post.content.replace(/[#*`\[\]()]/g, '').trim();
    post.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    const chineseChars = (post.content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (post.content.replace(/[\u4e00-\u9fa5]/g, '').match(/[a-zA-Z]+/g) || []).length;
    post.wordCount = chineseChars + englishWords;

    return post;
}

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

console.log('✿ 二次元博客已加载 ~');
