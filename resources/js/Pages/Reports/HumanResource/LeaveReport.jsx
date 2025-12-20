import React from 'react';
import AuthenticatedLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';

export default function LeaveReport({ auth, leaves, filters }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Approved Leave History</h2>}>
            <Head title="Leave Report" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded shadow">
                        <h1 className="text-xl font-bold mb-6">Leave Report - {filters.year}</h1>
                        <table className="w-full text-sm text-left border">
                            <thead className="bg-gray-100 uppercase">
                                <tr>
                                    <th className="p-3 border">Employee</th>
                                    <th className="p-3 border">Leave Type</th>
                                    <th className="p-3 border">Dates</th>
                                    <th className="p-3 border">Days</th>
                                    <th className="p-3 border">Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((l) => (
                                    <tr key={l.id} className="border-b">
                                        <td className="p-3 border font-medium">{l.employee.first_name} {l.employee.last_name}</td>
                                        <td className="p-3 border">{l.leave_type.name}</td>
                                        <td className="p-3 border">{l.start_date} to {l.end_date}</td>
                                        <td className="p-3 border text-center">{l.days_requested}</td>
                                        <td className="p-3 border text-gray-500">System Admin</td>
                                    </tr>
                                ))}
                                {leaves.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No approved leaves found for this year.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}