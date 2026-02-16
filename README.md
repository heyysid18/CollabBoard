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

## 🏗 Architecture & Design

### Frontend Architecture (React + Vite)
- **Component Structure**: Atomic design principles (UI components in `components/ui`, Feature components in `components/`, Pages in `pages/`).
- **State Management**:
    - **Local State**: `useState` for UI interactions (modals, inputs).
    - **Context API**: `AuthContext` for user session, `SocketContext` for real-time connection.
    - **Optimistic UI**: Immediate UI updates for drag-and-drop and state changes before server confirmation.
- **Styling**: Tailwind CSS v4 for utility-first styling with a custom dark theme palette.

### Backend Architecture (Node + Express)
- **RESTful API**: modular routes (`/auth`, `/boards`, `/tasks`, `/lists`).
- **Controller-Service Pattern**: Logic separation between route handlers and database operations.
- **Middleware**: `authMiddleware` for JWT verification, `errorMiddleware` for centralized error handling.
- **Database**: Mongoose schemas with **Compound Indexes** (`board+list`, `board+assignee`) and **Text Indexes** for high-performance search.

### 🔄 Real-Time Synchronization Strategy
- **WebSocket (Socket.io)**: Establishes a persistent bidirectional connection.
- **Room-Based Emit**: Users join board-specific rooms (`board:${boardId}`). Updates are broadcast only to users in that room.
- **Event-Driven**:
    - `task_moved`: Triggers re-fetch or local state update on client.
    - `board_updated`: generic event to refresh board data.
    - `member_added`: Real-time notification when a user invites another.

### 📈 Scalability Considerations
- **Database Indexing**: Critical fields (`boardId`, `listId`, `position`) are indexed to ensure O(log n) lookup times even with millions of tasks.
- **Horizontal Scaling**: The stateless REST API can be scaled horizontally behind a load balancer (Generic requirement: Redis would be needed for Socket.io adapter in multi-node setup).
- **Pagination**: Implemented cursor-based like pagination (skip/limit) for tasks and activity logs to prevent heavy payloads.

### ⚖️ Assumptions & Trade-offs
- **Authentication**: Usage of JWT means stateless auth, but revocation requires expiration or blacklisting (assumed 30d expiry is acceptable for MVP).
- **Drag & Drop**: Used `@hello-pangea/dnd` which is great for Kanban but has limitations on mobile.
- **Validation**: Basic validation on backend; production would require strictly typed schemas (Zod/Joi).

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

### 🔑 Demo Credentials
For quick testing, you can use:
- **Email**: `demo@example.com`
- **Password**: `password123`
*(Or simply register a new account)*

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

