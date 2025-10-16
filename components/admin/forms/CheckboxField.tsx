import React from 'react'

interface CheckboxFieldProps {
  name: string
  label: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  helpText?: string
  disabled?: boolean
  error?: string
}

export function CheckboxField({
  name,
  label,
  checked,
  onChange,
  helpText,
  disabled = false,
  error
}: CheckboxFieldProps) {
  return (
    <div className="form-group">
      <div className="checkbox-wrapper">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked || false}
          onChange={onChange}
          disabled={disabled}
        />
        <label htmlFor={name}>{label}</label>
      </div>
      {helpText && <small className="help-text">{helpText}</small>}
      {error && <small className="error-text">{error}</small>}

      <style jsx>{`
        .form-group {
          margin-bottom: 1.5rem;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        input[type="checkbox"] {
          width: 1.125rem;
          height: 1.125rem;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
        }

        input[type="checkbox"]:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        input[type="checkbox"]:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        input[type="checkbox"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        label {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #0f172a;
          cursor: pointer;
        }

        input[type="checkbox"]:disabled + label {
          color: #9ca3af;
          cursor: not-allowed;
        }

        .help-text {
          display: block;
          margin-top: 0.25rem;
          margin-left: 1.625rem;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .error-text {
          display: block;
          margin-top: 0.25rem;
          margin-left: 1.625rem;
          font-size: 0.8125rem;
          color: #ef4444;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
