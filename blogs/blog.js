// 博客系统核心逻辑
// 包含：GitHub API集成、Markdown渲染、文章管理、Gitalk评论

// ==================== 配置管理 ====================
const CONFIG_KEY = 'blog_github_config';
const POSTS_CACHE_KEY = 'blog_posts_cache';

// 默认仓库配置（公开读取，无需Token）
const DEFAULT_REPO = {
    owner: 'XiaoHuZi-design',
    repo: 'HTBLOG',
    branch: 'main',
    path: 'posts'
};

// 用户配置（写文章需要Token）
let githubConfig = {
    token: '',
    owner: '',
    repo: '',
    branch: 'main',
    path: 'posts'
};

// Gitalk配置 - 需要用户自行配置
const gitalkConfig = {
    clientID: 'Ov23litZBDaEbUtqG4PL',  // 用户需要填写自己的GitHub OAuth App Client ID
    clientSecret: 'ba2e7cc6838a651fd8a43242351fdce6ae00b9fa',  // 用户需要填写自己的Client Secret
    repo: 'HTBLOG',  // 评论存储的仓库
    owner: 'XiaoHuZi-design',
    admin: ['XiaoHuZi-design'],
    distractionFreeMode: false
};

// ==================== DOM元素 ====================
const postsList = document.getElementById('posts-list');
const postDetail = document.getElementById('post-detail');
const postEditor = document.getElementById('post-editor');
const postsContainer = document.getElementById('posts-container');
const postContent = document.getElementById('post-content');
const postMeta = document.getElementById('post-meta');
const gitalkContainer = document.getElementById('gitalk-container');
const searchInput = document.getElementById('search-input');
const markdownEditor = document.getElementById('markdown-editor');
const previewContent = document.getElementById('preview-content');
const previewPane = document.getElementById('preview-pane');
const configModal = document.getElementById('github-config-modal');

// 按钮
const newPostBtn = document.getElementById('new-post-btn');
const backToListBtn = document.getElementById('back-to-list');
const editPostBtn = document.getElementById('edit-post-btn');
const deletePostBtn = document.getElementById('delete-post-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const previewBtn = document.getElementById('preview-btn');
const savePostBtn = document.getElementById('save-post-btn');
const settingsBtn = document.getElementById('settings-btn');
const saveConfigBtn = document.getElementById('save-config');
const cancelConfigBtn = document.getElementById('cancel-config');
const clearConfigBtn = document.getElementById('clear-config');

// 输入框
const postTitleInput = document.getElementById('post-title-input');
const postTagsInput = document.getElementById('post-tags-input');
const githubTokenInput = document.getElementById('github-token');
const githubOwnerInput = document.getElementById('github-owner');
const githubRepoInput = document.getElementById('github-repo');
const githubBranchInput = document.getElementById('github-branch');
const githubPathInput = document.getElementById('github-path');

// 当前状态
let currentPosts = [];
let currentPost = null;
let isEditing = false;
let isPreviewMode = false;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initMarked();
    initEventListeners();
    loadPosts();
    initSakura();
});

// 初始化Marked配置
function initMarked() {
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        },
        breaks: true,
        gfm: true
    });
}

// 初始化事件监听
function initEventListeners() {
    // 新建文章
    newPostBtn.addEventListener('click', () => {
        if (!isConfigured()) {
            showConfigModal();
            return;
        }
        showEditor();
    });

    // 返回列表
    backToListBtn.addEventListener('click', showPostsList);

    // 编辑文章
    editPostBtn.addEventListener('click', () => {
        if (currentPost) {
            showEditor(currentPost);
        }
    });

    // 删除文章
    deletePostBtn.addEventListener('click', () => {
        if (currentPost && confirm('确定要删除这篇文章吗？这个操作不可恢复哦~')) {
            deletePost(currentPost);
        }
    });

    // 取消编辑
    cancelEditBtn.addEventListener('click', () => {
        if (isEditing && currentPost) {
            showPostDetail(currentPost);
        } else {
            showPostsList();
        }
    });

    // 预览切换
    previewBtn.addEventListener('click', togglePreview);

    // 保存文章
    savePostBtn.addEventListener('click', savePost);

    // 设置
    settingsBtn.addEventListener('click', showConfigModal);
    saveConfigBtn.addEventListener('click', saveConfig);
    cancelConfigBtn.addEventListener('click', hideConfigModal);
    clearConfigBtn.addEventListener('click', clearConfig);

    // 搜索
    searchInput.addEventListener('input', debounce(filterPosts, 300));

    // 实时预览
    markdownEditor.addEventListener('input', updatePreview);

    // 点击模态框外部关闭
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            hideConfigModal();
        }
    });
}

