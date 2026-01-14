// 笔记本功能实现
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
let isPreviewMode = false;

// DOM 元素
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');
const preview = document.getElementById('preview');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('noteCategory');
const tagsInput = document.getElementById('noteTags');

// Markdown 预览设置
marked.setOptions({
    breaks: true,
    gfm: true
});

// 添加笔记模板功能
const noteTemplates = {
    日记: `# 📝 今日日记\n\n## 今天的心情\n\n## 今天做了什么\n\n## 明天计划`,
    任务: `# ✅ 任务清单\n\n- [ ] 待办事项1\n- [ ] 待办事项2\n\n## 优先级\n\n## 截止日期`,
    学习: `# 📚 学习笔记\n\n## 知识点\n\n## 重点内容\n\n## 疑问\n\n## 参考资料`
};

// 添加模板选择按钮
function addTemplateButtons() {
    const templateTools = document.createElement('div');
    templateTools.className = 'template-tools';
    templateTools.innerHTML = `
        <div class="template-dropdown">
            <button class="btn template-btn">
                <span class="btn-icon">📋</span> 模板
            </button>
            <div class="template-list">
                ${Object.keys(noteTemplates).map(name => `
                    <button class="template-item" onclick="useTemplate('${name}')">
                        ${name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.querySelector('.note-controls').appendChild(templateTools);
}

function useTemplate(templateName) {
    noteInput.value = noteTemplates[templateName];
    updatePreview();
}

// 自动保存功能
let autoSaveTimer;

noteInput.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        if (noteInput.value.trim()) {
            saveNote(true); // true 表示自动保存
        }
    }, 3000); // 3秒后自动保存
});

// 修改保存函数
function saveNote(isAutoSave = false) {
    const content = noteInput.value.trim();
    if (!content) return;

    const note = {
        id: Date.now(),
        content,
        category: categorySelect.value,
        tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
        timestamp: new Date().toLocaleString(),
        lastModified: new Date().toLocaleString()
    };

    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    if (!isAutoSave) {
        // 只在手动保存时重置输入
        noteInput.value = '';
        tagsInput.value = '';
        categorySelect.value = '默认';
        showNotification('笔记保存成功！');
    } else {
        showNotification('已自动保存');
    }
    
    displayNotes();
}

// 显示笔记列表
function displayNotes(filteredNotes = notes) {
    notesList.innerHTML = '';
    
    filteredNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-item animate__animated animate__fadeIn';
        
        li.innerHTML = `
            <div class="note-header" onclick="toggleNote(this.parentElement)">
                <div class="note-header-content">
                    <span class="note-category">${note.category}</span>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <span class="note-timestamp">📅 ${note.timestamp}</span>
                </div>
                <span class="expand-icon">▼</span>
            </div>
            <div class="note-content collapsed">
                ${marked.parse(note.content)}
            </div>
            <div class="note-footer">
                <div class="note-actions">
                    <button class="btn edit-btn" onclick="editNote(${note.id})">
                        <span class="btn-icon">✏️</span>
                    </button>
                    <button class="btn delete-btn" onclick="deleteNote(${note.id})">
                        <span class="btn-icon">🗑️</span>
                    </button>
                    <button class="btn share-btn" onclick="shareNote(${note.id})">
                        <span class="btn-icon">📤</span>
                    </button>
                    <button class="btn print-btn" onclick="printNote(${note.id})">
                        <span class="btn-icon">🖨️</span>
                    </button>
                </div>
            </div>
        `;
        
        notesList.appendChild(li);
    });
}

// 添加笔记展开/收起功能
function toggleNote(noteElement) {
    const content = noteElement.querySelector('.note-content');
    const expandIcon = noteElement.querySelector('.expand-icon');
    
    content.classList.toggle('collapsed');
    
    // 更新展开图标
    if (content.classList.contains('collapsed')) {
        expandIcon.textContent = '▼';
        noteElement.classList.remove('expanded');
    } else {
        expandIcon.textContent = '▲';
        noteElement.classList.add('expanded');
        
        // 滚动到笔记位置
        noteElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 删除笔记
function deleteNote(id) {
    if (!confirm('确定要删除这条笔记吗？')) return;
    
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    showNotification('笔记已删除！');
}

// 编辑笔记
function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (!note) return;
    
    noteInput.value = note.content;
    categorySelect.value = note.category;
    tagsInput.value = note.tags.join(', ');
    
    // 删除原笔记
    notes = notes.filter(n => n.id !== id);
    
    // 滚动到编辑区
    noteInput.scrollIntoView({ behavior: 'smooth' });
    noteInput.focus();
}

// 搜索高亮功能
function highlightSearchTerm(content, searchTerm) {
    if (!searchTerm) return content;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return content.replace(regex, '<mark>$1</mark>');
}

// 修改搜索函数
function searchNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredNotes = notes.filter(note => 
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        note.category.toLowerCase().includes(searchTerm)
    ).map(note => ({
        ...note,
        content: highlightSearchTerm(note.content, searchTerm)
    }));
    displayNotes(filteredNotes);
}

