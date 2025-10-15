import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { fetchTasks, deleteTask } from '../store/slices/tasksSlice.js';

export default function TasksListPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (loading) return <div className="d-flex justify-content-center"><Spinner /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Tasks</h3>
        <Button as={Link} to="/tasks/new">New Task</Button>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td><Link to={`/tasks/${t.id}`}>{t.title}</Link></td>
              <td>{t.status}</td>
              <td>{t.priority}</td>
              <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
              <td className="d-flex gap-2">
                <Button as={Link} to={`/tasks/${t.id}/edit`} variant="outline-primary" size="sm">Edit</Button>
                <Button variant="outline-danger" size="sm" onClick={() => dispatch(deleteTask(t.id)).then(() => dispatch(fetchTasks()))}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
