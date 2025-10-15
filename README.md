A **Full-Stack Task Manager** web application built with **Node.js, Express, React, Bootstrap, Vite, and PostgreSQL**.  
Implements **authentication & authorization**, **CRUD operations**, **task management**, and **file uploads** following best practices.

---
---

## 🔥 Features

### Authentication & Authorization
- User registration and login with **password hashing**.
- **JWT-based authentication** for secure API access.
- Role-based access:
  - Regular users manage only their own tasks.
  - Admins manage all users and tasks.
- Frontend routes protected based on user roles.

### Frontend (React + Bootstrap)
- Developed using **React** with **Vite**.
- State management using **Redux / Context API**.
- **React Router** for navigation.
- Responsive UI using **Bootstrap**.
- Client-side form validation.
- Efficient API consumption with loading/error handling.
- Document upload support for tasks.
- View attached documents in task details.

> **Note:** Registration functionality tested via **Postman**; frontend login and task management are fully functional.

### Backend (Node.js + Express)
- **RESTful APIs** following best practices.
- CRUD for **Users** and **Tasks**.
- Admins can create, edit, and delete any user.
- User attributes: `email`, `password`, `role`.
- Task attributes: `title`, `description`, `status`, `priority`, `dueDate`, `assignedTo`, `documents`.
- Filtering, sorting, and pagination implemented.
- File upload & download support for task attachments.

### Database (PostgreSQL)
- Dockerized PostgreSQL database with proper **schema & relationships**.
- Task and file metadata stored in DB; files stored in local storage.

### Docker & Deployment
- Fully containerized using **Docker**.
- Easy setup with `docker-compose up`.

### Testing
- Unit and integration tests for **authentication** and **task management**.
- Current coverage: ~55% (covers critical backend functionality).
- Written using **Jest**. Can be extended to achieve 80%+ coverage.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Frontend:** React, Vite, Bootstrap  
- **Database:** PostgreSQL (Docker)  
- **Authentication:** JWT, bcrypt  
- **File Uploads:** Multer  
- **Testing:** Jest  
- **API Documentation:** Postman  
- **Version Control:** Git  
- **Deployment:** Docker, Docker Compose  

---

## 📂 Project Structure

backend/
├─ src/
│ ├─ config/
│ ├─ controllers/
│ ├─ models/
│ ├─ routes/
│ ├─ middleware/
│ └─ index.js
├─ tests/
├─ uploads/
├─ Dockerfile
├─ docker-compose.yml
└─ package.json

frontend/
├─ src/
│ ├─ api/
│ ├─ assets/
│ ├─ store/
│ ├─ pages/
│ └─ App.jsx
├─ package.json
└─ vite.config.js

yaml
Copy code

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18  
- npm or yarn  
- Docker & Docker Compose  

### Clone Repository
```bash
git clone https://github.com/your-username/full-stack-task-manager.git
cd full-stack-task-manager
Backend Setup
bash
Copy code
cd backend
npm install
cp .env.example .env
# Update .env variables if needed
docker-compose up -d postgres
npm run dev
Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev
App will run at http://localhost:5173

📌 API Documentation
All API endpoints are documented in Postman:
Task Manager API Collection[Task Manager API.postman_collection.json](https://github.com/user-attachments/files/22933626/Task.Manager.API.postman_collection.json)


💡 Design Decisions
JWT Authentication: Secure user sessions & protect APIs.

Role-Based Access: Regular users vs Admin users.

Dockerized PostgreSQL: Consistent setup across environments.

Bootstrap + React: Rapid, responsive frontend.

File Metadata Storage: Database stores metadata; files in local storage.

🏆 Evaluation Highlights
Proper authentication & authorization

Clean RESTful API design

Filtering, sorting, pagination implemented

Responsive, intuitive frontend

File upload/download functionality

Unit & integration tests (critical backend functionality)

Dockerized app for easy deployment

📬 Contact
Shreya Snehal – shreyasnehal19@gmail.com