// 预览功能
function togglePreview() {
    const previewArea = document.querySelector('.preview-area');
    const editorWrapper = document.querySelector('.editor-wrapper');
    const isPreviewActive = previewArea.classList.toggle('active');
    
    // 切换编辑器包装器的预览状态类
    editorWrapper.classList.toggle('preview-active', isPreviewActive);
    
    if (isPreviewActive) {
        updatePreview();
    }
}

// 更新预览内容
function updatePreview() {
    const content = noteInput.value;
    const previewContent = document.querySelector('.preview-content');
    previewContent.innerHTML = marked.parse(content);
}

// Markdown 快捷工具
function insertMarkdown(type) {
    const input = document.getElementById('noteInput');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    let insertion = '';
    
    const selections = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        heading: ['## ', ''],
        link: ['[', '](url)'],
        image: ['![alt text](', ')'],
        code: ['`', '`'],
        list: ['- ', '']
    };
    
    const [prefix, suffix] = selections[type];
    const selectedText = text.substring(start, end);
    
    input.value = text.substring(0, start) + 
                  prefix + selectedText + suffix +
                  text.substring(end);
    
    // 保持选中状态
    const newCursorPos = selectedText ? end + prefix.length : start + prefix.length;
    input.focus();
    input.setSelectionRange(newCursorPos, newCursorPos);
    
    // 更新预览
    if (document.querySelector('.preview-area').classList.contains('active')) {
        updatePreview();
    }
}

// 实时预览
noteInput.addEventListener('input', () => {
    if (document.querySelector('.preview-area').classList.contains('active')) {
        updatePreview();
    }
});

// 导出笔记
function exportNotes() {
    const notesText = notes.map(note => `
# ${note.category}
${note.tags.map(tag => `#${tag}`).join(' ')}
${note.content}
---
创建时间：${note.timestamp}
    `).join('\n\n');
    
    const blob = new Blob([notesText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `我的笔记_${new Date().toLocaleDateString()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('笔记导出成功！');
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification animate__animated animate__fadeInDown';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.replace('animate__fadeInDown', 'animate__fadeOutUp');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// 添加笔记统计
function updateNoteStats() {
    const stats = {
        total: notes.length,
        categories: {},
        tags: {},
        wordsCount: 0
    };

    notes.forEach(note => {
        // 统计分类
        stats.categories[note.category] = (stats.categories[note.category] || 0) + 1;
        // 统计标签
        note.tags.forEach(tag => {
            stats.tags[tag] = (stats.tags[tag] || 0) + 1;
        });
        // 统计字数
        stats.wordsCount += note.content.length;
    });

    const statsHtml = `
        <div class="notes-stats">
            <div class="stat-item">
                <span class="stat-icon">📝</span>
                <span class="stat-value">${stats.total}</span>
                <span class="stat-label">笔记总数</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">📊</span>
                <span class="stat-value">${Object.keys(stats.categories).length}</span>
                <span class="stat-label">分类数</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">🏷️</span>
                <span class="stat-value">${Object.keys(stats.tags).length}</span>
                <span class="stat-label">标签数</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">📖</span>
                <span class="stat-value">${stats.wordsCount}</span>
                <span class="stat-label">总字数</span>
            </div>
        </div>
    `;

    document.querySelector('.notes-header').insertAdjacentHTML('beforeend', statsHtml);
}

// 添加分享功能
function shareNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // 生成分享链接
    const shareData = {
        title: `分享笔记 - ${note.category}`,
        text: note.content.substring(0, 100) + '...',
        url: window.location.href + `?share=${noteId}`
    };

    // 使用网页分享API
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showNotification('分享成功！'))
            .catch(() => showNotification('分享取消'));
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(shareData.url)
            .then(() => showNotification('链接已复制到剪贴板！'));
    }
}

