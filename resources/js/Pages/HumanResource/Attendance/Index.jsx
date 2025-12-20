import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faPlus, faUpload, faClock, 
    faCheckCircle, faExclamationCircle, faTimesCircle 
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, attendance, filters, stats, flash }) {
    const { data, setData } = useForm({ 
        search: filters.search || "",
        date: filters.date || new Date().toISOString().split('T')[0],
        employee_code: "" // For Quick Clock In/Out
    });
    
    // Quick Action Form Handling
    const { data: quickData, setData: setQuickData, post: quickPost, reset: quickReset, errors: quickErrors } = useForm({
        employee_code: ''
    });

    const handleDateChange = (e) => {
        setData('date', e.target.value);
        router.get(route("humanresurces1.index"), { 
            date: e.target.value, 
            search: data.search 
        }, { preserveState: true, replace: true });
    };

    const handleClockIn = (e) => {
        e.preventDefault();
        quickPost(route('humanresurces1.clock_in'), { onSuccess: () => quickReset() });
    };

    const handleClockOut = (e) => {
        e.preventDefault();
        quickPost(route('humanresurces1.clock_out'), { onSuccess: () => quickReset() });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Daily Attendance</h2>}>
            <Head title="Attendance" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="text-gray-500 text-sm">Present Today</div>
                            <div className="text-2xl font-bold">{stats.present}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                            <div className="text-gray-500 text-sm">Late Arrivals</div>
                            <div className="text-2xl font-bold">{stats.late}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                            <div className="text-gray-500 text-sm">Recorded Absent</div>
                            <div className="text-2xl font-bold">{stats.absent}</div>
                        </div>
                    </div>

                    {/* Quick Clock In/Out (Kiosk Mode Simulation) */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
                        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-2" /> Quick Action
                        </h3>
                        <form className="flex flex-col md:flex-row gap-4">
                            <input 
                                type="text" 
                                placeholder="Enter Badge/Employee Code" 
                                value={quickData.employee_code}
                                onChange={e => setQuickData('employee_code', e.target.value)}
                                className="rounded-md border-blue-300 w-full md:w-64"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleClockIn} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium">Clock In</button>
                                <button onClick={handleClockOut} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium">Clock Out</button>
                            </div>
                        </form>
                        {quickErrors.employee_code && <p className="text-red-500 text-sm mt-2">{quickErrors.employee_code}</p>}
                        {flash?.success && <p className="text-green-600 text-sm mt-2 font-medium">{flash.success}</p>}
                        {flash?.error && <p className="text-red-600 text-sm mt-2 font-medium">{flash.error}</p>}
                    </div>

                    {/* Main Table Section */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={data.date} 
                                        onChange={handleDateChange} 
                                        className="rounded-md border-gray-300"
                                    />
                                </div>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search Employee..." 
                                        value={data.search} 
                                        onChange={e => {
                                            setData("search", e.target.value);
                                            // Optional: Add debounce here for search
                                        }} 
                                        className="pl-10 rounded-md border-gray-300 w-48" 
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("humanresurces1.create")} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Manual Entry
                                </Link>
                                <Link href={route("humanresurces1.import.show")} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    <FontAwesomeIcon icon={faUpload} className="mr-2" /> Import
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Time In</th>
                                        <th className="px-4 py-3 text-left">Time Out</th>
                                        <th className="px-4 py-3 text-left">Hours</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {attendance.data.length > 0 ? (
                                        attendance.data.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">{record.employee.first_name} {record.employee.last_name}</div>
                                                    <div className="text-xs text-gray-500">{record.employee.employee_code}</div>
                                                </td>
                                                <td className="px-4 py-4 text-sm">{record.attendance_date}</td>
                                                <td className="px-4 py-4 text-sm font-mono text-green-700">
                                                    {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-mono text-orange-700">
                                                    {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-bold">{record.hours_worked}</td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={record.status} />
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500 truncate max-w-xs">{record.remarks}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No attendance records found for this date.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={attendance.links} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}

function StatusBadge({ status }) {
    const colors = {
        Present: 'bg-green-100 text-green-800',
        Late: 'bg-yellow-100 text-yellow-800',
        Absent: 'bg-red-100 text-red-800',
        Leave: 'bg-blue-100 text-blue-800',
        Holiday: 'bg-purple-100 text-purple-800'
    };
    
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}