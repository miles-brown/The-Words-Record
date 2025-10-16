import React, { useState } from 'react'

interface ArrayFieldProps {
  name: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  helpText?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

export function ArrayField({
  name,
  label,
  value,
  onChange,
  helpText,
  placeholder = 'Add item...',
  disabled = false,
  error
}: ArrayFieldProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...(value || []), inputValue.trim()])
      setInputValue('')
    }
  }

  const handleRemove = (index: number) => {
    const newValue = [...(value || [])]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>

      <div className="array-field-wrapper">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !inputValue.trim()}
            className="add-btn"
          >
            Add
          </button>
        </div>

        {value && value.length > 0 && (
          <ul className="items-list">
            {value.map((item, index) => (
              <li key={index}>
                <span className="item-text">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="remove-btn"
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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

        .array-field-wrapper {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.75rem;
          background: #fafbfc;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        input {
          flex: 1;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
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

        .add-btn {
          padding: 0.625rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .items-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .items-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .item-text {
          flex: 1;
          font-size: 0.875rem;
          color: #0f172a;
        }

        .remove-btn {
          padding: 0.25rem 0.5rem;
          background: transparent;
          border: none;
          color: #dc2626;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1;
        }

        .remove-btn:hover:not(:disabled) {
          background: #fee2e2;
          border-radius: 4px;
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .help-text {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .error-text {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8125rem;
          color: #ef4444;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
