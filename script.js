// 加载笔记
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = notes.map(note => `
        <li>
            <div class="note-category">分类：${note.category}</div>
            <div class="note-tags">标签：${note.tags.join(', ')}</div>
            <div class="note-timestamp">时间：${note.timestamp}</div>
            ${note.content}
            <button class="btn edit-btn" onclick="editNote(${note.id})">✏️ 编辑</button>
            <button class="btn delete-btn" onclick="deleteNote(${note.id})">🗑️ 删除</button>
        </li>
    `).join('');
}

// 保存笔记
function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const noteCategory = document.getElementById('noteCategory').value;
    const noteTags = document.getElementById('noteTags').value.split(',').map(tag => tag.trim());
    const note = noteInput.value.trim();
    if (note) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push({
            id: Date.now(),
            content: marked.parse(note),
            category: noteCategory,
            tags: noteTags,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('notes', JSON.stringify(notes));
        noteInput.value = '';
        document.getElementById('noteTags').value = '';
        loadNotes();
    }
}

// 删除笔记
function deleteNote(id) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

// 编辑笔记
function editNote(id) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes.find(note => note.id === id);
    const newContent = prompt('编辑笔记内容：', note.content);
    if (newContent) {
        note.content = marked.parse(newContent);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }
}

// 搜索笔记
function searchNotes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const filteredNotes = notes.filter(note => note.content.toLowerCase().includes(searchTerm));
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = filteredNotes.map(note => `
        <li>
            <div class="note-category">分类：${note.category}</div>
            <div class="note-tags">标签：${note.tags.join(', ')}</div>
            <div class="note-timestamp">时间：${note.timestamp}</div>
            ${note.content}
            <button class="btn edit-btn" onclick="editNote(${note.id})">✏️ 编辑</button>
            <button class="btn delete-btn" onclick="deleteNote(${note.id})">🗑️ 删除</button>
        </li>
    `).join('');
}

// 导出笔记
function exportNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const content = notes.map(note => `# ${note.content}\n\n`).join('');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.md';
    a.click();
    URL.revokeObjectURL(url);
}

// 切换主题
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('romantic')) {
        body.classList.remove('romantic');
        body.classList.add('mechanical');
    } else {
        body.classList.remove('mechanical');
        body.classList.add('romantic');
    }
}

// 初始化加载笔记
loadNotes();
