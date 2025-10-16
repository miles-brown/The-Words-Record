import React from 'react'

interface DateFieldProps {
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  helpText?: string
  disabled?: boolean
  error?: string
  min?: string
  max?: string
}

export function DateField({
  name,
  label,
  value,
  onChange,
  required = false,
  helpText,
  disabled = false,
  error,
  min,
  max
}: DateFieldProps) {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className={error ? 'error' : ''}
      />
      {helpText && <small className="help-text">{helpText}</small>}
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

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9375rem;
          transition: all 0.2s;
          box-sizing: border-box;
          background: white;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        input.error {
          border-color: #ef4444;
        }

        input.error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .help-text {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8125rem;
          color: #64748b;
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
