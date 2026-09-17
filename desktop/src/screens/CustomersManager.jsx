import React from 'react';
import ResourceManager from '../components/ResourceManager';

const fields = [
    { name: 'name', label: 'Name', required: true, minLength: 2 },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'creditLimit', label: 'Credit limit', type: 'number', default: 0 }
];
export default function CustomersManager({ user }) {
    return <ResourceManager title="Customers" resource="customers" fields={fields} user={user} />;
}
