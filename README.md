# CollabBoard - Real-Time Task Collaboration Platform

A full-stack MERN application for real-time task management, inspired by Linear, Trello, and Notion. Built with performance, scalability, and collaboration in mind.

## 🚀 Key Features

### 🛠 Core Fundamentals
- **Authentication**: Secure JWT-based signup and login with persistent sessions.
- **Workspaces**: Create and manage multiple boards for different projects.
- **Kanban Board**: Drag-and-drop tasks across lists smooth animations (`@hello-pangea/dnd`).

### 🤝 Real-Time Collaboration (New!)
- **Live Updates**: Instant synchronization across all users using **Socket.io**.
- **Task Assignment**: Assign tasks to specific board members with avatar indicators.
- **Collaborative Boards**: Invite other users to your board via email.
- **Shared Dashboard**: Distinct views for "My Boards" and "Shared With Me".
- **Real-Time Notifications**: Get notified instantly when you are invited to a board.

### 📊 Advanced Productivity
- **Activity History**: detailed audit log tracking every action (create, move, update, delete).
- **Search & Filter**: Server-side search with pagination to find tasks quickly across boards.
- **Dark Mode**: Premium "SaaS-like" dark UI with glassmorphism effects and responsiveness.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v3, Class Variance Authority (CVA), Lucide Icons
- **State & Interactions**: Context API, Axios, Hello Pangea DnD
- **Real-Time**: Socket.io Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: Socket.io
- **Auth**: JSON Web Tokens (JWT), Bcrypt

---

## 🏗 Architecture

### Database Schema
- **User**: `username`, `email`, `password`
- **Board**: `title`, `user` (owner), `lists` (ref)
- **BoardMember**: `board` (ref), `user` (ref), `role` (owner/member)
- **List**: `title`, `board` (ref), `tasks` (ref)
- **Task**: `title`, `description`, `priority`, `assignees` (ref users), `list` (ref)
- **Activity**: `user`, `board`, `action`, `details`, `targetId`

### Key API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create account |
| **POST** | `/api/auth/login` | Authenticate user |
| **GET** | `/api/boards` | Fetch Owned & Shared boards |
| **POST** | `/api/boards/:id/invite` | Invite user by email |
| **PATCH** | `/api/tasks/:id/assign` | Assign members to task |
| **PUT** | `/api/tasks/:id` | Move/Update task (Socket emission) |

---

## ⚡️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/heyysid18/CollabBoard.git
cd CollabBoard
```

### 2. Install Dependencies
Run this in the root directory (recursively installs for client/server):
```bash
npm install
# OR manually:
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Variables
Create `backend/.env` file:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/collabboard
JWT_SECRET=your_super_secret_key_change_me
```

### 4. Run Locally
Start both backend and frontend concurrently:
```bash
# From root directory
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5001`

### 5. Running Tests
Verified backend API tests using Jest:
```bash
cd backend
npm test
```

---

## 🔮 Future Improvements
- [ ] Email notifications (SendGrid/Nodemailer)
- [ ] File attachments (AWS S3)
- [ ] Rich text editor for task descriptions
- [ ] User avatars upload