// ==================== 配置相关 ====================
function loadConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
        githubConfig = { ...githubConfig, ...JSON.parse(saved) };
    }
}

function saveConfig() {
    githubConfig = {
        token: githubTokenInput.value.trim(),
        owner: githubOwnerInput.value.trim(),
        repo: githubRepoInput.value.trim(),
        branch: githubBranchInput.value.trim() || 'main',
        path: githubPathInput.value.trim() || 'posts'
    };

    localStorage.setItem(CONFIG_KEY, JSON.stringify(githubConfig));
    hideConfigModal();
    showToast('配置保存成功！', 'success');
    loadPosts();
}

function showConfigModal() {
    githubTokenInput.value = githubConfig.token;
    githubOwnerInput.value = githubConfig.owner;
    githubRepoInput.value = githubConfig.repo;
    githubBranchInput.value = githubConfig.branch;
    githubPathInput.value = githubConfig.path;
    configModal.classList.remove('hidden');
}

function hideConfigModal() {
    configModal.classList.add('hidden');
}

function clearConfig() {
    if (confirm('确定要清除所有GitHub配置吗？')) {
        localStorage.removeItem(CONFIG_KEY);
        githubConfig = {
            token: '',
            owner: '',
            repo: '',
            branch: 'main',
            path: 'posts'
        };
        githubTokenInput.value = '';
        githubOwnerInput.value = '';
        githubRepoInput.value = '';
        githubBranchInput.value = 'main';
        githubPathInput.value = 'posts';
        showToast('配置已清除！', 'success');
        hideConfigModal();
        loadPosts();
    }
}

function isConfigured() {
    return githubConfig.token && githubConfig.owner && githubConfig.repo;
}

// ==================== GitHub API ====================
// 公开API请求（无需Token，用于读取文章）
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

// 需要认证的API请求（写文章需要Token）
async function githubAPI(endpoint, options = {}) {
    const baseUrl = 'https://api.github.com';
    const url = `${baseUrl}${endpoint}`;

    const headers = {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '请求失败');
    }

    return response.json();
}

// 获取文章列表（默认从公开仓库读取，无需配置）
async function loadPosts() {
    postsContainer.innerHTML = `
        <div class="loading-anime">
            <span>正在加载文章</span>
            <div class="loading-dots">
                <span>.</span><span>.</span><span>.</span>
            </div>
        </div>
    `;

    // 直接从默认公开仓库加载文章
    try {
        await loadPostsFromPublicRepo();
    } catch (error) {
        console.log('加载失败:', error.message);
        showEmptyState('文章加载失败，请稍后重试~');
    }
}

// 从公开仓库加载文章（优先使用本地HTML，无需Token）
async function loadPostsFromPublicRepo() {
    const { owner, repo, branch, path } = DEFAULT_REPO;

    // 策略1: 优先尝试加载本地HTML文件（快速）
    try {
        const localPosts = await loadLocalHtmlPosts();
        if (localPosts.length > 0) {
            currentPosts = localPosts;
            currentPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderPosts(currentPosts);
            return;
        }
    } catch (e) {
        console.log('本地HTML加载失败，尝试GitHub API:', e.message);
    }

    // 策略2: 本地无HTML，从GitHub API加载MD文件
    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const files = await publicGithubAPI(endpoint);
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
        showEmptyState('还没有文章呢~');
        return;
    }

    // 获取每篇文章的内容
    currentPosts = await Promise.all(
        mdFiles.map(async (file) => {
            const content = await publicGithubAPI(`/repos/${owner}/${repo}/contents/${path}/${file.name}?ref=${branch}`);
            const decoded = decodeBase64(content.content);
            const parsed = parseMarkdown(decoded, file.name);
            return {
                ...parsed,
                sha: content.sha,
                path: file.path,
                isHtml: false  // 标记为Markdown
            };
        })
    );

    // 按日期排序
    currentPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderPosts(currentPosts);
}

