import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  as?: 'input'
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  as: 'textarea'
}

export function FormField(props: FormFieldProps | TextareaFieldProps) {
  const { label, id, as, ...rest } = props
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {as === 'textarea' ? (
        <textarea id={id} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </div>
  )
}
