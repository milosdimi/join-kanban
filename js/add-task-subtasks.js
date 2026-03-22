/**
 * Sets up the event listener for the subtask input field (Enter key).
 */
function setupSubtaskInput() {
    const input = document.getElementById('subtask');
    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addSubtask();
            }
        });
    }
}


/**
 * Adds a new subtask to the list.
 */
function addSubtask() {
    let input = document.getElementById('subtask');
    if (input.value.trim().length > 0) {
        subtasks.push({ title: input.value, completed: false });
        input.value = '';
        renderSubtasks();
    }
}


/**
 * Renders the list of subtasks.
 */
function renderSubtasks() {
    let list = document.getElementById('subtaskList');
    list.innerHTML = '';
    for (let i = 0; i < subtasks.length; i++) {
        list.innerHTML += generateSubtaskHTML(subtasks[i], i);
    }
}


/**
 * Enables edit mode for a specific subtask.
 * @param {number} index - The index of the subtask.
 */
function editSubtask(index) {
    let subtaskItem = document.getElementById(`subtask-${index}`);
    let currentTitle = subtasks[index].title;
    subtaskItem.classList.add('editing');
    subtaskItem.innerHTML = generateEditSubtaskHTML(currentTitle, index);
    document.getElementById(`edit-subtask-${index}`).focus();
}


/**
 * Saves the edited subtask title.
 * @param {number} index - The index of the subtask.
 */
function saveSubtask(index) {
    let input = document.getElementById(`edit-subtask-${index}`);
    if (input.value.trim().length > 0) {
        subtasks[index].title = input.value;
    } else {
        subtasks.splice(index, 1);
    }
    renderSubtasks();
}


/**
 * Deletes a subtask from the list.
 * @param {number} index - The index of the subtask.
 */
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}


/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
    document.getElementById('subtask').value = '';
}
