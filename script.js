const notes = {
    HTML: [],
    CSS: [],
};

let currentLanguage = 'HTML';

function loadNotes() {
    const savedNotes = localStorage.getItem('oraculoNotes');
    if (savedNotes) {
        Object.assign(notes, JSON.parse(savedNotes));
    }
    renderNotes();
}

function saveToLocalStorage() {
    localStorage.setItem('oraculoNotes', JSON.stringify(notes));
}

function showLanguage(language) {
    currentLanguage = language;
    document.getElementById('language-title').innerText = language.charAt(0).toUpperCase() + language.slice(1);
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';
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
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    clearModalFields();
}

function clearModalFields() {
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
}

function saveNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    if (title && content) {
        notes[currentLanguage].push({ title, content });
        closeModal();
        renderNotes();
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

function editNote(index) {
    const note = notes[currentLanguage][index];
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    openModal();
    deleteNote(index);
}

function deleteNote(index) {
    notes[currentLanguage].splice(index, 1);
    renderNotes();
}

function searchNotes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredNotes = notes[currentLanguage].filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.content.toLowerCase().includes(searchTerm)
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

// Carregar notas ao iniciar
loadNotes();
