import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Form, Button, Alert, Container, Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com")) {
      setError("Email must end with @gmail.com");
      return;
    }
    setSending(true);
    setMessage("");
    setError("");
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err) {
      setError("Failed to send reset email. Please check your email address.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Container className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <Row>
        <Col>
          <h2>Forgot Password</h2>
          <p>Enter your email address to receive a password reset link.</p>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={sending || !email.endsWith("@gmail.com")}>
              {sending ? <Spinner animation="border" size="sm" /> : "Send Reset Link"}
            </Button>
          </Form>
          <div className="mt-3">
            <Link to="/login">Back to Login</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;