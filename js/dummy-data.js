/**
 * Checks if local storage is empty and loads dummy data if needed.
 */
function checkAndLoadDummyData() {
    if (!localStorage.getItem('tasks') && !localStorage.getItem('contacts')) {
        const dummyContacts = [
            { name: "Walter White", email: "heisenberg@gmail.com", phone: "+1 505 555 0100", color: "#FF7A00" },
            { name: "Jesse Pinkman", email: "capncook@hotmail.com", phone: "+1 505 555 0101", color: "#FF5EB3" },
            { name: "Skyler White", email: "skyler.white@yahoo.com", phone: "+1 505 555 0102", color: "#6E52FF" },
            { name: "Hank Schrader", email: "asac.schrader@dea.gov", phone: "+1 505 555 0103", color: "#9327FF" },
            { name: "Saul Goodman", email: "bettercallsaul@gmail.com", phone: "+1 505 503 4455", color: "#00BEE8" },
            { name: "Mike Ehrmantraut", email: "mike.security@gmail.com", phone: "+1 505 555 0104", color: "#1FD7C1" },
            { name: "Gustavo Fring", email: "pollos@hermanos.com", phone: "+1 505 555 0105", color: "#FF745E" },
            { name: "Marie Schrader", email: "marie.purple@gmail.com", phone: "+1 505 555 0106", color: "#FFA35E" },
            { name: "Tuco Salamanca", email: "tuco@cartel.net", phone: "+1 505 555 0107", color: "#FC71FF" },
            { name: "Gale Boetticher", email: "gale.coffee@gmail.com", phone: "+1 505 555 0108", color: "#FFC701" }
        ];

        const dummyTasks = [
            { id: 1710000000001, title: "Cook Batch #42", description: "Prepare the new batch of Blue Sky. Purity must be 99.1%.", dueDate: "2027-12-31", category: "Technical Task", prio: "urgent", status: "todo", subtasks: [{ title: "Clean glassware", completed: false }, { title: "Check methylamine supply", completed: false }], assignedContacts: ["heisenberg@gmail.com", "capncook@hotmail.com"] },
            { id: 1710000000002, title: "Call Saul Goodman", description: "Discuss money laundering options for the car wash.", dueDate: "2027-11-15", category: "User Story", prio: "medium", status: "inprogress", subtasks: [], assignedContacts: ["skyler.white@yahoo.com", "bettercallsaul@gmail.com"] },
            { id: 1710000000003, title: "Find new RV", description: "The old Crystal Ship is compromised. We need a new mobile lab.", dueDate: "2027-10-20", category: "Technical Task", prio: "urgent", status: "awaitingfeedback", subtasks: [{ title: "Check classifieds", completed: true }], assignedContacts: ["capncook@hotmail.com", "mike.security@gmail.com"] },
            { id: 1710000000004, title: "Distribution Meeting", description: "Meeting with Gus Fring at Los Pollos Hermanos.", dueDate: "2027-12-01", category: "User Story", prio: "low", status: "done", subtasks: [], assignedContacts: ["pollos@hermanos.com", "heisenberg@gmail.com"] },
            { id: 1710000000005, title: "DEA Surveillance", description: "Check if Hank is onto the laundry facility.", dueDate: "2027-11-01", category: "Technical Task", prio: "medium", status: "todo", subtasks: [{ title: "Place bugs", completed: false }, { title: "Monitor radio frequencies", completed: false }], assignedContacts: ["mike.security@gmail.com"] }
        ];

        localStorage.setItem('contacts', JSON.stringify(dummyContacts));
        localStorage.setItem('tasks', JSON.stringify(dummyTasks));
    }
}

/**
 * Resets data to dummy data (For testing purposes).
 */
function resetToDummyData() {
    localStorage.clear();
    checkAndLoadDummyData();
    location.reload();
}