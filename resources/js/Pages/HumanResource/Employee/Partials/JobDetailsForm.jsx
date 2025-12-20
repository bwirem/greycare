import React from 'react';
import { useForm } from '@inertiajs/react';

export default function JobDetailsForm({ employee, departments, positions }) {
    const activeJob = employee.jobs?.[0]; // Assuming latest job is first or singular

    const { data, setData, post, put, processing, errors } = useForm({
        department_id: activeJob?.department_id || '',
        position_id: activeJob?.position_id || '',
        hire_date: activeJob?.hire_date || '',
        contract_end_date: activeJob?.contract_end_date || '',
        basic_salary: activeJob?.basic_salary || '',
        employment_type: activeJob?.employment_type || 'Full-time',
        social_security_number: activeJob?.social_security_number || '',
        insurance_number: activeJob?.insurance_number || '',
        tax_identification_number: activeJob?.tax_identification_number || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeJob) {
            put(route('humanresurces0.jobs.update', activeJob.id));
        } else {
            post(route('humanresurces0.jobs.store', employee.id));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department*</label>
                    <select value={data.department_id} onChange={e => setData('department_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.department_id && <p className="text-red-500 text-xs">{errors.department_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Position*</label>
                    <select value={data.position_id} onChange={e => setData('position_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select Position</option>
                        {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    {errors.position_id && <p className="text-red-500 text-xs">{errors.position_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <input type="date" value={data.hire_date} onChange={e => setData('hire_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contract End Date</label>
                    <input type="date" value={data.contract_end_date} onChange={e => setData('contract_end_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                    <input type="number" step="0.01" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                    <select value={data.employment_type} onChange={e => setData('employment_type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Intern</option>
                    </select>
                </div>
            </div>

            <h4 className="text-md font-medium text-gray-800 mt-6 border-b pb-2">Statutory Numbers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">NSSF No.</label>
                    <input type="text" value={data.social_security_number} onChange={e => setData('social_security_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">NHIF/SHIF No.</label>
                    <input type="text" value={data.insurance_number} onChange={e => setData('insurance_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">KRA PIN</label>
                    <input type="text" value={data.tax_identification_number} onChange={e => setData('tax_identification_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    {activeJob ? 'Update Job Details' : 'Save Job Details'}
                </button>
            </div>
        </form>
    );
}