import React from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { Bell, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsModal = ({ show, onHide, notifications = [] }) => {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate('/teacher/approve-students');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
          <Bell />
          Notifications
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {notifications && notifications.length > 0 ? (
          <ListGroup variant="flush">
            {notifications.map((notification, index) => (
              <ListGroup.Item
                key={notification.id || index}
                action
                onClick={handleNotificationClick}
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">
                    <UserCheck size={16} className="me-2" style={{ color: '#1976D2' }} />
                    Pending Approval
                  </div>
                  {`${notification.studentFirstName || ''} ${notification.studentLastName || ''}`}
                </div>
                <Badge bg="primary" pill>
                  New
                </Badge>
              </ListGroup.Item>
            ))}
            {notifications.length > 0 && (
              <p className="text-center text-muted small mt-3 mb-0">Click a notification to go to the approval page.</p>
            )}
          </ListGroup>
        ) : (
          <p className="text-center text-muted py-3">You have no new notifications.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationsModal;