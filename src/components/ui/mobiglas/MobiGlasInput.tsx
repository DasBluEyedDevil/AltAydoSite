'use client';

import React from 'react';

export interface MobiGlasInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  cornerAccents?: boolean;
  multiline?: boolean;
  rows?: number;
  inputClassName?: string;
  labelClassName?: string;
}

export default function MobiGlasInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  disabled,
  error,
  cornerAccents = false,
  multiline = false,
  rows = 4,
  className = '',
  inputClassName = '',
  labelClassName = '',
  ...inputProps
}: MobiGlasInputProps) {
  const InputComponent = multiline ? 'textarea' : 'input';

  const baseInputClasses = `
    mg-input w-full
    bg-[rgba(var(--mg-panel-dark),0.5)]
    border ${error ? 'border-[rgba(var(--mg-error),0.6)]' : 'border-[rgba(var(--mg-primary),0.2)]'}
    rounded-sm text-white
    px-4 py-2 text-sm md:text-base
    focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)]
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    ${inputClassName}
  `.trim();

  const labelClasses = `
    mg-subtitle text-xs mb-2 block tracking-wider
    text-[rgba(var(--mg-text),0.8)]
    font-quantify
    ${labelClassName}
  `.trim();

  return (
    <div className={`mg-input-group mb-4 ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-[rgba(var(--mg-error),0.9)] ml-1">*</span>}
      </label>

      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={baseInputClasses}
            aria-required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputProps.id || label.replace(/\s+/g, '-').toLowerCase()}-error` : undefined}
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
            aria-required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputProps.id || label.replace(/\s+/g, '-').toLowerCase()}-error` : undefined}
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Corner accents */}
        {cornerAccents && (
          <>
            <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[6px] h-[6px] border-r border-t border-[rgba(var(--mg-primary),0.4)] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[6px] h-[6px] border-l border-b border-[rgba(var(--mg-primary),0.4)] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[6px] h-[6px] border-r border-b border-[rgba(var(--mg-primary),0.4)] pointer-events-none"></div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${inputProps.id || label.replace(/\s+/g, '-').toLowerCase()}-error`}
          className="text-[rgba(var(--mg-error),0.9)] text-xs mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
