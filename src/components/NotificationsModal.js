import React, { useEffect } from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { Bell, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsModal = ({ show, onHide, notifications = [] }) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification) return;
    if (notification.type === 'student_pending') {
      navigate('/teacher/approve-students');
    } else if (notification.type === 'teacher_pending') {
      navigate('/admin/approve-teachers');
    } else {
      
      navigate('/home');
    }
    onHide();
  };

  useEffect(() => {
    if (show) {
      
      
      
      console.log('NotificationsModal opened. notifications:', notifications);
    }
  }, [show, notifications]);

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
                onClick={() => handleNotificationClick(notification)}
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold d-flex align-items-center" style={{ gap: '8px' }}>
                    <UserCheck size={16} style={{ color: '#1976D2' }} />
                    {notification.type === 'student_pending' ? 'Student Pending Approval' : 'Teacher Pending Approval'}
                  </div>
                  <div>
                    {(notification.type === 'student_pending' && (`${notification.data?.studentFirstName || notification.data?.firstName || ''} ${notification.data?.studentLastName || notification.data?.lastName || ''}`.trim())) ||
                      (notification.type === 'teacher_pending' && (`${notification.data?.firstName || ''} ${notification.data?.lastName || ''}`.trim())) ||
                      notification.title ||
                      'Pending Approval'}
                  </div>
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