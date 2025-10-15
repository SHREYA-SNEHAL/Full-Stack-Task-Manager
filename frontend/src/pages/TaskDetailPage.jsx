import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';
import { API_BASE_URL } from '../api/client.js';
import { fetchTaskById } from '../store/slices/tasksSlice.js';

export default function TaskDetailPage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { selected, loading, error } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTaskById(id));
  }, [dispatch, id]);

  if (loading && !selected) return <div className="d-flex justify-content-center"><Spinner /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!selected) return null;

  const docs = Array.isArray(selected.documents) ? selected.documents : [];

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>Task #{selected.id}: {selected.title}</Card.Title>
          <Button as={Link} to={`/tasks/${id}/edit`} variant="primary">Edit</Button>
        </div>
        <Card.Subtitle className="mb-2 text-muted">Status: {selected.status} • Priority: {selected.priority}</Card.Subtitle>
        <Card.Text>{selected.description || 'No description'}</Card.Text>
        <div className="mb-2">Due: {selected.dueDate ? new Date(selected.dueDate).toLocaleDateString() : '-'}</div>
        <div className="mb-3">Assigned To: {selected.assignedTo ?? '-'}</div>
        <h6>Attached Documents</h6>
        {docs.length === 0 ? (
          <div className="text-muted">No documents attached.</div>
        ) : (
          <ListGroup>
            {docs.map((filename) => (
              <ListGroup.Item key={filename}>
                <a href={`${API_BASE_URL}/uploads/${filename}`} target="_blank" rel="noreferrer">{filename}</a>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}
