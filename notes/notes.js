// 笔记本功能实现
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
let isPreviewMode = false;
let currentNoteId = null; // 当前选中的笔记ID

// DOM 元素
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');
const preview = document.getElementById('preview');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('noteCategory');
const tagsInput = document.getElementById('noteTags');

// 详情面板元素
const noteDetailPanel = document.getElementById('noteDetailPanel');
const noteDetailEmpty = document.getElementById('noteDetailEmpty');
const detailCategory = document.getElementById('detailCategory');
const detailDate = document.getElementById('detailDate');
const detailTags = document.getElementById('detailTags');
const detailContent = document.getElementById('detailContent');

// Markdown 预览设置
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

// 自动保存功能
let autoSaveTimer;

noteInput.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        if (noteInput.value.trim()) {
            // 可以添加自动保存逻辑
        }
    }, 3000);
});

// 保存笔记
function saveNote(isAutoSave = false) {
    const content = noteInput.value.trim();
    if (!content) {
        showNotification('请输入笔记内容！');
        return;
    }

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
        noteInput.value = '';
        tagsInput.value = '';
        categorySelect.value = '默认';
        showNotification('笔记保存成功！');
    }

    displayNotes();
    updateNotesCount();
}

// 显示笔记列表
function displayNotes(filteredNotes = notes) {
    notesList.innerHTML = '';

    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary, #999);">
                <div style="font-size: 2rem;">📝</div>
                <div style="margin-top: 10px;">还没有笔记</div>
            </div>
        `;
        closeDetailPanel();
        return;
    }

    filteredNotes.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-item';
        if (note.id === currentNoteId) {
            div.classList.add('active');
        }
        div.dataset.noteId = note.id;

        // 获取标题（第一行或第一行 # 开头的内容）
        const lines = note.content.split('\n').filter(l => l.trim());
        let title = '无标题笔记';
        let excerpt = note.content.replace(/[#*`\[\]()]/g, '').substring(0, 80);

        for (const line of lines) {
            if (line.startsWith('# ')) {
                title = line.replace(/^#+\s*/, '');
                break;
            }
        }

        div.innerHTML = `
            <div class="note-header">
                <span class="note-category">${escapeHtml(note.category)}</span>
                <span class="note-date">${note.timestamp.split(' ')[0]}</span>
            </div>
            <div class="note-title-preview">${escapeHtml(title)}</div>
            <div class="note-excerpt">${escapeHtml(excerpt)}${note.content.length > 80 ? '...' : ''}</div>
            <div class="note-tags">
                ${note.tags.slice(0, 3).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                ${note.tags.length > 3 ? `<span class="tag">+${note.tags.length - 3}</span>` : ''}
            </div>
            <div class="note-footer">
                <button class="note-footer-btn" onclick="viewNoteDetail(${note.id}, event)">查看</button>
                <button class="note-footer-btn" onclick="editNote(${note.id}, event)">编辑</button>
                <button class="note-footer-btn delete" onclick="deleteNote(${note.id}, event)">删除</button>
            </div>
        `;

        notesList.appendChild(div);
    });
}

// 查看笔记详情（在右侧下方显示）
function viewNoteDetail(noteId, event) {
    if (event) event.stopPropagation();

    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    currentNoteId = noteId;

    // 更新列表选中状态
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.noteId) === noteId) {
            item.classList.add('active');
        }
    });

    // 渲染详情
    const title = extractTitle(note.content);
    const contentHtml = typeof marked !== 'undefined' ? marked.parse(note.content) : escapeHtml(note.content);

    detailCategory.textContent = note.category;
    detailDate.textContent = note.timestamp;
    detailTags.innerHTML = note.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('');
    detailContent.innerHTML = `<h1>${escapeHtml(title)}</h1>${contentHtml}`;

    // 显示详情面板
    noteDetailEmpty.style.display = 'none';
    noteDetailPanel.classList.add('active');
}

// 提取标题
function extractTitle(content) {
    const lines = content.split('\n').filter(l => l.trim());
    for (const line of lines) {
        if (line.startsWith('# ')) {
            return line.replace(/^#+\s*/, '');
        }
    }
    return '无标题笔记';
}

// 关闭详情面板
function closeDetailPanel() {
    currentNoteId = null;
    noteDetailPanel.classList.remove('active');
    noteDetailEmpty.style.display = 'flex';

    // 移除选中状态
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
}

// 编辑当前笔记
function editCurrentNote() {
    if (!currentNoteId) return;
    editNote(currentNoteId, null);
}

// 分享当前笔记
function shareCurrentNote() {
    if (!currentNoteId) return;
    shareNote(currentNoteId, null);
}

// 删除当前笔记
function deleteCurrentNote() {
    if (!currentNoteId) return;
    deleteNote(currentNoteId, null);
}

// 删除笔记
function deleteNote(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('确定要删除这条笔记吗？')) return;

    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));

    // 如果删除的是当前显示的笔记，关闭详情面板
    if (currentNoteId === id) {
        closeDetailPanel();
    }

    displayNotes();
    updateNotesCount();
    showNotification('笔记已删除！');
}

// 编辑笔记
function editNote(id, event) {
    if (event) event.stopPropagation();
    const note = notes.find(note => note.id === id);
    if (!note) return;

    noteInput.value = note.content;
    categorySelect.value = note.category;
    tagsInput.value = note.tags.join(', ');

    // 删除原笔记
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));

    // 关闭详情面板
    closeDetailPanel();

    // 滚动到编辑区
    document.querySelector('.editor-section').scrollIntoView({ behavior: 'smooth' });
    noteInput.focus();
    displayNotes();
    updateNotesCount();
    showNotification('笔记已载入编辑器！');
}

