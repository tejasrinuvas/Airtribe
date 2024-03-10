let storedTasks = {};

// Load tasks from local storage when the page loads
window.onload = function() {
    storedTasks = JSON.parse(localStorage.getItem('tasks')) || { notStarted: [], inProgress: [], completed: [] };
    renderTasks();
}

function addCard(status) {
    const cardText = prompt("Enter card text:");
    if (cardText) {
        const newTask = { id: Date.now(), text: cardText };
        storedTasks[status].push(newTask);
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
        renderTasks();
    }
}

function deleteCard(taskId, status) {
    storedTasks[status] = storedTasks[status].filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(storedTasks));
    renderTasks();
}

function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event, status) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    const task = storedTasks[status].find(task => task.id.toString() === taskId);
    if (task) {
        storedTasks[status].push(task);
        storedTasks[event.target.dataset.status] = storedTasks[event.target.dataset.status].filter(t => t.id.toString() !== taskId);
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
        renderTasks();
    }
}

function renderTasks() {
    const notStartedCards = document.getElementById('notStartedCards');
    const inProgressCards = document.getElementById('inProgressCards');
    const completedCards = document.getElementById('completedCards');

    notStartedCards.innerHTML = '';
    inProgressCards.innerHTML = '';
    completedCards.innerHTML = '';

    storedTasks.notStarted.forEach(task => createCard(task, 'notStarted', notStartedCards));
    storedTasks.inProgress.forEach(task => createCard(task, 'inProgress', inProgressCards));
    storedTasks.completed.forEach(task => createCard(task, 'completed', completedCards));
    updateCounts();
}

function createCard(task, status, container) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerText = task.text;
    card.dataset.id = task.id;
    card.draggable = true;
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('click', () => showDeleteButton(task.id, status)); // Moved to createCard
    container.appendChild(card);
    addDeleteButton(card, task.id, status); // Added to createCard
}


function addDeleteButton(card, taskId, status) { // Function to add delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerText = 'Delete';
    deleteButton.onclick = function(event) {
        event.stopPropagation(); // Prevents the card click event from firing
        deleteCard(taskId, status);
    };
    card.appendChild(deleteButton);
}

function updateCounts() {
    document.getElementById('notStartedCount').innerText = storedTasks.notStarted.length;
    document.getElementById('inProgressCount').innerText = storedTasks.inProgress.length;
    document.getElementById('completedCount').innerText = storedTasks.completed.length;
}
