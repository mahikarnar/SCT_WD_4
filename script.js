const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Initializing app
document.addEventListener('DOMContentLoaded', function () {
    updateEmptyState();
    updateProgressBar();
    setupButtonAnimations();
    setupFloatingLabel();
});

function setupFloatingLabel() {
    const inputBox = document.getElementById('input-box');
    const floatingLabel = document.querySelector('.floating-label');

    function checkLabelPosition() {
        if (inputBox.value.length > 0 || document.activeElement === inputBox) {
            floatingLabel.classList.add('active');
        } else {
            floatingLabel.classList.remove('active');
        }
    }

    // Handling all events
    inputBox.addEventListener('input', checkLabelPosition);
    inputBox.addEventListener('focus', checkLabelPosition);
    inputBox.addEventListener('blur', checkLabelPosition);
    inputBox.addEventListener('keyup', checkLabelPosition);
    inputBox.addEventListener('change', checkLabelPosition);

    checkLabelPosition();
}

function setupButtonAnimations() {
    // Ripple effect for all buttons
    const buttons = document.querySelectorAll('.animated-btn, #input-button');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            createRipple(e, this);
        });
    });
}

function createRipple(e, button) {
    const ripple = button.querySelector('.button-ripple');
    if (!ripple) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    ripple.style.animation = 'none';
    ripple.offsetHeight; // Trigger reflow
    ripple.style.animation = 'ripple 0.6s linear';
}

function updateEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const tasks = listContainer.children;

    if (tasks.length === 0) {
        emptyState.style.display = 'block';
        listContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        listContainer.style.display = 'block';
    }
}

