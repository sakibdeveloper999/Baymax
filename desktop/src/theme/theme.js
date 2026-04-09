/**
 * Theme Configuration
 * Centralized theme constants for consistent styling across the application
 */

export const theme = {
    // Colors
    colors: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },
        secondary: {
            50: '#ecf0f1',
            100: '#bdc3c7',
            200: '#95a5a6',
            300: '#7f8c8d',
            400: '#5d6d7b',
            500: '#34495e',
            600: '#2c3e50',
            700: '#1e2833',
        },
        success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
        },
        danger: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
        },
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
        },
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        },
    },

    // Sizing
    sizing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
    },

    // Border Radius
    radius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },

    // Transitions
    transitions: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
    },

    // Z-index
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
    },

    // Font sizes
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
    },

    // Line heights
    lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
    },

    // Breakpoints
    breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
};

// Status colors
export const statusColors = {
    active: theme.colors.success[600],
    inactive: theme.colors.gray[400],
    pending: theme.colors.warning[500],
    error: theme.colors.danger[600],
    info: theme.colors.primary[600],
};

// Intent colors
export const intentColors = {
    primary: theme.colors.primary[600],
    secondary: theme.colors.secondary[600],
    success: theme.colors.success[600],
    danger: theme.colors.danger[600],
    warning: theme.colors.warning[600],
    info: theme.colors.primary[600],
};

// Typography
export const typography = {
    h1: {
        fontSize: theme.fontSize['4xl'],
        lineHeight: theme.lineHeight.tight,
        fontWeight: 700,
    },
    h2: {
        fontSize: theme.fontSize['3xl'],
        lineHeight: theme.lineHeight.tight,
        fontWeight: 700,
    },
    h3: {
        fontSize: theme.fontSize['2xl'],
        lineHeight: theme.lineHeight.tight,
        fontWeight: 600,
    },
    h4: {
        fontSize: theme.fontSize.xl,
        lineHeight: theme.lineHeight.tight,
        fontWeight: 600,
    },
    h5: {
        fontSize: theme.fontSize.lg,
        lineHeight: theme.lineHeight.tight,
        fontWeight: 600,
    },
    h6: {
        fontSize: theme.fontSize.base,
        lineHeight: theme.lineHeight.tight,
        fontWeight: 600,
    },
    body: {
        fontSize: theme.fontSize.base,
        lineHeight: theme.lineHeight.normal,
    },
    small: {
        fontSize: theme.fontSize.sm,
        lineHeight: theme.lineHeight.normal,
    },
};

export default theme;
