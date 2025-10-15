import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { createTask, fetchTaskById, updateTask } from '../store/slices/tasksSlice.js';

const TaskSchema = Yup.object({
  title: Yup.string().required('Required'),
  description: Yup.string(),
  status: Yup.mixed().oneOf(['pending', 'in-progress', 'completed']).required('Required'),
  priority: Yup.mixed().oneOf(['low', 'medium', 'high']).required('Required'),
  dueDate: Yup.date().nullable(),
  assignedTo: Yup.number().integer().nullable(),
  documents: Yup.mixed(),
});

export default function TaskFormPage({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const { selected, loading, error } = useSelector((s) => s.tasks);

  useEffect(() => {
    if (isEdit && id) dispatch(fetchTaskById(id));
  }, [dispatch, isEdit, id]);

  const initialValues = useMemo(() => {
    if (isEdit && selected) {
      return {
        title: selected.title || '',
        description: selected.description || '',
        status: selected.status || 'pending',
        priority: selected.priority || 'medium',
        dueDate: selected.dueDate ? selected.dueDate.substring(0, 10) : '',
        assignedTo: selected.assignedTo || '',
        documents: [],
      };
    }
    return {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      documents: [],
    };
  }, [isEdit, selected]);

  if (isEdit && loading && !selected) return <div className="d-flex justify-content-center"><Spinner /></div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{isEdit ? 'Edit Task' : 'New Task'}</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={TaskSchema}
          onSubmit={async (values) => {
            const payload = { ...values };
            if (!payload.dueDate) delete payload.dueDate;
            if (!payload.assignedTo) delete payload.assignedTo;

            if (isEdit) {
              const result = await dispatch(updateTask({ id, updates: payload }));
              if (updateTask.fulfilled.match(result)) navigate(`/tasks/${id}`);
            } else {
              const result = await dispatch(createTask(payload));
              if (createTask.fulfilled.match(result)) navigate('/tasks');
            }
          }}
        >
          {({ setFieldValue, isSubmitting }) => (
            <Form noValidate>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <Field name="title" className="form-control" />
                <div className="text-danger small"><ErrorMessage name="title" /></div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <Field as="textarea" rows="3" name="description" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <Field as="select" name="status" className="form-select">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Field>
                <div className="text-danger small"><ErrorMessage name="status" /></div>
              </div>
              <div className="mb-3">
                <label className="form-label">Priority</label>
                <Field as="select" name="priority" className="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Field>
                <div className="text-danger small"><ErrorMessage name="priority" /></div>
              </div>
              <div className="mb-3">
                <label className="form-label">Due Date</label>
                <Field name="dueDate" type="date" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Assign To (User ID)</label>
                <Field name="assignedTo" type="number" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Attach PDFs (max 3)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="form-control"
                  onChange={(e) => setFieldValue('documents', Array.from(e.currentTarget.files))}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || loading}>
                {loading ? <Spinner size="sm" /> : (isEdit ? 'Save Changes' : 'Create Task')}
              </Button>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
}
