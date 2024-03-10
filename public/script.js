let storedTasks = {};

// Load tasks from local storage when the page loads
window.onload = function () {
    storedTasks = JSON.parse(localStorage.getItem('tasks')) || { notStarted: [], inProgress: [], completed: [] };
    renderTasks();
}

function addCard(status) {
    const cardText = prompt("Enter card text:");
    if (cardText) {
        const newTask = { id: Date.now(), title: cardText, status: status, description: "" };
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
    card.dataset.id = task.id;
    card.draggable = true;
    card.addEventListener('dragstart', dragStart);

    // Display task title
    const titleElement = document.createElement('h3');
    titleElement.textContent = task.title;
    card.appendChild(titleElement);

    // Attach event listener to show details when clicked
    card.addEventListener('click', function () {
        openDetailsPage(task.id);
    });

    container.appendChild(card);
    addDeleteButton(card, task.id, status);
}

function addDeleteButton(card, taskId, status) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerText = 'Delete';
    deleteButton.onclick = function (event) {
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

// Function to show the add task form
function showAddTaskForm(status) {
    document.getElementById('addTaskModal').style.display = 'block';
    document.getElementById('status').value = status;
}

// Function to close the add task form
function closeAddTaskForm() {
    document.getElementById('addTaskModal').style.display = 'none';
}

// Function to add a new task
function addTask(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;

    if (title && status && description) {
        const newTask = { id: Date.now(), title: title, status: status, description: description };
        storedTasks[status].push(newTask);
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
        renderTasks();
        closeAddTaskForm();
    }
}



// Function to open details page
function openDetailsPage(taskId) {
    const task = getTaskById(taskId);
    if (task) {
        // Redirect to details page with task ID
        window.location.href = `details.html?id=${taskId}`;
    }
}

// Function to extract task ID from URL parameter
function getTaskIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Function to fetch and display task details
function viewTaskDetails() {
    const taskId = getTaskIdFromUrl();
    const task = getTaskById(taskId);
    const taskDetailsContainer = document.getElementById('taskDetails');

    if (task) {
        taskDetailsContainer.innerHTML = `
            <h2>${task.title}</h2>
            <p><strong>Status:</strong> ${task.status}</p>
            <p>${task.description}</p>
        `;
    } else {
        taskDetailsContainer.innerHTML = "<p>No task details found.</p>";
    }
}

// Function to retrieve task details by ID
function getTaskById(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (!tasks) return null;

    const allTasks = tasks.notStarted.concat(tasks.inProgress, tasks.completed);
    return allTasks.find(task => task.id === taskId);
}

// Add function to delete task by ID
function deleteTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (!tasks) return;
    
    for (const key in tasks) {
        tasks[key] = tasks[key].filter(task => task.id !== taskId);
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    window.location.href = 'index.html'; // Redirect to main page after deletion
}

// Function to open edit page with task details
function editTask(taskId) {
    const task = getTaskById(taskId);
    if (task) {
        window.location.href = `edit.html?id=${taskId}`;
    }
}


// Function to show edit form
function showEditForm() {
    const task = getTaskById(getTaskIdFromUrl());
    if (task) {
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editStatus').value = task.status;
        document.getElementById('editDescription').value = task.description;
        document.getElementById('taskDetails').style.display = 'none';
        document.getElementById('editForm').style.display = 'block';
    }
}

// Function to hide edit form
function hideEditForm() {
    document.getElementById('taskDetails').style.display = 'block';
    document.getElementById('editForm').style.display = 'none';
}

// Function to save edited task
function saveEditedTask() {
    const taskId = getTaskIdFromUrl();
    const editedTask = {
        id: taskId,
        title: document.getElementById('editTitle').value,
        status : document.getElementById('editStatus').value,
        description: document.getElementById('editDescription').value
    };
    
    console.log("Edited Task Status:", editedTask.status); // Log the status value

    let tasks = JSON.parse(localStorage.getItem('tasks')) || { notStarted: [], inProgress: [], completed: [] };
    for (const key in tasks) {
        tasks[key] = tasks[key].map(task => (task.id === taskId ? editedTask : task));
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Redirect to details page with edited task ID
    window.location.href = `details.html?id=${taskId}`;
}




