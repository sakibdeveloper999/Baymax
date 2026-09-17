import React from 'react';
import ResourceManager from '../components/ResourceManager';

const fields = [
    { name: 'name', label: 'Name', required: true, minLength: 2 },
    { name: 'description', label: 'Description' }
];
export default function CategoriesManager({ user }) {
    return <ResourceManager title="Categories" resource="categories" fields={fields} user={user} />;
}
