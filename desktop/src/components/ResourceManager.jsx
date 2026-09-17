import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../config/api';

export default function ResourceManager({ title, resource, fields, user, categoryOptions = false }) {
    const [rows, setRows] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const canEdit = ['owner', 'manager'].includes(user?.role);
    const describeError = error => typeof error.response?.data?.error === 'string' ? error.response.data.error : error.response?.data?.error?.message || error.message;
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await apiClient.get(`/api/${resource}`, { params: { page, limit: 25, search } });
            setRows(resource === 'categories' && search ? data.data.filter(row => row.name.toLowerCase().includes(search.toLowerCase())) : data.data);
            setPages(Math.max(1, data.pagination?.pages || 1));
        } catch (error) { setError(describeError(error)); setRows([]); }
        finally { setLoading(false); }
    }, [resource, page, search]);
    useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [load]);
    useEffect(() => {
        if (categoryOptions) apiClient.get('/api/categories').then(({ data }) => setCategories(data.data)).catch(error => setError(describeError(error)));
    }, [categoryOptions]);
    const openForm = row => {
        setEditing(row?._id || null);
        setError('');
        setForm(Object.fromEntries(fields.map(field => [field.name, row?.[field.name]?._id ?? row?.[field.name] ?? field.default ?? ''])));
    };
    const save = async event => {
        event.preventDefault(); setSaving(true); setError('');
        try {
            const payload = {};
            fields.filter(field => !editing || !field.createOnly).forEach(field => {
                if (form[field.name] !== '') payload[field.name] = field.type === 'number' ? Number(form[field.name]) : form[field.name];
            });
            if (editing) await apiClient.put(`/api/${resource}/${editing}`, payload);
            else await apiClient.post(`/api/${resource}`, payload);
            setForm(null); await load();
        } catch (error) { setError(describeError(error)); }
        finally { setSaving(false); }
    };
    const remove = async row => {
        if (!window.confirm(`Remove ${row.name}?`)) return;
        setSaving(true); setError('');
        try { await apiClient.delete(`/api/${resource}/${row._id}`); await load(); }
        catch (error) { setError(describeError(error)); }
        finally { setSaving(false); }
    };
    const visibleFields = fields.filter(field => !field.private || canEdit);
    return <section className="p-6 space-y-5">
        <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">{title}</h1>{canEdit && <button className="btn-primary" onClick={() => openForm(null)}>Add {title === 'Categories' ? 'category' : resource.slice(0, -1)}</button>}</div>
        {error && <p role="alert" className="alert-danger p-3">{error}</p>}
        {form && <form onSubmit={save} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.filter(field => !editing || !field.createOnly).map(field => <label key={field.name} className="block">{field.label}
                {field.name === 'categoryId' ? <select required value={form[field.name]} onChange={event => setForm({ ...form, [field.name]: event.target.value })}><option value="">Select category</option>{categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
                    : <input required={field.required} type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} step={field.integer ? 1 : field.type === 'number' ? '0.01' : undefined} minLength={field.minLength} value={form[field.name]} onChange={event => setForm({ ...form, [field.name]: event.target.value })} />}
            </label>)}
            {categoryOptions && !categories.length && <p>Create a category from the Categories screen first.</p>}
            <button disabled={saving} type="submit" className="btn-success">{saving ? 'Saving...' : 'Save'}</button><button disabled={saving} type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button>
        </form>}
        <input aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
        {loading ? <p role="status">Loading...</p> : <div className="bg-white border rounded-lg overflow-x-auto"><table><thead><tr>{visibleFields.map(field => <th key={field.name}>{field.label}</th>)}{canEdit && <th>Actions</th>}</tr></thead><tbody>
            {rows.map(row => <tr key={row._id}>{visibleFields.map(field => <td key={field.name}>{row[field.name]?.name ?? row[field.name] ?? '?'}</td>)}{canEdit && <td><button disabled={saving} className="text-blue-700 mr-3" onClick={() => openForm(row)}>Edit</button>{user.role === 'owner' && <button disabled={saving} className="text-red-700" onClick={() => remove(row)}>Remove</button>}</td>}</tr>)}
            {!rows.length && <tr><td colSpan={visibleFields.length + 1}>No records found.</td></tr>}
        </tbody></table></div>}
        <div className="flex gap-3 items-center"><button disabled={page <= 1 || loading} className="btn-outline" onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages || loading} className="btn-outline" onClick={() => setPage(page + 1)}>Next</button></div>
    </section>;
}