// 搜索笔记
function searchNotes() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        displayNotes();
        return;
    }

    const filteredNotes = notes.filter(note =>
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        note.category.toLowerCase().includes(searchTerm)
    );

    displayNotes(filteredNotes);

    if (filteredNotes.length === 0) {
        showNotification('没有找到匹配的笔记');
    }
}

// 监听搜索输入
searchInput.addEventListener('input', debounce(searchNotes, 300));

// 预览功能
function togglePreview() {
    const previewArea = document.getElementById('preview');
    if (!previewArea) return;

    const isVisible = previewArea.style.display !== 'none';
    previewArea.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        updatePreview();
    }
}

// 更新预览内容
function updatePreview() {
    const content = noteInput.value;
    const previewContentEl = document.querySelector('.preview-content');
    if (previewContentEl) {
        previewContentEl.innerHTML = typeof marked !== 'undefined' ? marked.parse(content) : escapeHtml(content);
    }
}

// Markdown 快捷工具
function insertMarkdown(type) {
    const input = document.getElementById('noteInput');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    const selections = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        heading: ['## ', ''],
        link: ['[', '](url)'],
        image: ['![alt](', ')'],
        code: ['`', '`'],
        list: ['- ', '']
    };

    const [prefix, suffix] = selections[type];
    const selectedText = text.substring(start, end);

    input.value = text.substring(0, start) +
                  prefix + selectedText + suffix +
                  text.substring(end);

    // 设置光标位置
    const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 0);
    input.focus();
    input.setSelectionRange(newCursorPos, newCursorPos);

    // 更新预览
    if (document.getElementById('preview').style.display !== 'none') {
        updatePreview();
    }
}

// 实时预览
noteInput.addEventListener('input', () => {
    const previewArea = document.getElementById('preview');
    if (previewArea && previewArea.style.display !== 'none') {
        updatePreview();
    }
});

// 导出笔记
function exportNotes() {
    if (notes.length === 0) {
        showNotification('没有笔记可导出！');
        return;
    }

    const notesText = notes.map(note => `
# ${note.category}
${note.tags.map(tag => `#${tag}`).join(' ')}
创建时间：${note.timestamp}

${note.content}

---
    `).join('\n\n');

    const blob = new Blob([notesText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `我的笔记_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('笔记导出成功！');
}

// 导入 Markdown 文件
let importedContent = '';
let importedFileName = '';

function importMarkdown() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.onchange = handleFileSelect;
    input.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    importedFileName = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        importedContent = e.target.result;

        // 显示预览模态框
        const modal = document.getElementById('importModal');
        const fileNameEl = document.getElementById('importFileName');
        const previewEl = document.getElementById('importPreview');

        fileNameEl.textContent = importedFileName;

        // 渲染 Markdown 预览
        if (typeof marked !== 'undefined') {
            previewEl.innerHTML = marked.parse(importedContent);
        } else {
            previewEl.textContent = importedContent;
        }

        modal.style.display = 'flex';
    };
    reader.onerror = function() {
        showNotification('文件读取失败！');
    };
    reader.readAsText(file);
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'none';
    importedContent = '';
    importedFileName = '';
}

function saveImportedNote() {
    if (!importedContent) {
        showNotification('没有内容可保存！');
        return;
    }

    // 从文件名提取标题（去掉扩展名）
    const title = importedFileName.replace(/\.(md|markdown|txt)$/i, '');

    const note = {
        id: Date.now(),
        content: importedContent,
        category: '导入',
        tags: [title],
        timestamp: new Date().toLocaleString(),
        lastModified: new Date().toLocaleString()
    };

    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));

    // 将内容填入编辑器
    noteInput.value = importedContent;
    categorySelect.value = '导入';
    tagsInput.value = title;

    displayNotes();
    closeImportModal();
    showNotification('导入文件已保存为笔记！');
}

// 设置模态框监听器
function setupModalListeners() {
    // 导入模态框
    const importModal = document.getElementById('importModal');
    if (importModal) {
        importModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImportModal();
            }
        });
    }
}

// 页面加载完成后设置监听器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModalListeners);
} else {
    setupModalListeners();
}

// 分享笔记
function shareNote(noteId, event) {
    event.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const shareData = {
        title: `分享笔记 - ${note.category}`,
        text: note.content.substring(0, 100) + '...',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showNotification('分享成功！'))
            .catch(() => {});
    } else {
        navigator.clipboard.writeText(note.content)
            .then(() => showNotification('笔记内容已复制到剪贴板！'))
            .catch(() => showNotification('复制失败'));
    }
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 转义 HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 防抖函数
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

// 初始化
displayNotes();
updateNotesCount();

// 更新笔记计数
function updateNotesCount() {
    const countEl = document.getElementById('notesCount');
    if (countEl) countEl.textContent = notes.length;
}

// 聚焦编辑器（新建笔记）
function focusEditor() {
    closeDetailPanel();
    noteInput.value = '';
    tagsInput.value = '';
    categorySelect.value = '默认';

    // 隐藏预览区
    const previewArea = document.getElementById('preview');
    if (previewArea) previewArea.style.display = 'none';

    document.querySelector('.editor-section').scrollIntoView({ behavior: 'smooth' });
    noteInput.focus();
}

// 清空所有笔记
function clearAllNotes() {
    if (notes.length === 0) {
        showNotification('没有笔记可清空！');
        return;
    }

    if (confirm(`确定要清空所有 ${notes.length} 条笔记吗？此操作不可恢复！`)) {
        notes = [];
        localStorage.setItem('notes', JSON.stringify(notes));
        closeDetailPanel();
        displayNotes();
        updateNotesCount();
        showNotification('所有笔记已清空！');
    }
}

// 回车保存（Ctrl+Enter）
noteInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        saveNote();
    }
});

console.log('✿ 笔记本已加载 ~');