function updateProgressBar() {
    const totalTasks = listContainer.children.length;
    const completedTasks = document.querySelectorAll(".completed").length;

    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (totalTasks === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = '0% Complete';
    } else {
        const percentage = Math.round((completedTasks / totalTasks) * 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${percentage}% Complete (${completedTasks}/${totalTasks})`;
    }
}

function addTask() {
    const task = inputBox.value.trim();
    if (!task) {
        alert("Please write down a task");
        return;
    }

    // Get current date and time
    const now = new Date();
    const dateTime = now.toLocaleString();

    // Ask user for due date (optional)
    const dueDate = prompt("Enter due date (optional, format: YYYY-MM-DD HH:MM):");
    let dueDateObj = null;
    let dueDateString = "";

    if (dueDate && dueDate.trim()) {
        dueDateObj = new Date(dueDate);
        if (!isNaN(dueDateObj.getTime())) {
            dueDateString = dueDateObj.toLocaleString();
        }
    }

    const li = document.createElement("li");

    // Store data attributes for sorting
    li.setAttribute('data-created', now.getTime());
    if (dueDateObj) {
        li.setAttribute('data-due', dueDateObj.getTime());
    }
    li.setAttribute('data-task', task.toLowerCase());

    li.innerHTML = `
    <div class="task-content">
        <div class="task-left">
            <label>
                <input type="checkbox">
                <span class="task-text">${task}</span>
            </label>
        </div>
        <div class="task-buttons">
            <span class="edit-btn">Edit</span>
            <span class="delete-btn">Delete</span>
        </div>
    </div>
    <div class="task-info">
        <small class="created-time">Created: ${dateTime}</small>
        ${dueDateString ? `<small class="due-time">Due: ${dueDateString}</small>` : ''}
    </div>
    `;

    const checkbox = li.querySelector("input");
    const editBtn = li.querySelector(".edit-btn");
    const taskSpan = li.querySelector(".task-text");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.addEventListener("click", function () {
        li.classList.toggle("completed", checkbox.checked);
        updateCounters();
        updateProgressBar();
        setTimeout(checkOverdueTasks, 100);
    });

    editBtn.addEventListener("click", function () {
        const update = prompt("Edit task:", taskSpan.textContent);
        if (update !== null) {
            taskSpan.textContent = update;
            li.setAttribute('data-task', update.toLowerCase());
            li.classList.remove("completed");
            checkbox.checked = false;
            updateCounters();
            updateProgressBar();
        }
    });

    deleteBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this task?")) {
            li.style.animation = 'fadeInUp 0.3s ease reverse';
            setTimeout(() => {
                li.remove();
                updateCounters();
                updateProgressBar();
                updateEmptyState();
            }, 300);
        }
    });

    listContainer.appendChild(li);
    inputBox.value = "";
    updateCounters();
    updateProgressBar();
    updateEmptyState();

    // Entrance animation
    li.style.animation = 'fadeInUp 0.5s ease';
}

const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");

function updateCounters() {
    const completedTasks = document.querySelectorAll(".completed").length;
    const uncompletedTasks =
        document.querySelectorAll("li:not(.completed)").length;

    completedCounter.textContent = completedTasks;
    uncompletedCounter.textContent = uncompletedTasks;
    updateProgressBar();
}

function sortByCreatedDate() {
    const tasks = Array.from(listContainer.children);
    tasks.sort((a, b) => {
        const dateA = parseInt(a.getAttribute('data-created') || '0');
        const dateB = parseInt(b.getAttribute('data-created') || '0');
        return dateB - dateA; // Newest first
    });

    tasks.forEach(task => listContainer.appendChild(task));
}

function sortByDueDate() {
    const tasks = Array.from(listContainer.children);
    tasks.sort((a, b) => {
        const dueDateA = parseInt(a.getAttribute('data-due') || '9999999999999');
        const dueDateB = parseInt(b.getAttribute('data-due') || '9999999999999');
        return dueDateA - dueDateB; // Earliest due date first
    });

    tasks.forEach(task => listContainer.appendChild(task));
}

function sortAlphabetically() {
    const tasks = Array.from(listContainer.children);
    tasks.sort((a, b) => {
        const taskA = a.getAttribute('data-task') || '';
        const taskB = b.getAttribute('data-task') || '';
        return taskA.localeCompare(taskB);
    });

    tasks.forEach(task => listContainer.appendChild(task));
}

function sortByStatus() {
    const tasks = Array.from(listContainer.children);
    tasks.sort((a, b) => {
        const completedA = a.classList.contains('completed');
        const completedB = b.classList.contains('completed');

        if (completedA && !completedB) return 1;
        if (!completedA && completedB) return -1;
        return 0;
    });

    tasks.forEach(task => listContainer.appendChild(task));
}

function clearCompleted() {
    if (confirm("Are you sure you want to delete all completed tasks?")) {
        const completedTasks = document.querySelectorAll(".completed");
        completedTasks.forEach(task => {
            task.style.animation = 'fadeInUp 0.3s ease reverse';
            setTimeout(() => task.remove(), 300);
        });
        setTimeout(() => {
            updateCounters();
            updateProgressBar();
            updateEmptyState();
        }, 350);
    }
}

function clearAll() {
    if (confirm("Are you sure you want to delete all tasks?")) {
        const allTasks = document.querySelectorAll("li");
        allTasks.forEach((task, index) => {
            task.style.animation = 'fadeInUp 0.3s ease reverse';
            setTimeout(() => task.remove(), index * 50);
        });
        setTimeout(() => {
            listContainer.innerHTML = "";
            updateCounters();
            updateProgressBar();
            updateEmptyState();
        }, allTasks.length * 50 + 300);
    }
}

function checkOverdueTasks() {
    const now = new Date().getTime();
    const tasks = document.querySelectorAll('li');

    tasks.forEach(task => {
        const dueDate = parseInt(task.getAttribute('data-due'));
        const isCompleted = task.classList.contains('completed');

        if (dueDate && dueDate < now && !isCompleted) {
            task.classList.add('overdue');
        } else {
            task.classList.remove('overdue');
        }
    });
}

// Check for overdue tasks every minute
setInterval(checkOverdueTasks, 60000);

// Initial setup when page loads
document.addEventListener('DOMContentLoaded', function () {
    checkOverdueTasks();
    updateEmptyState();
    updateProgressBar();
});

