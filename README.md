<h1 align="center">Join — Kanban Project Management</h1>

<p align="center">
  <a href="https://join.dimit.cc" target="_blank"><img src="https://img.shields.io/badge/Live-join.dimit.cc-3dcfb6?style=for-the-badge&logo=vercel&logoColor=white" alt="Live"/></a>
  <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/n8n-Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n"/>
  <img src="https://img.shields.io/badge/Claude-AI-7B2FBE?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI"/>
</p>

<p align="center">
  A Kanban-based project management tool with an AI-powered email issue collector. External stakeholders submit requests via email — Claude AI automatically creates tickets on the board.
</p>

---

## Features

- **Kanban Board** — visualize tasks across Triage / To Do / In Progress / Awaiting Feedback / Done
- **Drag & Drop** — move tasks between columns (desktop)
- **Mobile Navigation** — move tasks via popup menu on mobile
- **Task Management** — priority, due date, subtasks, assigned contacts
- **Contact Management** — add team members and assign them to tasks
- **Summary Dashboard** — overview of deadlines, task distribution and email requests
- **Auth** — guest login or personal account via Firebase Authentication
- **Responsive** — optimized for desktop, tablet and mobile

### AI Issue Collector

External stakeholders can submit feature requests via email — no account needed.

- Stakeholder sends email to `support@join.dimit.cc`
- n8n receives the email via IMAP and passes it to **Claude Haiku**
- Claude extracts title, description, priority, due date and category
- A ticket is automatically created in the **Triage** column on the board
- The stakeholder receives a **confirmation email** with the ticket details
- When the team moves the ticket to a new column, the stakeholder gets a **status notification**
- Daily limit of 10 AI-generated tickets — above the limit, emails are forwarded to the team for manual review

## Tech Stack

| Technology | Usage |
|---|---|
| HTML5 / CSS3 | Structure & styling |
| JavaScript (ES6) | Application logic |
| Firebase Auth | User authentication |
| Firebase Firestore | Data persistence |
| n8n Cloud | Workflow automation |
| Claude Haiku (Anthropic) | AI email parsing |
| IMAP / SMTP | Email trigger and notifications |

## Firestore Structure

```
users/{uid}/tasks/{taskId}     — internal tasks
users/{uid}/contacts/{id}      — contacts
triage_tasks/{taskId}          — external / AI-generated tasks
system/dailyLimit              — { count: number, date: "YYYY-MM-DD" }
```

## n8n Workflows

Exported workflow JSONs are in the [`n8n-workflows/`](n8n-workflows/) folder.

**Workflow 1 — Email Issue Collector**
`Email Trigger (IMAP)` → `Get Counter` → `IF: Limit Reached?`
- TRUE → `Email: Limit Reply` → `Forward to Team`
- FALSE → `Claude AI` → `Extract Fields` → `Firestore: Create Task` → `Email: Confirmation` → `Update Counter`

**Workflow 2 — Status Notification**
`Webhook POST /task-status-change` → `Send Email`

## Getting Started

```bash
git clone https://github.com/milosdimi/join-kanban.git
cd join-kanban
```

Open `index.html` in a browser or deploy to any static host.

**To test the AI Issue Collector:**
1. Go to [join.dimit.cc](https://join.dimit.cc)
2. Click **"Create request"** as a stakeholder
3. Send an email to `support@join.dimit.cc` describing your feature request
4. Log in as a team member to see the ticket in the **Triage** column

## Live Demo

[https://join.dimit.cc](https://join.dimit.cc)

**Guest login:** available on the login page