// 加载本地HTML文章（快速，无需API）
async function loadLocalHtmlPosts() {
    const posts = [];

    // 获取posts目录下所有HTML文件
    const htmlFiles = [];

    // 方法1: 如果有本地索引，使用索引
    if (typeof LOCAL_POSTS !== 'undefined' && LOCAL_POSTS.length > 0) {
        for (const post of LOCAL_POSTS) {
            const mdPath = post.path;
            const htmlPath = mdPath.replace('.md', '.html');

            // 修正路径：从blogs/目录访问需要加 ../posts/
            // 检测当前环境，如果是本地开发环境使用相对路径修正
            let fetchPath = htmlPath;
            if (window.location.pathname.includes('/blogs/')) {
                fetchPath = '../posts/' + htmlPath;
            }

            // 尝试加载对应的HTML文件
            try {
                const response = await fetch(fetchPath);
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

                    // 修正path属性，从blogs/目录访问需要使用绝对路径
                    const displayPath = htmlPath.startsWith('posts/') ? '/' + htmlPath : htmlPath;

                    posts.push({
                        title: title,
                        date: date,
                        tags: post.tags || [],
                        content: htmlContent,
                        excerpt: excerpt,
                        path: displayPath,  // 使用绝对路径，方便跨页面访问
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

// 从配置的GitHub仓库加载文章（需要Token，用于管理自己的文章）
async function loadPostsFromGitHub() {
    const { owner, repo, branch, path } = githubConfig;
    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const files = await githubAPI(endpoint);
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
        showEmptyState('还没有文章呢，快来写第一篇吧！');
        return;
    }

    // 获取每篇文章的内容
    currentPosts = await Promise.all(
        mdFiles.map(async (file) => {
            const content = await githubAPI(`/repos/${owner}/${repo}/contents/${path}/${file.name}?ref=${branch}`);
            const decoded = decodeBase64(content.content);
            const parsed = parseMarkdown(decoded, file.name);
            return {
                ...parsed,
                sha: content.sha,
                path: file.path
            };
        })
    );

    // 按日期排序
    currentPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderPosts(currentPosts);
}

// 从本地加载文章
async function loadLocalPosts() {
    // 使用本地索引
    if (typeof LOCAL_POSTS === 'undefined' || LOCAL_POSTS.length === 0) {
        showEmptyState('请配置GitHub信息来开始你的博客之旅，或添加本地文章~');
        return;
    }

    try {
        currentPosts = await Promise.all(
            LOCAL_POSTS.map(async (post) => {
                try {
                    const response = await fetch(post.path);
                    if (!response.ok) throw new Error('文件不存在');
                    const content = await response.text();
                    const parsed = parseMarkdown(content, post.path.split('/').pop());
                    return {
                        ...parsed,
                        path: post.path,
                        sha: null  // 本地文章没有sha
                    };
                } catch (e) {
                    // 如果获取失败，使用索引中的元数据
                    return {
                        title: post.title,
                        date: post.date,
                        tags: post.tags,
                        content: '# ' + post.title + '\n\n文章加载失败，请检查文件路径。',
                        excerpt: '文章加载失败...',
                        path: post.path,
                        sha: null
                    };
                }
            })
        );

        // 按日期排序
        currentPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderPosts(currentPosts);
    } catch (error) {
        console.error('本地加载失败:', error);
        showEmptyState('加载失败，请刷新页面重试~');
    }
}

// 解析Markdown文章（支持Front Matter）
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

        // 解析标题
        const titleMatch = frontMatter.match(/title:\s*(.+)/);
        if (titleMatch) post.title = titleMatch[1].trim().replace(/^["']|["']$/g, '');

        // 解析日期
        const dateMatch = frontMatter.match(/date:\s*(.+)/);
        if (dateMatch) post.date = dateMatch[1].trim();

        // 解析标签 - 支持多种格式
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

    // 生成摘要
    const plainText = post.content.replace(/[#*`\[\]()]/g, '').trim();
    post.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    // 计算字数（中文按字符计算，英文按单词计算）
    const chineseChars = (post.content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (post.content.replace(/[\u4e00-\u9fa5]/g, '').match(/[a-zA-Z]+/g) || []).length;
    post.wordCount = chineseChars + englishWords;

    return post;
}

// 渲染文章列表
function renderPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>没有找到匹配的文章</h3>
                <p>试试其他关键词吧~</p>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = posts.map(post => `
        <div class="post-card" data-path="${post.path}">
            <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
            <p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="post-card-meta">
                <span class="post-card-date">📅 ${post.date}</span>
                <div class="post-card-tags">
                    ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // 添加点击事件
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => {
            const path = card.dataset.path;
            const post = currentPosts.find(p => p.path === path);
            if (post) {
                showPostDetail(post);
            }
        });
    });
}

// 显示空状态
function showEmptyState(message) {
    postsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <h3>开始你的创作之旅</h3>
            <p>${message}</p>
            <button class="action-btn anime-btn" onclick="document.getElementById('new-post-btn').click()">
                <span>✨</span> 写第一篇文章
            </button>
        </div>
    `;
}

// 搜索过滤
function filterPosts() {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
        renderPosts(currentPosts);
        return;
    }

    const filtered = currentPosts.filter(post =>
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.tags.some(tag => tag.toLowerCase().includes(keyword))
    );

    renderPosts(filtered);
}

// ==================== 文章详情 ====================
function showPostDetail(post) {
    currentPost = post;
    postsList.classList.add('hidden');
    postEditor.classList.add('hidden');
    postDetail.classList.remove('hidden');

    // 计算预计阅读时间 假设普通人阅读速度为 300-500 字/分钟
    const readingTime = Math.ceil(post.wordCount / 400);

    // 判断是HTML还是Markdown
    if (post.isHtml) {
        // HTML文件：直接渲染内容（快速，无需解析）
        // 提取HTML中的body部分或主要内容
        let htmlContent = post.content;

        // 尝试提取主要内容（去除head、script等标签）
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            htmlContent = bodyMatch[1];
        }

        // 修正图片路径：使用相对路径（从 blogs/ 访问 posts/assets/）
        htmlContent = htmlContent.replace(/src="assets\//g, 'src="../posts/assets/');
        htmlContent = htmlContent.replace(/src='assets\//g, "src='../posts/assets/");

        // 提取已有的标题和元信息（如果HTML中有）
        const existingTitle = htmlContent.match(/<h1[^>]*>(.+?)<\/h1>/i);
        const existingMeta = htmlContent.match(/发布日期[：:]\s*(\d{4}-\d{2}-\d{2})/);

        // 如果HTML中已有标题，就不重复添加
        let contentToRender = htmlContent;
        if (!existingTitle) {
            contentToRender = `
                <h1>${escapeHtml(post.title)}</h1>
                <div class="post-detail-info" style="color: #888; margin-bottom: 20px;">
                    <span>📅 发布日期: ${post.date}</span>
                </div>
                ${htmlContent}
            `;
        }

        postContent.innerHTML = contentToRender;
    } else {
        // Markdown文件：使用marked解析（兼容在线编辑）
        let mdHtml = marked.parse(post.content);

        // 修正 Markdown 中的图片路径（blogs/ 目录需要 ../）
        mdHtml = mdHtml.replace(/src="assets\//g, 'src="../posts/assets/');
        mdHtml = mdHtml.replace(/src='assets\//g, "src='../posts/assets/");

        postContent.innerHTML = `
            <h1>${escapeHtml(post.title)}</h1>
            <div class="post-detail-info" style="color: #888; margin-bottom: 20px;">
                <span>📝 字数：${post.wordCount} 字</span> |
                <span>⏱️ 预计阅读：${readingTime} 分钟</span>
            </div>
            ${mdHtml}
        `;
    }

    // 渲染元数据
    postMeta.innerHTML = `
        <span>📅 发布日期: ${post.date}</span>
        <div class="post-card-tags">
            ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
    `;

    // 代码高亮（仅对Markdown需要，HTML已自带高亮）
    if (!post.isHtml) {
        postContent.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // 初始化Gitalk评论
    initGitalk(post);

    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 初始化Gitalk评论
function initGitalk(post) {
    gitalkContainer.innerHTML = '';

    // 检查是否配置了Gitalk
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
        gitalkContainer.innerHTML = `
            <div class="empty-state" style="padding: 30px;">
                <p>💡 配置GitHub后即可使用评论功能</p>
            </div>
        `;
        return;
    }

    // 使用文章路径作为唯一标识
    const gitalk = new Gitalk({
        clientID: gitalkConfig.clientID || 'Ov23ctkR3x4dcec6C8kY',  // 默认使用参考的配置
        clientSecret: gitalkConfig.clientSecret || '7531a15e87dcba97e0b234d9b140f46b23dd67ec',
        repo: githubConfig.repo,
        owner: githubConfig.owner,
        admin: [githubConfig.owner],
        id: md5(post.path).substring(0, 50),  // 使用MD5缩短路径
        distractionFreeMode: false,
        language: 'zh-CN'
    });

    gitalk.render('gitalk-container');
}

// 简单的MD5实现（用于生成Gitalk ID）
function md5(string) {
    // 简化版，实际项目中可以引入crypto-js
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// ==================== 文章编辑器 ====================
async function showEditor(post = null) {
    isEditing = !!post;
    currentPost = post;

    postsList.classList.add('hidden');
    postDetail.classList.add('hidden');
    postEditor.classList.remove('hidden');

    document.getElementById('editor-title').textContent = isEditing ? '✏️ 编辑文章' : '✨ 写新文章';

    if (post) {
        postTitleInput.value = post.title;
        postTagsInput.value = post.tags.join(', ');

        // 如果是HTML文章，尝试从GitHub加载对应的MD源文件
        if (post.isHtml && post.mdPath) {
            try {
                // 从mdPath提取文件名
                const filename = post.mdPath.split('/').pop();
                const { owner, repo, branch, path } = DEFAULT_REPO;

                const content = await publicGithubAPI(`/repos/${owner}/${repo}/contents/${path}/${filename}?ref=${branch}`);
                const decoded = decodeBase64(content.content);
                markdownEditor.value = decoded;

                // 更新currentPost的sha（用于保存时API调用）
                currentPost.sha = content.sha;
                currentPost.originalPath = post.mdPath;
            } catch (e) {
                console.log('无法加载MD源文件，使用HTML内容:', e);
                // 如果MD不存在，使用HTML内容（虽然不理想）
                markdownEditor.value = post.content;
                currentPost.originalPath = post.mdPath;
            }
        } else {
            // Markdown文章，直接使用content
            markdownEditor.value = post.content;
            currentPost.originalPath = post.path;
        }
    } else {
        postTitleInput.value = '';
        postTagsInput.value = '';
        markdownEditor.value = '';
    }

    // 重置预览
    isPreviewMode = false;
    previewPane.classList.add('hidden');
    previewBtn.innerHTML = '<span>👁️</span> 预览';

    window.scrollTo(0, 0);
}

// 切换预览
function togglePreview() {
    isPreviewMode = !isPreviewMode;
    previewPane.classList.toggle('hidden', !isPreviewMode);
    previewBtn.innerHTML = isPreviewMode ? '<span>✏️</span> 编辑' : '<span>👁️</span> 预览';

    if (isPreviewMode) {
        updatePreview();
    }
}

// 更新预览
function updatePreview() {
    if (!isPreviewMode) return;
    previewContent.innerHTML = marked.parse(markdownEditor.value);
    previewContent.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

// 保存文章
async function savePost() {
    const title = postTitleInput.value.trim();
    const tags = postTagsInput.value.split(',').map(t => t.trim()).filter(t => t);
    const content = markdownEditor.value.trim();

    if (!title) {
        showToast('请输入文章标题~', 'error');
        return;
    }

    if (!content) {
        showToast('文章内容不能为空哦~', 'error');
        return;
    }

    // 生成Front Matter
    const frontMatter = `---
title: "${title}"
date: ${new Date().toISOString().split('T')[0]}
tags: [${tags.map(t => `"${t}"`).join(', ')}]
---

${content}`;

    // 生成文件名
    const filename = isEditing ? currentPost.path.split('/').pop() : `${generateSlug(title)}.md`;
    const filepath = `${githubConfig.path}/${filename}`;

    try {
        savePostBtn.disabled = true;
        savePostBtn.innerHTML = '<span>⏳</span> 保存中...';

        const { owner, repo, branch } = githubConfig;
        const endpoint = `/repos/${owner}/${repo}/contents/${filepath}`;

        const body = {
            message: isEditing ? `更新文章: ${title}` : `新建文章: ${title}`,
            content: encodeBase64(frontMatter),
            branch: branch
        };

        // 如果是编辑，需要提供sha
        if (isEditing && currentPost.sha) {
            body.sha = currentPost.sha;
        }

        await githubAPI(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });

        showToast(isEditing ? '文章更新成功！' : '文章发布成功！', 'success');

        // 刷新文章列表
        await loadPosts();
        showPostsList();
    } catch (error) {
        console.error('保存失败:', error);
        showToast(`保存失败: ${error.message}`, 'error');
    } finally {
        savePostBtn.disabled = false;
        savePostBtn.innerHTML = '<span>💾</span> 保存到GitHub';
    }
}

// 删除文章
async function deletePost(post) {
    try {
        const { owner, repo, branch } = githubConfig;

        // 确定要删除的文件路径（MD文件，因为HTML只是本地缓存）
        const pathToDelete = post.mdPath || post.originalPath || post.path;

        // 如果是HTML文章且没有sha，需要先获取MD文件的sha
        let shaToDelete = post.sha;
        if (!shaToDelete && post.mdPath) {
            const filename = post.mdPath.split('/').pop();
            const { path } = DEFAULT_REPO;
            try {
                const content = await publicGithubAPI(`/repos/${owner}/${repo}/contents/${path}/${filename}?ref=${branch}`);
                shaToDelete = content.sha;
            } catch (e) {
                console.log('无法获取MD文件信息:', e);
            }
        }

        const endpoint = `/repos/${owner}/${repo}/contents/${pathToDelete}`;

        await githubAPI(endpoint, {
            method: 'DELETE',
            body: JSON.stringify({
                message: `删除文章: ${post.title}`,
                sha: shaToDelete,
                branch: branch
            })
        });

        showToast('文章已删除', 'success');
        await loadPosts();
        showPostsList();
    } catch (error) {
        console.error('删除失败:', error);
        showToast(`删除失败: ${error.message}`, 'error');
    }
}

// ==================== 视图切换 ====================
function showPostsList() {
    currentPost = null;
    postDetail.classList.add('hidden');
    postEditor.classList.add('hidden');
    postsList.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// ==================== 工具函数 ====================
// Base64编码
function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// Base64解码 - 支持UTF-8中文
function decodeBase64(str) {
    try {
        // 先尝试标准方法
        const binaryStr = atob(str);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        // 回退方法
        return decodeURIComponent(escape(atob(str)));
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 生成URL友好的slug
function generateSlug(title) {
    const timestamp = Date.now();
    const slug = title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
    return `${slug}-${timestamp}`;
}

// 防抖
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

// 显示提示
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== 樱花效果 ====================
let sakuraInterval = null;

function initSakura() {
    startSakura();
}

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
    sakuraInterval = setInterval(createSakura, 500);
}

function stopSakura() {
    if (sakuraInterval) {
        clearInterval(sakuraInterval);
        sakuraInterval = null;
    }
}
