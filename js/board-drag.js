/**
 * Starts the drag operation.
 * @param {string} id - The ID of the dragged task.
 */
function startDragging(id) {
    if (window.innerWidth < 1000) return;
    currentDraggedElement = id;
    setTimeout(() => {
        document.body.classList.add('dragging-active');
    }, 10);
}


/**
 * Allows dropping an element.
 * @param {Event} ev - The dragover event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * Stops the drag operation and cleans up.
 */
function stopDragging() {
    document.body.classList.remove('dragging-active');
}


/**
 * Highlights the drop area when dragging a task over it.
 * @param {string} id - The ID of the column.
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}


/**
 * Removes the highlight from the drop area.
 * @param {string} id - The ID of the column.
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}


/**
 * Moves the dragged task to a new status column.
 * @param {string} status - The target status.
 */
function moveTo(status) {
    const task = tasks.find(t => t.id === currentDraggedElement);
    if (task) {
        task.status = status;
        const user = firebase.auth().currentUser;
        if (user) db.collection('users').doc(user.uid).collection('tasks').doc(currentDraggedElement).update({ status: status });
        renderBoard();
        removeHighlight(status);
        stopDragging();
    }
}


/**
 * Shows a toast message on the board.
 * @param {string} text - The message text.
 */
function showBoardToastMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.innerText = text;
    msgDiv.style.cssText = "position: fixed; bottom: 50%; left: 50%; transform: translate(-50%, 50%); background: #2A3647; color: white; padding: 20px; border-radius: 20px; z-index: 999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); animation: slideInAndOut 2s ease-in-out forwards;";
    injectBoardToastStyles();
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 2000);
}


/**
 * Injects CSS keyframes for the board toast animation if not present.
 */
function injectBoardToastStyles() {
    if (!document.getElementById('keyframes-slideInAndOut')) {
        const style = document.createElement('style');
        style.id = 'keyframes-slideInAndOut';
        style.innerHTML = `@keyframes slideInAndOut { 0% { opacity: 0; transform: translate(-50%, 100px); } 10% { opacity: 1; transform: translate(-50%, 50%); } 90% { opacity: 1; transform: translate(-50%, 50%); } 100% { opacity: 0; transform: translate(-50%, 100px); } }`;
        document.head.appendChild(style);
    }
}
