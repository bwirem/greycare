import React from 'react';
// FIX: Import router here
import { useForm, router } from '@inertiajs/react';

export default function BioDataForm({ employee = null }) {
    
    // Helper to format dates to YYYY-MM-DD
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        other_names: employee?.other_names || '',
        employee_code: employee?.employee_code || '',
        gender: employee?.gender || 'Male',
        // FIX: Format date
        date_of_birth: formatDate(employee?.date_of_birth),
        national_id: employee?.national_id || '',
        phone_number: employee?.phone_number || '',
        email: employee?.email || '',
        address: employee?.address || '',
        marital_status: employee?.marital_status || '',
        status: employee?.status || 'Active',
        photo: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (employee) {
            // Use router.post for update to handle file upload method spoofing
            router.post(route('humanresurces0.update', employee.id), {
                _method: 'put',
                ...data
            });
        } else {
            post(route('humanresurces0.store'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Badge/Emp ID*</label>
                    <input type="text" value={data.employee_code} onChange={e => setData('employee_code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.employee_code && <p className="text-red-500 text-xs">{errors.employee_code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name*</label>
                    <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name*</label>
                    <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    {/* Date Input */}
                    <input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">National ID</label>
                    <input type="text" value={data.national_id} onChange={e => setData('national_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Contact & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2" />
                </div>
                {employee && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option>Active</option>
                            <option>OnLeave</option>
                            <option>Terminated</option>
                            <option>Resigned</option>
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <input type="file" onChange={e => setData('photo', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {processing ? 'Saving...' : (employee ? 'Update Bio Data' : 'Create Employee')}
                </button>
            </div>
        </form>
    );
}