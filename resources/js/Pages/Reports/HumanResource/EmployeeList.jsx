import React from 'react';
import AuthenticatedLayout from '@/Layouts/HumanResourceLayout';
import { Head, router } from '@inertiajs/react';

export default function EmployeeList({ auth, employees, departments, filters, reportDate }) {
    
    const handlePrint = () => window.print();

    const handleFilterChange = (key, value) => {
        router.get(route('reports.hr.employee_list'), { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Employee Master List</h2>}>
            <Head title="Employee Report" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Controls */}
                    <div className="bg-white p-4 rounded shadow mb-6 no-print flex gap-4">
                        <select 
                            value={filters.department_id || ''} 
                            onChange={(e) => handleFilterChange('department_id', e.target.value)}
                            className="rounded border-gray-300"
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select 
                            value={filters.status || 'Active'} 
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="rounded border-gray-300"
                        >
                            <option value="Active">Active Only</option>
                            <option value="All">All Statuses</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                        <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded ml-auto">Print Report</button>
                    </div>

                    {/* Report Content */}
                    <div className="bg-white p-8 rounded shadow print:shadow-none">
                        <div className="text-center mb-6 border-b pb-4">
                            <h1 className="text-2xl font-bold uppercase">Employee Master List</h1>
                            <p className="text-sm text-gray-500">Generated on: {reportDate}</p>
                        </div>

                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 uppercase text-xs">
                                <tr>
                                    <th className="px-2 py-3">Code</th>
                                    <th className="px-2 py-3">Name</th>
                                    <th className="px-2 py-3">Department</th>
                                    <th className="px-2 py-3">Position</th>
                                    <th className="px-2 py-3">Joined</th>
                                    <th className="px-2 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr key={emp.id} className="border-b">
                                        <td className="px-2 py-2 font-mono text-xs">{emp.employee_code}</td>
                                        <td className="px-2 py-2 font-bold">{emp.first_name} {emp.last_name}</td>
                                        <td className="px-2 py-2">{emp.current_job?.department?.name || '-'}</td>
                                        <td className="px-2 py-2">{emp.current_job?.position?.title || '-'}</td>
                                        <td className="px-2 py-2">{emp.current_job?.hire_date || '-'}</td>
                                        <td className="px-2 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-xs text-gray-500">Total Records: {employees.length}</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}