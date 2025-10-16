import React from 'react'

interface TextAreaFieldProps {
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  placeholder?: string
  helpText?: string
  rows?: number
  maxLength?: number
  disabled?: boolean
  error?: string
  showCharCount?: boolean
}

export function TextAreaField({
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  helpText,
  rows = 4,
  maxLength,
  disabled = false,
  error,
  showCharCount = false
}: TextAreaFieldProps) {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={error ? 'error' : ''}
      />
      {helpText && <small className="help-text">{helpText}</small>}
      {showCharCount && maxLength && (
        <small className="char-count">
          {(value || '').length}/{maxLength} characters
        </small>
      )}
      {error && <small className="error-text">{error}</small>}

      <style jsx>{`
        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
        }

        .required {
          color: #ef4444;
        }

        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9375rem;
          transition: all 0.2s;
          box-sizing: border-box;
          resize: vertical;
          font-family: inherit;
          line-height: 1.6;
          background: white;
        }

        textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        textarea:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        textarea.error {
          border-color: #ef4444;
        }

        textarea.error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .help-text {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .char-count {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8125rem;
          color: #64748b;
          text-align: right;
        }

        .error-text {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8125rem;
          color: #ef4444;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
