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
        showLoading(false);

        // 检查是否是网络问题
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showNetworkError();
        } else {
            showEmpty();
        }
    }
}

function showNetworkError() {
    const container = document.getElementById('blog-list-container');
    const emptyState = document.getElementById('empty-state');

    if (container) container.style.display = 'none';

    // 显示网络错误提示
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }

    // 创建网络错误提示
    let errorDiv = document.getElementById('network-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'network-error';
        errorDiv.style.cssText = 'text-align: center; padding: 60px 20px;';
        document.querySelector('.blog-section')?.appendChild(errorDiv);
    }

    errorDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🌐</div>
        <h3>网络连接失败</h3>
        <p style="color: #666; margin: 15px 0;">无法连接到 GitHub API，可能是网络问题</p>
        <p style="color: #888; font-size: 14px;">请尝试：</p>
        <ul style="color: #888; font-size: 14px; list-style: none; padding: 0;">
            <li>✓ 刷新页面重试</li>
            <li>✓ 检查网络连接</li>
            <li>✓ 稍后再试</li>
        </ul>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ff6b9d; color: white; border: none; border-radius: 8px; cursor: pointer;">
            🔄 重新加载
        </button>
    `;
}

async function loadPostsFromGitHub() {
    // 检查 CONFIG 是否可用
    if (typeof CONFIG === 'undefined' || !CONFIG.GITHUB) {
        console.error('CONFIG.GITHUB 未定义，请检查 js/main.js 是否正确加载');
        showEmpty();
        return;
    }

    const { owner, repo, branch, path } = CONFIG.GITHUB;

    // 策略1: 优先尝试加载本地HTML文件（快速）
    try {
        const localPosts = await loadLocalHtmlPosts();
        if (localPosts.length > 0) {
            allPosts = localPosts;
            allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

            allTags = new Set();
            allPosts.forEach(post => {
                post.tags.forEach(tag => allTags.add(tag));
            });

            filteredPosts = [...allPosts];
            console.log('使用本地HTML文件加载:', allPosts.length, '篇文章');
            return;
        }
    } catch (e) {
        console.log('本地HTML加载失败，尝试GitHub API:', e.message);
    }

    // 策略2: 本地无HTML，从GitHub API加载MD文件
    console.log('正在从 GitHub 加载文章:', { owner, repo, branch, path });

    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    console.log('API endpoint:', endpoint);

    const files = await githubAPI(endpoint);
    if (!files) {
        console.error('GitHub API 返回空数据');
        showEmpty();
        return;
    }

    console.log('获取到文件列表:', files.length, '个文件');

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
                filename: file.name,
                isHtml: false
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

// 加载本地HTML文章（快速，无需API）
async function loadLocalHtmlPosts() {
    const posts = [];

    // 如果有本地索引，使用索引
    if (typeof LOCAL_POSTS !== 'undefined' && LOCAL_POSTS.length > 0) {
        for (const post of LOCAL_POSTS) {
            const mdPath = post.path;
            const htmlPath = mdPath.replace('.md', '.html');

            // 尝试加载对应的HTML文件
            try {
                const response = await fetch(htmlPath);
                if (response.ok) {
                    const htmlContent = await response.text();

                    // 使用posts-index.js中的标题（保持一致性），不从HTML提取
                    const title = post.title;

                    // 尝试从HTML中提取日期
                    let date = post.date;
                    const dateMatch = htmlContent.match(/发布日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
                    if (dateMatch) date = dateMatch[1];

                    // 生成摘要
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    const plainText = tempDiv.textContent || tempDiv.innerText || '';
                    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

                    // 计算字数
                    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
                    const englishWords = (plainText.replace(/[\u4e00-\u9fa5]/g, '').match(/[a-zA-Z]+/g) || []).length;
                    const wordCount = chineseChars + englishWords;

                    posts.push({
                        title: title,
                        date: date,
                        tags: post.tags || [],
                        content: htmlContent,
                        excerpt: excerpt,
                        wordCount: wordCount,
                        path: htmlPath,
                        filename: post.path.split('/').pop(),
                        isHtml: true,  // 标记为HTML
                        mdPath: mdPath,  // 保存MD路径用于编辑
                        sha: null
                    });
                }
            } catch (e) {
                // HTML文件不存在，跳过
                console.log(`HTML文件不存在: ${htmlPath}`);
            }
        }
    }

    return posts;
}

// 去除HTML标签
function stripHtmlTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
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

    // 判断是HTML还是Markdown
    let renderedContent;
    if (post.isHtml) {
        // HTML文件：直接渲染内容（快速，无需解析）
        // 提取HTML中的body部分或主要内容
        let htmlContent = post.content;

        // 修正图片路径：动态获取域名，避免换域名问题
        const siteUrl = window.location.origin;  // 自动获取当前域名
        htmlContent = htmlContent.replace(/src="assets\//g, `src="${siteUrl}/posts/assets/`);

        // 尝试提取主要内容（去除head、script等标签）
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            htmlContent = bodyMatch[1];
        }

        renderedContent = htmlContent;
    } else {
        // Markdown文件：使用marked解析（兼容在线编辑）
        renderedContent = typeof marked !== 'undefined' ? marked.parse(post.content) : escapeHtml(post.content);
    }

    content.innerHTML = `
        <h1 class="modal-post-title">${escapeHtml(post.title)}</h1>
        <div class="modal-post-info">
            <span>📅 ${post.date}</span>
            <span>📝 ${post.wordCount} 字</span>
            <span>⏱️ 预计阅读 ${readingTime} 分钟</span>
        </div>
        <div class="modal-post-body markdown-body">
            ${renderedContent}
        </div>
    `;

    // 代码高亮（仅对Markdown需要，HTML已自带高亮）
    if (typeof hljs !== 'undefined' && !post.isHtml) {
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

// GitHub API（直接实现，带重试机制）
async function githubAPI(endpoint, retries = 3) {
    const url = `https://api.github.com${endpoint}`;

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`GitHub API 请求 (${i + 1}/${retries}):`, url);

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error(`GitHub API 错误 (${response.status}):`, error.message);

                // 如果是速率限制，等待后重试
                if (response.status === 403 && error.message.includes('API rate limit')) {
                    console.warn('GitHub API 速率限制，等待 2 秒后重试...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }

                throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
            }

            const data = await response.json();
            console.log('GitHub API 响应成功');
            return data;

        } catch (error) {
            console.error(`请求失败 (${i + 1}/${retries}):`, error.message);

            if (i === retries - 1) {
                throw error;
            }

            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
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

    // 兼容 Windows (\r\n) 和 Unix (\n) 换行符
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (fmMatch) {
        const frontMatter = fmMatch[1];
        post.content = fmMatch[2];

        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        if (titleMatch) post.title = titleMatch[1].trim().replace(/^["']|["']$/g, '');

        const dateMatch = frontMatter.match(/date:\s*(.+)/);
        if (dateMatch) post.date = dateMatch[1].trim();

        // 解析 tags，支持多种格式
        // tags: ["tag1", "tag2", "tag3"]
        // tags: [tag1, tag2, tag3]
        const tagsMatch = frontMatter.match(/tags:\s*(\[[\s\S]*?\])/);
        if (tagsMatch) {
            try {
                // 尝试用 JSON.parse 解析（处理带引号的格式）
                let tagsStr = tagsMatch[1].trim();
                // 将单引号转换为双引号，以便 JSON.parse 能正确解析
                tagsStr = tagsStr.replace(/'/g, '"');
                const parsed = JSON.parse(tagsStr);
                if (Array.isArray(parsed)) {
                    post.tags = parsed.map(t => String(t).trim()).filter(t => t.length > 0);
                    console.log('标签解析成功:', post.title, post.tags);
                } else {
                    console.warn('解析结果不是数组:', parsed);
                    post.tags = [];
                }
            } catch (e) {
                // JSON 解析失败，尝试简单的 split 方法
                console.warn('JSON 解析失败，使用 split 方法:', e, '原始字符串:', tagsMatch[1]);
                try {
                    let tagsStr = tagsMatch[1].trim();
                    // 移除外层的方括号
                    tagsStr = tagsStr.slice(1, -1);
                    // 分割并清理
                    post.tags = tagsStr.split(',')
                        .map(t => t.trim())
                        .map(t => t.replace(/^["']|["']$/g, ''))
                        .filter(t => t.length > 0);
                    console.log('split 方法解析成功:', post.tags);
                } catch (e2) {
                    console.warn('标签解析失败:', e2);
                    post.tags = [];
                }
            }
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
