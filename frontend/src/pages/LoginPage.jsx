import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { login, clearAuthError } from '../store/slices/authSlice.js';

const LoginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
});
export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) navigate('/tasks');
  }, [token, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);
  return (
    <div className="d-flex justify-content-center">
      <Card style={{ maxWidth: 420 }} className="w-100">
        <Card.Body>
          <Card.Title>Login</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values) => {
              const result = await dispatch(login(values));
              if (login.fulfilled.match(result)) {
                navigate('/tasks');
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <Field name="email" type="email" className="form-control" />
                  <div className="text-danger small"><ErrorMessage name="email" /></div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <Field name="password" type="password" className="form-control" />
                  <div className="text-danger small"><ErrorMessage name="password" /></div>
                  </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <Field name="password" type="password" className="form-control" />
                  <div className="text-danger small"><ErrorMessage name="password" /></div>
                </div>
                <Button type="submit" disabled={loading || isSubmitting}>
                  {loading ? <Spinner size="sm" /> : 'Login'}
                </Button>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
}