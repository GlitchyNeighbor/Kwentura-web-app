import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle, LogOut, X } from 'lucide-react';

const LogoutConfirmation = ({ 
  show, 
  onHide, 
  onConfirm, 
  userName, 
  userType = "admin", 
  isLoggingOut = false 
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={!isLoggingOut}
      dialogClassName="logout-modal"
    >
      <div className="modal-content" style={{
        border: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        width: '100%',
      }}>
        {/* Header */}
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
          border: 'none',
          padding: '32px 32px 24px 32px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo and text positioned to the left */}
          <div className="d-flex align-items-center gap-3">
            <LogOut 
              size={32} 
              color="#dc2626" 
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(220, 38, 38, 0.2))'
              }}
            />
            <h4 className="modal-title mb-0" style={{
              fontWeight: '400',
              color: '#dc2626',
              fontSize: '24px',
              letterSpacing: '-0.025em',
              textShadow: '0 1px 2px rgba(220, 38, 38, 0.1)'
            }}>
              Sign Out Confirmation
            </h4>
          </div>
          
          {/* Close button positioned to the right */}
          {!isLoggingOut && (
            <button
              type="button"
              onClick={onHide}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
              aria-label="Close"
            >
              <X size={18} color="#dc2626" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body" style={{
          padding: '32px 32px 24px 32px',
          textAlign: 'center',
          backgroundColor: '#fefefe'
        }}>
          <div style={{
            marginBottom: '24px'
          }}>
            <p style={{
              color: '#1f2937',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              lineHeight: '1.6'
            }}>
              Are you sure you want to sign out{userName ? `, ${userName}` : ''}?
            </p>
            
            <p style={{
              color: '#6b7280',
              fontSize: '15px',
              marginBottom: '0',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              You will need to log in again to access your {userType} dashboard.
            </p>
          </div>

          {/* Additional info box */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={16} color="white" />
            </div>
            <p style={{
              color: '#475569',
              fontSize: '13px',
              marginBottom: '0',
              lineHeight: '1.4',
              textAlign: 'left'
            }}>
              Your session will be terminated and any unsaved changes may be lost.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{
          border: 'none',
          padding: '0 32px 32px 32px',
          display: 'flex',
          gap: '16px',
          justifyContent: 'stretch',
          backgroundColor: '#fefefe'
        }}>
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={isLoggingOut}
            style={{
              flex: '1',
              padding: '14px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              color: '#374151',
              backgroundColor: 'white',
              transition: 'all 0.15s ease',
              height: '52px'
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isLoggingOut}
            style={{
              flex: '1',
              padding: '14px 20px',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              backgroundColor: '#ef4444',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.15s ease',
              height: '52px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.3)';
              }
            }}
          >
            {isLoggingOut ? (
              <>
                <div 
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2.5px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2.5px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
                <span>Signing Out...</span>
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </>
            ) : (
              <>
                <LogOut size={18} />
                <span>Sign Out</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Custom CSS for modal width */}
      <style jsx global>{`
        .logout-modal .modal-dialog {
          max-width: 440px !important;
          margin: 1.75rem auto;
        }
          
        @media (max-width: 576px) {
          .logout-modal .modal-dialog {
            max-width: 95% !important;
            margin: 1rem auto;
          }
        }
      `}</style>
    </Modal>
  );
};

export default LogoutConfirmation;