/**
 * Style Utilities
 * Helper functions and utilities for consistent styling throughout the application
 */

/**
 * Combines classNames conditionally
 * @param {...any} classes - Classes to combine
 * @returns {string} Combined class string
 */
export const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

/**
 * Creates responsive Tailwind classes
 * @param {Object} breakpoints - Responsive values
 * @returns {string} Responsive class string
 */
export const responsive = (breakpoints) => {
    const classes = [];
    Object.entries(breakpoints).forEach(([bp, className]) => {
        if (bp === 'base') {
            classes.push(className);
        } else if (bp === 'sm') {
            classes.push(`sm:${className}`);
        } else if (bp === 'md') {
            classes.push(`md:${className}`);
        } else if (bp === 'lg') {
            classes.push(`lg:${className}`);
        } else if (bp === 'xl') {
            classes.push(`xl:${className}`);
        } else if (bp === '2xl') {
            classes.push(`2xl:${className}`);
        }
    });
    return classes.join(' ');
};

/**
 * Creates state-based classes
 * @param {Object} states - State and corresponding class
 * @returns {string} State-based class string
 */
export const stateClasses = (states) => {
    const classes = [];
    Object.entries(states).forEach(([state, isActive]) => {
        if (isActive) {
            classes.push(state);
        }
    });
    return classes.join(' ');
};

/**
 * Color utilities
 */
export const colors = {
    // Primary shades
    primary: {
        light: 'bg-blue-100 text-blue-900',
        base: 'bg-blue-500 text-white',
        dark: 'bg-blue-900 text-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-600',
    },
    // Success states
    success: {
        light: 'bg-green-100 text-green-900',
        base: 'bg-green-500 text-white',
        dark: 'bg-green-900 text-green-100',
        border: 'border-green-500',
        text: 'text-green-600',
    },
    // Danger states
    danger: {
        light: 'bg-red-100 text-red-900',
        base: 'bg-red-500 text-white',
        dark: 'bg-red-900 text-red-100',
        border: 'border-red-500',
        text: 'text-red-600',
    },
    // Warning states
    warning: {
        light: 'bg-yellow-100 text-yellow-900',
        base: 'bg-yellow-500 text-white',
        dark: 'bg-yellow-900 text-yellow-100',
        border: 'border-yellow-500',
        text: 'text-yellow-600',
    },
};

/**
 * Animation classes
 */
export const animations = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    pulseSoft: 'animate-pulse-soft',
    glow: 'animate-glow',
};

/**
 * Shadow utilities
 */
export const shadows = {
    sm: 'shadow-sm',
    base: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
    none: 'shadow-none',
};

/**
 * Spacing utilities
 */
export const spacing = {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
};

/**
 * Button base classes
 */
export const buttonBase = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';

/**
 * Button size classes
 */
export const buttonSizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
};

/**
 * Button variant classes
 */
export const buttonVariants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-500 active:bg-blue-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:outline-gray-500 active:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:outline-green-500 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500 active:bg-red-800',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:outline-yellow-500 active:bg-yellow-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:outline-blue-600 active:bg-blue-100',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500 active:bg-gray-200',
};

/**
 * Card base classes
 */
export const cardBase = 'bg-white rounded-lg transition-all duration-300';

/**
 * Card shadow levels
 */
export const cardShadows = {
    sm: 'shadow-sm hover:shadow-md',
    base: 'shadow-md hover:shadow-lg hover:-translate-y-0.5',
    lg: 'shadow-lg hover:shadow-xl hover:-translate-y-1',
};

/**
 * Input field base classes
 */
export const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed';

/**
 * Input field error classes
 */
export const inputError = 'border-red-600 focus:ring-red-200 focus:border-red-600';

/**
 * Badge base classes
 */
export const badgeBase = 'inline-block px-3 py-1 rounded-full text-sm font-semibold';

/**
 * Badge size classes
 */
export const badgeSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
};

/**
 * Badge variant classes
 */
export const badgeVariants = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
};

/**
 * Table header classes
 */
export const tableHeaderClasses = 'px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100 border-b-2 border-gray-200';

/**
 * Table cell classes
 */
export const tableCellClasses = 'px-4 py-3 text-sm text-gray-700 border-b border-gray-200';

/**
 * Table row hover classes
 */
export const tableRowHoverClasses = 'hover:bg-gray-50 transition-colors duration-200 cursor-pointer';

/**
 * Modal base classes
 */
export const modalBackdrop = 'fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200';

export const modalContent = 'fixed inset-0 z-50 flex items-center justify-center';

export const modalBox = 'relative bg-white rounded-lg shadow-2xl z-50 w-full mx-4 animate-slide-up';

/**
 * Modal size classes
 */
export const modalSizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
};

/**
 * Alert base classes
 */
export const alertBase = 'p-4 rounded-lg border-l-4 transition-all duration-200';

/**
 * Alert variant classes
 */
export const alertVariants = {
    primary: 'bg-blue-50 border-blue-500 text-blue-800',
    success: 'bg-green-50 border-green-500 text-green-800',
    danger: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
};

/**
 * Loading spinner base classes
 */
export const spinnerBase = 'inline-block border-4 rounded-full animate-spin';

/**
 * Spinner size classes
 */
export const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};

/**
 * Spinner color classes
 */
export const spinnerColors = {
    primary: 'border-blue-600 border-t-blue-200',
    secondary: 'border-gray-600 border-t-gray-200',
    success: 'border-green-600 border-t-green-200',
    danger: 'border-red-600 border-t-red-200',
};

/**
 * Status indicator classes
 */
export const statusIndicatorColors = {
    active: 'bg-green-600',
    inactive: 'bg-gray-400',
    pending: 'bg-yellow-500',
    error: 'bg-red-600',
};

/**
 * Layout utilities
 */
export const layouts = {
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
    flexCol: 'flex flex-col',
    grid2: 'grid grid-cols-2 gap-4',
    grid3: 'grid grid-cols-3 gap-4',
    grid4: 'grid grid-cols-4 gap-4',
};

/**
 * Text truncation
 */
export const textTruncate = 'truncate';

export const textEllipsis = 'overflow-hidden text-overflow-ellipsis whitespace-nowrap';

/**
 * Line clamping
 */
export const lineClamp = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
};

/**
 * Flex center alignment
 */
export const flexCenter = 'flex items-center justify-center';

/**
 * Flex between alignment
 */
export const flexBetween = 'flex items-center justify-between';

/**
 * Create a styled component class string
 * @param {Object} config - Configuration object with variant, size, etc.
 * @returns {string} Combined class string
 */
export const createComponentClass = (config) => {
    const { base, variant, size, state, custom = '' } = config;
    return classNames(base, variant, size, state, custom);
};

export default {
    classNames,
    responsive,
    stateClasses,
    colors,
    animations,
    shadows,
    spacing,
    buttonBase,
    buttonSizes,
    buttonVariants,
    cardBase,
    cardShadows,
    inputBase,
    inputError,
    badgeBase,
    badgeSizes,
    badgeVariants,
    tableHeaderClasses,
    tableCellClasses,
    tableRowHoverClasses,
    modalBackdrop,
    modalContent,
    modalBox,
    modalSizes,
    alertBase,
    alertVariants,
    spinnerBase,
    spinnerSizes,
    spinnerColors,
    statusIndicatorColors,
    layouts,
    textTruncate,
    textEllipsis,
    lineClamp,
    flexCenter,
    flexBetween,
    createComponentClass,
};
