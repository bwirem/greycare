import React, { useState, useEffect } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout'; 
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, 
    faPlus, 
    faEye, 
    faEdit, 
    faStethoscope,
    faUserInjured,
    faClinicMedical
} from "@fortawesome/free-solid-svg-icons";

export default function OpdRegistrationsIndex({ auth, registrations, treatmentPoints }) {
    const [searchTerm, setSearchTerm] = useState('');

    // --- CHANGE 1: Initialize state from Session Storage ---
    // This runs once when the component mounts. If a value exists in storage, use it.
    const [selectedPoint, setSelectedPoint] = useState(() => {
        return sessionStorage.getItem('opd_selected_point') || '';
    });

    // --- CHANGE 2: Update Storage when selection changes ---
    // Whenever 'selectedPoint' changes, save it to the browser's session storage.
    useEffect(() => {
        sessionStorage.setItem('opd_selected_point', selectedPoint);
    }, [selectedPoint]);

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = 
            reg.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.file_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.visit_number.toLowerCase().includes(searchTerm.toLowerCase());

        // Note: Use '==' to compare string (from dropdown) vs number (from DB)
        const matchesClinic = selectedPoint === '' || reg.treatment_point_id == selectedPoint;

        return matchesSearch && matchesClinic;
    });

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

                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
                            {/* Search Box */}
                            <div className="relative w-full md:w-1/2">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Search Name or File No..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Treatment Point Filter */}
                            <div className="relative w-full md:w-1/2">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FontAwesomeIcon icon={faClinicMedical} className="text-gray-400" />
                                </span>
                                <select
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                    value={selectedPoint}
                                    onChange={(e) => setSelectedPoint(e.target.value)}
                                >
                                    <option value="">All Clinics / Treatment Points</option>
                                    {treatmentPoints.map((tp) => (
                                        <option key={tp.id} value={tp.id}>
                                            {tp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link 
                                href={route('outpatient0.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-blue-700 transition ease-in-out duration-150"
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor / Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{reg.doctor_name}</div>
                                                <div className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                                    {reg.clinic}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">{reg.payment_mode}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(reg.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link 
                                                        href={route('outpatient0.show', reg.id)}
                                                        className="text-gray-500 hover:text-blue-600 transition-colors" 
                                                        title="View Details"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Link>

                                                    {reg.status !== 'Seen' && (
                                                        <Link 
                                                            href={route('outpatient0.edit', reg.id)}
                                                            className="text-gray-500 hover:text-green-600 transition-colors" 
                                                            title="Edit Registration"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Link>
                                                    )}

                                                    <a 
                                                        href={route('outpatient0.print_slip', reg.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-500 hover:text-purple-600 transition-colors" 
                                                        title="Print Slip"
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
                                            No registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                        <div>Showing {filteredRegistrations.length} records</div>
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}