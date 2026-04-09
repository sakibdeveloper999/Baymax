/**
 * Styling Examples & Common Patterns
 * This file demonstrates how to use the new styling system effectively
 */

import React, { useState } from 'react';
import {
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
    EmptyState,
    StatusIndicator,
} from '@/components/UIComponents';
import { classNames, buttonVariants } from '@/styles/styleUtils';
import theme from '@/theme/theme';

// ========================
// Example 1: Form with Validation
// ========================

export function FormExample() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.category) newErrors.category = 'Category is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setShowSuccess(true);
            setFormData({ name: '', email: '', category: '', message: '' });
            setTimeout(() => setShowSuccess(false), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <h3 className="text-lg font-semibold">Contact Form</h3>
            </CardHeader>

            <CardBody className="space-y-4">
                {showSuccess && (
                    <Alert variant="success" title="Success!">
                        Your message has been sent successfully.
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                        placeholder="Enter your name"
                    />

                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        placeholder="Enter your email"
                    />

                    <Select
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        error={errors.category}
                        required
                        options={[
                            { value: 'sales', label: 'Sales' },
                            { value: 'support', label: 'Support' },
                            { value: 'feedback', label: 'Feedback' },
                        ]}
                    />

                    <TextArea
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Enter your message"
                        rows={4}
                    />

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading && <Spinner size="sm" className="mr-2" />}
                            {isLoading ? 'Sending...' : 'Send'}
                        </Button>
                        <Button
                            type="reset"
                            variant="ghost"
                            onClick={() => setFormData({ name: '', email: '', category: '', message: '' })}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}

// ========================
// Example 2: Data Table with Actions
// ========================

export function TableExample() {
    const [items, setItems] = useState([
        { id: 1, name: 'Product A', price: 29.99, status: 'active' },
        { id: 2, name: 'Product B', price: 49.99, status: 'inactive' },
        { id: 3, name: 'Product C', price: 39.99, status: 'pending' },
    ]);
    const [selectedId, setSelectedId] = useState(null);

    const getStatusBadge = (status) => {
        const variants = {
            active: 'success',
            inactive: 'gray',
            pending: 'warning',
        };
        const labels = {
            active: 'Active',
            inactive: 'Inactive',
            pending: 'Pending',
        };
        return (
            <Badge variant={variants[status]}>
                {labels[status]}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Products</h3>
                    <Button variant="primary" size="sm">
                        Add Product
                    </Button>
                </div>
            </CardHeader>

            <CardBody>
                {items.length === 0 ? (
                    <EmptyState
                        icon="📦"
                        title="No products found"
                        description="Create your first product to get started"
                        action={
                            <Button variant="primary">
                                Add Product
                            </Button>
                        }
                    />
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>ID</TableHeader>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Price</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={classNames(
                                        selectedId === item.id && 'bg-blue-50'
                                    )}
                                >
                                    <TableCell>#{item.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>${item.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(item.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Edit', item.id);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardBody>
        </Card>
    );
}

// ========================
// Example 3: Modal with Confirmation
// ========================

export function ModalExample() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button
                variant="danger"
                onClick={() => setIsOpen(true)}
            >
                Delete Item
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Confirm Deletion"
                size="md"
                footer={
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Spinner size="sm" className="mr-2" />}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                }
            >
                <p className="text-gray-600">
                    Are you sure you want to delete this item? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
}

// ========================
// Example 4: Dashboard Cards
// ========================

export function DashboardExample() {
    const stats = [
        { label: 'Total Orders', value: '1,234', icon: '📦', trend: '+5%' },
        { label: 'Revenue', value: '$12,456', icon: '💰', trend: '+12%' },
        { label: 'Customers', value: '456', icon: '👥', trend: '+8%' },
        { label: 'Growth', value: '23%', icon: '📈', trend: '+3%' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardBody>
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-3xl">{stat.icon}</span>
                            <Badge variant="success" size="sm">
                                {stat.trend}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {stat.value}
                        </p>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

// ========================
// Example 5: Status Display
// ========================

export function StatusExample() {
    const orders = [
        { id: 1, status: 'active', label: 'Processing' },
        { id: 2, status: 'pending', label: 'Pending' },
        { id: 3, status: 'inactive', label: 'Cancelled' },
        { id: 4, status: 'error', label: 'Error' },
    ];

    // Handle missing error status in components
    const errorStatus = {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        error: 'Error',
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">Order Status</h3>
            </CardHeader>

            <CardBody className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                            Order #{order.id}
                        </span>
                        <StatusIndicator status={order.status} label={order.label} />
                    </div>
                ))}
            </CardBody>
        </Card>
    );
}

// ========================
// Example 6: Responsive Layout
// ========================

export function ResponsiveLayoutExample() {
    return (
        <div className="space-y-6">
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item}>
                        <CardBody>
                            <h4 className="text-lg font-semibold mb-2">
                                Item {item}
                            </h4>
                            <p className="text-sm text-gray-600">
                                This card adjusts based on screen size
                            </p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Responsive Flex */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Card>
                        <CardBody>Side 1</CardBody>
                    </Card>
                </div>
                <div className="flex-1">
                    <Card>
                        <CardBody>Side 2</CardBody>
                    </Card>
                </div>
            </div>

            {/* Responsive Typography */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                Responsive Heading
            </h1>
        </div>
    );
}

// ========================
// Example 7: Loading States
// ========================

export function LoadingExample() {
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([]);

    const handleFetch = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setItems([
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">Items</h3>
            </CardHeader>

            <CardBody>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner size="lg" variant="primary" />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        icon="🔍"
                        title="No items loaded"
                        description="Click the button to fetch items"
                        action={
                            <Button variant="primary" onClick={handleFetch}>
                                Fetch Items
                            </Button>
                        }
                    />
                ) : (
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="p-2 bg-gray-50 rounded text-sm"
                            >
                                {item.name}
                            </li>
                        ))}
                    </ul>
                )}
            </CardBody>

            <CardFooter>
                <Button
                    variant="primary"
                    onClick={handleFetch}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Loading...' : 'Fetch Items'}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default {
    FormExample,
    TableExample,
    ModalExample,
    DashboardExample,
    StatusExample,
    ResponsiveLayoutExample,
    LoadingExample,
};
