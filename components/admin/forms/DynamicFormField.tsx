import React from 'react'
import { FieldSchema } from '@/lib/admin/personFieldSchema'
import { TextField } from './TextField'
import { TextAreaField } from './TextAreaField'
import { SelectField } from './SelectField'
import { DateField } from './DateField'
import { CheckboxField } from './CheckboxField'
import { NumberField } from './NumberField'
import { ArrayField } from './ArrayField'

interface DynamicFormFieldProps {
  field: FieldSchema
  value: any
  onChange: (name: string, value: any) => void
  error?: string
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    onChange(field.name, newValue)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? null : parseFloat(e.target.value)
    onChange(field.name, newValue)
  }

  const handleArrayChange = (newValue: string[]) => {
    onChange(field.name, newValue)
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <TextField
          name={field.name}
          label={field.label}
          value={value || ''}
          onChange={handleInputChange}
          type={field.type}
          required={field.required}
          placeholder={field.placeholder}
          helpText={field.helpText}
          pattern={field.name === 'slug' ? '[a-z0-9-]+' : undefined}
          maxLength={field.maxLength}
          disabled={field.disabled}
          error={error}
        />
      )

    case 'textarea':
      return (
        <TextAreaField
          name={field.name}
          label={field.label}
          value={value || ''}
          onChange={handleInputChange}
          required={field.required}
          placeholder={field.placeholder}
          helpText={field.helpText}
          rows={field.rows}
          maxLength={field.maxLength}
          showCharCount={field.showCharCount}
          disabled={field.disabled}
          error={error}
        />
      )

    case 'select':
      return (
        <SelectField
          name={field.name}
          label={field.label}
          value={value || field.defaultValue || ''}
          onChange={handleInputChange}
          options={field.options || []}
          required={field.required}
          helpText={field.helpText}
          disabled={field.disabled}
          error={error}
        />
      )

    case 'date':
      return (
        <DateField
          name={field.name}
          label={field.label}
          value={value ? (typeof value === 'string' ? value.split('T')[0] : value) : ''}
          onChange={handleInputChange}
          required={field.required}
          helpText={field.helpText}
          disabled={field.disabled}
          error={error}
          min={typeof field.min === 'string' ? field.min : undefined}
          max={typeof field.max === 'string' ? field.max : undefined}
        />
      )

    case 'checkbox':
      return (
        <CheckboxField
          name={field.name}
          label={field.label}
          checked={value || false}
          onChange={handleInputChange}
          helpText={field.helpText}
          disabled={field.disabled}
          error={error}
        />
      )

    case 'number':
      return (
        <NumberField
          name={field.name}
          label={field.label}
          value={value}
          onChange={handleNumberChange}
          required={field.required}
          placeholder={field.placeholder}
          helpText={field.helpText}
          min={typeof field.min === 'number' ? field.min : undefined}
          max={typeof field.max === 'number' ? field.max : undefined}
          step={field.step}
          disabled={field.disabled}
          error={error}
        />
      )

    case 'array':
      return (
        <ArrayField
          name={field.name}
          label={field.label}
          value={value || []}
          onChange={handleArrayChange}
          helpText={field.helpText}
          placeholder={field.placeholder}
          disabled={field.disabled}
          error={error}
        />
      )

    default:
      return null
  }
}
