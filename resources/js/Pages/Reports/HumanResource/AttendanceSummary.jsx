import React from 'react';
import AuthenticatedLayout from '@/Layouts/HumanResourceLayout';
import { Head, router } from '@inertiajs/react';

export default function AttendanceSummary({ auth, attendance, stats, filters }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Daily Attendance Log</h2>}>
            <Head title="Attendance" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-4 rounded shadow mb-6 no-print flex gap-4 items-center">
                        <input 
                            type="date" 
                            value={filters.date} 
                            onChange={(e) => router.get(route('reports.hr.attendance_summary'), { date: e.target.value })}
                            className="rounded border-gray-300"
                        />
                        <div className="ml-auto flex gap-4 text-sm font-bold">
                            <span className="text-green-600">Present: {stats.present}</span>
                            <span className="text-red-600">Absent: {stats.absent}</span>
                            <span className="text-yellow-600">Late: {stats.late}</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded shadow">
                        <table className="w-full text-sm text-left border">
                            <thead className="bg-gray-100 uppercase">
                                <tr>
                                    <th className="p-3 border">Employee</th>
                                    <th className="p-3 border">Department</th>
                                    <th className="p-3 border">Time In</th>
                                    <th className="p-3 border">Time Out</th>
                                    <th className="p-3 border">Hours</th>
                                    <th className="p-3 border">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((a) => (
                                    <tr key={a.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 border font-medium">{a.employee.first_name} {a.employee.last_name}</td>
                                        <td className="p-3 border">{a.employee.current_job?.department?.name || '-'}</td>
                                        <td className="p-3 border text-green-700">{a.clock_in ? new Date(a.clock_in).toLocaleTimeString() : '-'}</td>
                                        <td className="p-3 border text-orange-700">{a.clock_out ? new Date(a.clock_out).toLocaleTimeString() : '-'}</td>
                                        <td className="p-3 border font-bold">{a.hours_worked}</td>
                                        <td className="p-3 border">
                                            <span className={`px-2 py-1 rounded text-xs ${a.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}