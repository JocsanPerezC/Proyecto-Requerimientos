# Proyecto Requerimientos

> Full-stack web application for project and requirements management — React + Node.js + SQL Server

---

## Description

Proyecto Requerimientos is a web application for managing software projects and their associated requirements, activities, and tasks. Users can register, log in, create projects, assign team members with specific roles, define requirements, break them down into activities, and further decompose activities into tasks with file attachments. The application includes a high-contrast accessibility mode and a role-based permission system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router DOM 7, Bootstrap 5, Axios, React Toastify |
| Backend | Node.js, Express 5 |
| Database | SQL Server (mssql) |
| File uploads | Multer (up to 2GB per file) |
| Auth | Username-based session via HTTP headers |
| Environment | dotenv |

---

## Features

### Authentication
- User registration with validation (minimum age 15, password strength, 8-digit emergency contact, unique email and username)
- Login with active account check
- Account recovery / reactivation
- Registration directly into a project with an assigned role

### Projects
- Create, view, edit, and delete projects
- Add and remove users from a project
- Edit user roles within a project
- Mark a project as delivered

### Requirements
- Create, view, edit, and delete requirements linked to a project

### Activities
- Create, view, edit, and delete activities linked to a project

### Tasks
- Create, view, edit, and delete tasks linked to an activity
- Upload file attachments per task (images, videos, PDFs, Word, Excel, PowerPoint)
- Edit alternative text for attachments
- Deadline enforcement on uploads

### Users
- View and edit own profile
- View and edit other users' profiles and project roles (admin only)
- Soft delete (deactivate) own account

### Accessibility
- High-contrast mode toggle available on all pages

---

## Role System

Roles are stored in the `RolesProyecto` table. Actions such as adding/removing users and editing roles are restricted to users with the `Administrador de Proyecto` or `Lider de Proyecto` role on that project.

---

## Project Structure

```
Proyecto-Requerimientos/
├── Server/                         # Node.js + Express backend
│   ├── server.js                   # Entry point, Express setup and route mounting
│   ├── db.js                       # SQL Server connection pool
│   ├── .env                        # Environment variables (DB credentials, port)
│   ├── middleware/
│   │   └── auth.js                 # authenticateUser middleware
│   ├── utils/
│   │   └── permissions.js          # isAdminOfProject helper
│   ├── routes/
│   │   ├── auth.routes.js          # /register, /login, /recover, /register-project/:id
│   │   ├── user.routes.js          # /user (GET, PUT, DELETE)
│   │   └── project.routes.js       # All project, requirement, activity, task, and attachment routes
│   └── uploads/                    # Uploaded files (auto-generated)
│
└── crud/                           # React frontend
    ├── src/
    │   ├── App.js                  # Route definitions
    │   ├── components/
    │   │   ├── auth/               # Login, Register, AccountRecovery, UserContext
    │   │   ├── layout/             # Dashboard, Topbar
    │   │   ├── projects/           # ProjectDetails, CreateProject, EditProject, ProjectUsers, etc.
    │   │   │   ├── Requirements/   # CreateRequirement, EditRequirement
    │   │   │   ├── Activities/     # CreateActivities, EditActivities
    │   │   │   └── Tasks/          # CreateTask, EditTask, Attachment
    │   │   ├── users/              # AddUserToProject, EditUser, EditUserRole, UserProfileEdit, UserProfileView
    │   │   └── reports/            # reportWebVitals
    │   └── styles/                 # style.css (includes high-contrast theme)
    └── public/                     # Static assets
```

---

## API Endpoints

### Auth (`/api`)
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Log in |
| POST | `/recover` | Reactivate a deactivated account |
| POST | `/register-project/:id` | Register a user and assign them to a project |

### Users (`/api`)
| Method | Route | Description |
|---|---|---|
| GET | `/user` | Get own profile |
| PUT | `/user/edit` | Edit own profile |
| DELETE | `/user` | Deactivate own account |

### Projects (`/api`)
| Method | Route | Description |
|---|---|---|
| GET | `/projects` | List all projects for the authenticated user |
| POST | `/create-project` | Create a new project |
| GET | `/project/:id` | Get project details |
| PUT | `/project/:id` | Edit a project |
| DELETE | `/project/:id` | Delete a project |
| PUT | `/project/:id/entregar` | Mark a project as delivered |
| GET | `/project/:id/users` | List users in a project |
| POST | `/project/:id/add-user` | Add a user to a project |
| DELETE | `/project/:id/users/:userId` | Remove a user from a project |
| PUT | `/project/:id/users/:userid/role` | Edit a user's role in a project |

### Requirements (`/api`)
| Method | Route | Description |
|---|---|---|
| GET | `/project/:id/requirements` | List requirements for a project |
| POST | `/create-requirement` | Create a requirement |
| GET | `/requirement/:id` | Get a requirement |
| PUT | `/requirement/:id` | Edit a requirement |
| DELETE | `/requirement/:id` | Delete a requirement |

### Activities (`/api`)
| Method | Route | Description |
|---|---|---|
| GET | `/project/:id/activities` | List activities for a project |
| POST | `/create-activity` | Create an activity |
| GET | `/activity/:id` | Get an activity |
| PUT | `/activity/:id` | Edit an activity |
| DELETE | `/activity/:id` | Delete an activity |

### Tasks (`/api`)
| Method | Route | Description |
|---|---|---|
| GET | `/activity/:id/tasks` | List tasks for an activity |
| POST | `/create-task` | Create a task |
| GET | `/task/:id` | Get a task |
| PUT | `/task/:id` | Edit a task |
| DELETE | `/task/:id` | Delete a task |
| POST | `/tasks/upload` | Upload a file attachment to a task |
| GET | `/task/:id/attachments` | Get attachments for a task |
| PATCH | `/tasks/attachment/:id/alt` | Update alt text for an attachment |

---

## Setup and Run

### Requirements
- Node.js 18+
- SQL Server instance with the `GDP` database
- A `.env` file in `Server/` with the following variables:

```env
DB_SERVER=your_server
DB_DATABASE=GDP
DB_USER=your_user
DB_PASSWORD=your_password
DB_PORT=1433
```

### Backend

```bash
cd Server
npm install
node server.js
# Runs on http://localhost:3001
```

### Frontend

```bash
cd crud
npm install
npm start
# Runs on http://localhost:3000
```

---

## Supported File Types for Attachments

PNG, JPEG, JPG, MP4, WebM, PDF, DOC, DOCX, XLS, XLSX, PPTX — up to 2GB per file.

---


Developed as a university project — ITCR.
