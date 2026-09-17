import React from 'react';
import ResourceManager from '../components/ResourceManager';

const fields = [
    { name: 'name', label: 'Name', required: true, minLength: 2 },
    { name: 'company', label: 'Company' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'openingBalance', label: 'Opening balance', type: 'number', default: 0, createOnly: true, integer: true }
];
export default function SuppliersManager({ user }) {
    return <ResourceManager title="Suppliers" resource="suppliers" fields={fields} user={user} />;
}
