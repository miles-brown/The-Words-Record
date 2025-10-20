interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'warning' | 'danger' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          titleColor: '#DC2626',
          confirmBg: '#EF4444',
          confirmHover: '#DC2626',
        }
      case 'info':
        return {
          titleColor: '#2563EB',
          confirmBg: '#3B82F6',
          confirmHover: '#2563EB',
        }
      default: // warning
        return {
          titleColor: '#D97706',
          confirmBg: '#F59E0B',
          confirmHover: '#D97706',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <>
      <div className="dialog-overlay" onClick={onCancel}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3 className="dialog-title">{title}</h3>
          </div>
          <div className="dialog-body">
            <p className="dialog-message">{message}</p>
          </div>
          <div className="dialog-footer">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-confirm" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .dialog-content {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dialog-header {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #E5E7EB;
        }

        .dialog-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${styles.titleColor};
          margin: 0;
        }

        .dialog-body {
          padding: 1.5rem;
        }

        .dialog-message {
          font-size: 1rem;
          color: #374151;
          line-height: 1.6;
          margin: 0;
        }

        .dialog-footer {
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .btn-cancel,
        .btn-confirm {
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: #F3F4F6;
          color: #374151;
          border: 1px solid #E5E7EB;
        }

        .btn-cancel:hover {
          background: #E5E7EB;
        }

        .btn-confirm {
          background: ${styles.confirmBg};
          color: white;
        }

        .btn-confirm:hover {
          background: ${styles.confirmHover};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 640px) {
          .dialog-content {
            width: 95%;
            margin: 1rem;
          }

          .dialog-header {
            padding: 1rem 1rem 0.75rem;
          }

          .dialog-title {
            font-size: 1.125rem;
          }

          .dialog-body {
            padding: 1rem;
          }

          .dialog-footer {
            padding: 0.75rem 1rem 1rem;
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-confirm {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
