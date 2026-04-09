/**
 * Reusable UI Components
 * Professional, accessible, and consistent UI components for the POS application
 */

import React from 'react';
import theme from '../theme/theme';

// ========================
// Button Components
// ========================

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    onClick,
    ...props
}) => {
    const baseClasses =
        'font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:outline-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:outline-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:outline-yellow-500',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:outline-blue-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500',
    };

    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

// ========================
// Card Components
// ========================

export const Card = ({ children, className = '', ...props }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 pb-4 border-b border-gray-200 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>
);

// ========================
// Input Components
// ========================

export const InputField = React.forwardRef(
    ({ label, error, required = false, className = '', ...props }, ref) => (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${error ? 'border-red-600 focus:ring-red-200' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
);

InputField.displayName = 'InputField';

export const TextArea = React.forwardRef(
    ({ label, error, required = false, rows = 4, className = '', ...props }, ref) => (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${error ? 'border-red-600 focus:ring-red-200' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
);

TextArea.displayName = 'TextArea';

export const Select = React.forwardRef(
    ({ label, error, required = false, options = [], className = '', ...props }, ref) => (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}
            <select
                ref={ref}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${error ? 'border-red-600 focus:ring-red-200' : ''
                    } ${className}`}
                {...props}
            >
                <option value="">Select an option</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
);

Select.displayName = 'Select';

// ========================
// Badge Components
// ========================

export const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
    const variantClasses = {
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`inline-block rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
};

// ========================
// Alert Components
// ========================

export const Alert = ({ children, variant = 'primary', title, onClose, className = '' }) => {
    const variantClasses = {
        primary: 'bg-blue-50 border-blue-500 text-blue-800',
        success: 'bg-green-50 border-green-500 text-green-800',
        danger: 'bg-red-50 border-red-500 text-red-800',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    };

    return (
        <div className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${variantClasses[variant]} ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    {title && <h5 className="font-semibold mb-1">{title}</h5>}
                    {children}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        aria-label="Close alert"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

// ========================
// Modal Components
// ========================

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className={`relative bg-white rounded-lg shadow-2xl z-50 w-full mx-4 ${sizeClasses[size]} animate-slide-up`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4">{children}</div>

                {/* Footer */}
                {footer && <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">{footer}</div>}
            </div>
        </div>
    );
};

// ========================
// Table Components
// ========================

export const Table = ({ children, className = '' }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className={`w-full border-collapse ${className}`}>{children}</table>
    </div>
);

export const TableHead = ({ children }) => (
    <thead className="bg-gray-100 border-b-2 border-gray-200">{children}</thead>
);

export const TableHeader = ({ children, className = '' }) => (
    <th className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${className}`}>{children}</th>
);

export const TableBody = ({ children }) => (
    <tbody className="divide-y divide-gray-200">{children}</tbody>
);

export const TableRow = ({ children, onClick, className = '' }) => (
    <tr
        className={`transition-colors duration-200 hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        {children}
    </tr>
);

export const TableCell = ({ children, className = '' }) => (
    <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

// ========================
// Loading Components
// ========================

export const Spinner = ({ size = 'md', variant = 'primary' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const colorClasses = {
        primary: 'border-blue-600 border-t-blue-200',
        secondary: 'border-gray-600 border-t-gray-200',
        success: 'border-green-600 border-t-green-200',
    };

    return (
        <div
            className={`inline-block ${sizeClasses[size]} border-4 rounded-full animate-spin ${colorClasses[variant]}`}
            role="status"
            aria-label="Loading"
        />
    );
};

export const LoadingOverlay = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-20">
            <Spinner size="lg" />
        </div>
    );
};

// ========================
// Status Indicator
// ========================

export const StatusIndicator = ({ status = 'active', label }) => {
    const statusClasses = {
        active: 'bg-green-600',
        inactive: 'bg-gray-400',
        pending: 'bg-yellow-500',
        error: 'bg-red-600',
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusClasses[status]}`} />
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </div>
    );
};

// ========================
// Empty State
// ========================

export const EmptyState = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        {icon && <div className="mb-4 text-4xl">{icon}</div>}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-600 text-center mb-4">{description}</p>}
        {action && <div>{action}</div>}
    </div>
);

export default {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    InputField,
    TextArea,
    Select,
    Badge,
    Alert,
    Modal,
    Table,
    TableHead,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    LoadingOverlay,
    StatusIndicator,
    EmptyState,
};