// 添加标签云功能
function generateTagCloud() {
    const tagStats = {};
    notes.forEach(note => {
        note.tags.forEach(tag => {
            tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
    });

    const tagCloudHtml = `
        <div class="tag-cloud">
            <h3>标签云</h3>
            <div class="tag-list">
                ${Object.entries(tagStats).map(([tag, count]) => `
                    <span class="cloud-tag" style="font-size: ${Math.min(1 + count * 0.2, 2)}em">
                        #${tag}
                        <span class="tag-count">${count}</span>
                    </span>
                `).join('')}
            </div>
        </div>
    `;

    document.querySelector('.notes-display-section').insertAdjacentHTML('afterbegin', tagCloudHtml);
}

// 添加归档功能
function archiveNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    note.archived = true;
    note.archiveDate = new Date().toLocaleString();
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    showNotification('笔记已归档！');
}

// 显示归档列表
function showArchive() {
    const archivedNotes = notes.filter(note => note.archived);
    displayNotes(archivedNotes);
    document.querySelector('.archive-btn').classList.add('active');
}

// 添加版本历史功能
function saveNoteVersion(note) {
    if (!note.versions) note.versions = [];
    note.versions.push({
        content: note.content,
        timestamp: new Date().toLocaleString()
    });
    // 只保留最近5个版本
    if (note.versions.length > 5) {
        note.versions.shift();
    }
}

// 显示版本历史
function showVersionHistory(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.versions) return;

    const historyHtml = `
        <div class="version-history">
            <h3>版本历史</h3>
            <div class="version-list">
                ${note.versions.map((version, index) => `
                    <div class="version-item">
                        <div class="version-info">
                            版本 ${index + 1} - ${version.timestamp}
                        </div>
                        <div class="version-content">
                            ${marked.parse(version.content)}
                        </div>
                        <button class="btn restore-btn" onclick="restoreVersion(${noteId}, ${index})">
                            恢复此版本
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // 显示历史记录弹窗
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = historyHtml;
    document.body.appendChild(modal);
}

// 图片上传功能
function setupImageUpload() {
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn upload-btn';
    uploadBtn.innerHTML = '<span class="btn-icon">🖼️</span> 插入图片';
    uploadBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = handleImageUpload;
        input.click();
    };
    document.querySelector('.markdown-tools').appendChild(uploadBtn);
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // 转换为Base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            // 插入Markdown图片语法
            insertMarkdown('custom-image', `![${file.name}](${imageData})`);
            showNotification('图片插入成功！');
        };
        reader.readAsDataURL(file);
    } catch (error) {
        showNotification('图片上传失败！');
    }
}

// 打印功能
function printNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>打印笔记 - ${note.category}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .note-header { margin-bottom: 20px; }
                .note-content { line-height: 1.6; }
                .note-footer { margin-top: 20px; color: #666; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="note-header">
                <h1>${note.category}</h1>
                <div>${note.tags.map(tag => `#${tag}`).join(' ')}</div>
            </div>
            <div class="note-content">
                ${marked.parse(note.content)}
            </div>
            <div class="note-footer">
                创建时间：${note.timestamp}
            </div>
            <button class="no-print" onclick="window.print()">打印</button>
        </body>
        </html>
    `);
}

// 笔记提醒功能
function addNoteReminder(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const reminderTime = prompt('请输入提醒时间（格式：YYYY-MM-DD HH:mm）');
    if (!reminderTime) return;

    const reminder = {
        noteId,
        time: new Date(reminderTime).getTime(),
        title: note.category,
        content: note.content.substring(0, 50) + '...'
    };

    // 存储提醒
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    reminders.push(reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));

    // 设置提醒
    const timeUntilReminder = reminder.time - Date.now();
    if (timeUntilReminder > 0) {
        setTimeout(() => {
            showNotification(`提醒：${reminder.title}\n${reminder.content}`);
            // 如果支持系统通知
            if (Notification.permission === 'granted') {
                new Notification('笔记提醒', {
                    body: `${reminder.title}\n${reminder.content}`,
                    icon: '/path/to/icon.png'
                });
            }
        }, timeUntilReminder);
    }
}

// 初始化
displayNotes();

// 主题切换
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night');
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = document.body.classList.contains('night') ? '☀️' : '🌙';
});

// Gitalk 配置
function initGitalk(noteId) {
    const gitalk = new Gitalk({
        clientID: 'YOUR_CLIENT_ID', // 从 GitHub Application 获取
        clientSecret: 'YOUR_CLIENT_SECRET', // 从 GitHub Application 获取
        repo: 'YOUR_REPO_NAME', // 存储评论的仓库
        owner: 'YOUR_GITHUB_USERNAME',
        admin: ['YOUR_GITHUB_USERNAME'],
        id: noteId.toString(), // 页面唯一标识
        distractionFreeMode: false
    });
    gitalk.render('gitalk-container');
} 