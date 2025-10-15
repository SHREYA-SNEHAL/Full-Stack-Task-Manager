import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

import LoginPage from './pages/LoginPage.jsx'
import TasksListPage from './pages/TasksListPage.jsx'
import TaskFormPage from './pages/TaskFormPage.jsx'
import TaskDetailPage from './pages/TaskDetailPage.jsx'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <BrowserRouter>
      <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Task Manager</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && (
                <>
                  <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
                  <Nav.Link as={Link} to="/tasks/new">New Task</Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<ProtectedRoute><TasksListPage /></ProtectedRoute>} />
          <Route path="/tasks/new" element={<ProtectedRoute><TaskFormPage mode="create" /></ProtectedRoute>} />
          <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskFormPage mode="edit" /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

export default App
