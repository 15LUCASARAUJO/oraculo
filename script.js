const notes = {};

let currentLanguage = null;
let focusedField = null;
let editingIndex = null;

function loadNotes() {
    const savedNotes = localStorage.getItem('oraculoNotes');
    if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        for (const key in parsed) {
            if (parsed.hasOwnProperty(key)) {
                notes[key] = parsed[key];
            }
        }
    }
    renderNotes();
    loadThemes();
    updateUIState();
}

function saveToLocalStorage() {
    localStorage.setItem('oraculoNotes', JSON.stringify(notes));
}

function showLanguage(language) {
    currentLanguage = language;
    document.getElementById('language-title').innerText = language;
    setActiveMenuItem(language);
    renderNotes();
    updateUIState();
}

function setActiveMenuItem(language) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        const text = item.querySelector('.menu-text')?.textContent.trim();
        if (text === language) {
            item.classList.add('active');
        }
    });
}

function renderNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';
    if (!currentLanguage || !notes[currentLanguage]) return;
    notes[currentLanguage].forEach((note, index) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-header">
                <div class="note-title">${note.title}</div>
                <div class="note-actions">
                    <button class="action-btn" onclick="editNote(${index})">Editar</button>
                    <button class="action-btn-danger" onclick="deleteNote(${index})">Excluir</button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
        `;
        container.appendChild(noteCard);
    });
    saveToLocalStorage();
}

function openModal() {
    if (!currentLanguage) {
        alert('Por favor, selecione um tema antes de adicionar uma nota.');
        return;
    }
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    clearModalFields();
    focusedField = null;
    editingIndex = null;
}

function clearModalFields() {
    document.getElementById('note-title').innerHTML = '';
    document.getElementById('note-content').innerHTML = '';
}

document.getElementById('note-title').addEventListener('focus', () => {
    focusedField = 'title';
});
document.getElementById('note-content').addEventListener('focus', () => {
    focusedField = 'content';
});

function saveNote() {
    const title = document.getElementById('note-title').innerHTML.trim();
    const content = document.getElementById('note-content').innerHTML.trim();
    if (!currentLanguage) {
        alert('Selecione um tema antes de salvar a nota.');
        return;
    }
    if (title && content) {
        if (!notes[currentLanguage]) notes[currentLanguage] = [];
        if (editingIndex !== null) {
            notes[currentLanguage][editingIndex] = { title, content };
        } else {
            notes[currentLanguage].push({ title, content });
        }
        closeModal();
        renderNotes();
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

function editNote(index) {
    if (!currentLanguage || !notes[currentLanguage]) return;
    const note = notes[currentLanguage][index];
    document.getElementById('note-title').innerHTML = note.title;
    document.getElementById('note-content').innerHTML = note.content;
    openModal();
    editingIndex = index;
}

function deleteNote(index) {
    if (!currentLanguage || !notes[currentLanguage]) return;
    notes[currentLanguage].splice(index, 1);
    renderNotes();
}

function searchNotes() {
    if (!currentLanguage || !notes[currentLanguage]) return;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredNotes = notes[currentLanguage].filter(note =>
        stripHtml(note.title).toLowerCase().includes(searchTerm) ||
        stripHtml(note.content).toLowerCase().includes(searchTerm)
    );

    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    filteredNotes.forEach((note, index) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-header">
                <div class="note-title">${note.title}</div>
                <div class="note-actions">
                    <button class="action-btn" onclick="editNote(${index})">Editar</button>
                    <button class="action-btn-danger" onclick="deleteNote(${index})">Excluir</button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
        `;
        container.appendChild(noteCard);
    });
}

function stripHtml(html) {
    let tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function selectTextColor() {
    if (!focusedField) {
        alert('Por favor, clique no título ou conteúdo para selecionar o texto antes de marcar.');
        return;
    }
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        alert('Por favor, selecione uma palavra ou frase para mudar a cor.');
        return;
    }
    const selectedText = selection.toString();
    if (!selectedText) {
        alert('Por favor, selecione uma palavra ou frase para mudar a cor.');
        return;
    }
    const color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#3a0ca3';
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = selectedText;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    selection.removeAllRanges();
}

function addNewTheme() {
    const input = document.getElementById('new-theme-input');
    const newTheme = input.value.trim();
    if (!newTheme) {
        alert('Por favor, insira o nome do tema.');
        return;
    }
    if (notes[newTheme]) {
        alert('Este tema já existe.');
        return;
    }
    notes[newTheme] = [];
    addThemeToSidebar(newTheme);
    input.value = '';
    showLanguage(newTheme);
    saveToLocalStorage(); // Salva o novo tema no localStorage
}

function addThemeToSidebar(theme) {
    const sidebarMenu = document.getElementById('sidebar-menu');
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <i class="fas fa-code"></i>
        <span class="menu-text">${theme}</span>
        <div class="menu-actions">
            <button class="edit-btn" title="Editar tema" onclick="editTheme(event, '${theme}')"><i class="fas fa-pen"></i></button>
            <button class="delete-btn" title="Excluir tema" onclick="deleteTheme(event, '${theme}')"><i class="fas fa-trash"></i></button>
        </div>
    `;
    div.querySelector('.menu-text').onclick = () => {
        showLanguage(theme);
    };
    sidebarMenu.appendChild(div);
}

function loadThemes() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    sidebarMenu.innerHTML = '';
    Object.keys(notes).forEach(theme => {
        addThemeToSidebar(theme);
    });
}

function editTheme(event, oldTheme) {
    event.stopPropagation();
    const newName = prompt('Renomear tema:', oldTheme);
    if (!newName) return;
    if (notes[newName]) {
        alert('Este nome de tema já existe.');
        return;
    }
    notes[newName] = notes[oldTheme];
    delete notes[oldTheme];
    if (currentLanguage === oldTheme) {
        currentLanguage = newName;
        document.getElementById('language-title').innerText = newName;
    }
    loadThemes();
    renderNotes();
    updateUIState();
    saveToLocalStorage(); // Salva as alterações após renomear tema
}

function deleteTheme(event, theme) {
    event.stopPropagation();
    if (!confirm(`Tem certeza que deseja excluir o tema "${theme}" e todas as suas notas?`)) return;
    delete notes[theme];
    saveToLocalStorage(); // Salva as alterações no localStorage após exclusão
    if (currentLanguage === theme) {
        currentLanguage = null;
        document.getElementById('language-title').innerText = 'Nenhum tema selecionado';
    }
    loadThemes();
    renderNotes();
    updateUIState();
}

function updateUIState() {
    const addNoteBtn = document.getElementById('add-note-btn');
    if (currentLanguage) {
        addNoteBtn.disabled = false;
    } else {
        addNoteBtn.disabled = true;
        document.getElementById('notes-container').innerHTML = '';
        document.getElementById('search-input').value = '';
    }
}

loadNotes();
