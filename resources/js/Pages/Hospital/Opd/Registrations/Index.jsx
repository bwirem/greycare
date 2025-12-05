import React, { useState } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout'; // Adjust path if your layout is elsewhere
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, 
    faPlus, 
    faFilter, 
    faEye, 
    faEdit, 
    faStethoscope,
    faUserInjured
} from "@fortawesome/free-solid-svg-icons";

export default function OpdRegistrationsIndex({ auth, registrations }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic based on search term
    const filteredRegistrations = registrations.filter(reg => 
        reg.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.file_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.visit_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper for Status Badge Colors
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Waiting':
                return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Waiting</span>;
            case 'Triaged':
                return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Triaged</span>;
            case 'Seen':
                return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completed</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
        }
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon icon={faUserInjured} className="mr-2 text-gray-500" />
                    OPD Registrations
                </h2>
            }
        >
            <Head title="OPD Registrations" />

            <div className="py-2">
                {/* Stats / Quick Cards (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-gray-500 text-sm font-medium">Today's Visits</div>
                        <div className="text-2xl font-bold text-gray-800">{registrations.length}</div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="text-gray-500 text-sm font-medium">Pending Triage</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {registrations.filter(r => r.status === 'Waiting').length}
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        
                        {/* Search Box */}
                        <div className="relative w-full md:w-1/3">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Search by Name, File No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filter
                            </button>
                            <Link 
                                href={route('outpatient0.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Registration
                            </Link>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Visit Info
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient Details
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor / Room
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRegistrations.length > 0 ? (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-blue-600">{reg.visit_number}</div>
                                                <div className="text-xs text-gray-500">{reg.time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{reg.patient_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {reg.file_number} | {reg.gender}, {reg.age} Yrs
                                                </div>
                                            </td>                                           
                                            {/* --- UPDATED COLUMN --- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{reg.doctor_name}</div>
                                                <div className="text-xs text-gray-500">{reg.clinic}</div>
                                            </td>
                                            {/* ---------------------- */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">{reg.payment_mode}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(reg.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    
                                                    {/* 1. View Details */}
                                                    <Link 
                                                        href={route('outpatient0.show', reg.id)}
                                                        className="text-gray-500 hover:text-blue-600 transition-colors" 
                                                        title="View Details"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Link>

                                                    {/* 2. Edit Registration */}
                                                    {/* Only allow editing if status is still Waiting or Triaged */}
                                                    {reg.status !== 'Seen' && (
                                                        <Link 
                                                            href={route('outpatient0.edit', reg.id)}
                                                            className="text-gray-500 hover:text-green-600 transition-colors" 
                                                            title="Edit Registration"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Link>
                                                    )}

                                                    {/* 3. Send to Triage / Print Slip */}
                                                    {/* Uses <a> to open in new tab for printing */}
                                                    <a 
                                                        href={route('outpatient0.print_slip', reg.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-500 hover:text-purple-600 transition-colors" 
                                                        title="Print Slip / Send to Triage"
                                                    >
                                                        <FontAwesomeIcon icon={faStethoscope} />
                                                    </a>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            No registrations found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Placeholder */}
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                        <div>Showing {filteredRegistrations.length} records</div>
                        <div className="flex gap-1">
                            {/* You would usually use Laravel Pagination links here */}
                            <button className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" disabled>Prev</button>
                            <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600">1</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-100">Next</button>
                        </div>
                    </div>

                </div>
            </div>
        </HospitalLayout>
    );
}