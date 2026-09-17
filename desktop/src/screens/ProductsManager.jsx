import React from 'react';
import ResourceManager from '../components/ResourceManager';

const fields = [
    { name: 'barcode', label: 'Barcode', required: true, minLength: 8, createOnly: true },
    { name: 'name', label: 'Name', required: true, minLength: 2 },
    { name: 'categoryId', label: 'Category', required: true },
    { name: 'costPrice', label: 'Cost price', type: 'number', required: true, createOnly: true, private: true },
    { name: 'sellingPrice', label: 'Selling price', type: 'number', required: true },
    { name: 'stock', label: 'Initial stock', type: 'number', integer: true, default: 0, createOnly: true },
    { name: 'lowStockAlert', label: 'Low stock threshold', type: 'number', integer: true, default: 10 }
];
export default function ProductsManager({ user }) {
    return <ResourceManager title="Products" resource="products" fields={fields} user={user} categoryOptions />;
}
