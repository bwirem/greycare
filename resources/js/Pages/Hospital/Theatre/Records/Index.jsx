import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faEye, faCalendarAlt, faUserInjured, 
    faProcedures, faUserMd, faEdit 
} from '@fortawesome/free-solid-svg-icons';

export default function Index({ records, filters }) {
    
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(window.location.href, { search }, { preserveState: true, replace: true });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Completed': 'bg-green-100 text-green-800 border-green-200',
            'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'Scheduled': 'bg-amber-100 text-amber-800 border-amber-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
            'Recovery': 'bg-orange-100 text-orange-800 border-orange-200',
        };
        const style = styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${style}`}>
                {status}
            </span>
        );
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Theatre Queue (Intra-operative)</h2>}>
            <Head title="Theatre Queue" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-200">
                        
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                                <div className="relative w-full">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                        placeholder="Search Patient, Procedure..." 
                                        value={search} 
                                        onChange={e => setSearch(e.target.value)} 
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Procedure</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Surgeon</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                                                No patients in theatre queue.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.data.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50 transition">
                                                
                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                                                        {new Date(record.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                    <div className="text-xs text-gray-400 pl-6">
                                                        {new Date(record.scheduled_at).toLocaleDateString()}
                                                    </div>
                                                </td>

                                                {/* Patient */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                                            <FontAwesomeIcon icon={faUserInjured} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {record.patient?.first_name} {record.patient?.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">
                                                                {record.patientcode}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Procedure */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {record.procedure?.name || 'Unknown Procedure'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faProcedures} className="text-xs" />
                                                        {record.theatre?.name || 'OT'}
                                                    </div>
                                                </td>

                                                {/* Surgeon */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faUserMd} className="text-gray-400" />
                                                        {record.doctor?.name || 'Unassigned'}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {getStatusBadge(record.status)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {/* --- FIX IS HERE: Changed route name to theatre2.edit --- */}
                                                    <Link 
                                                        href={route('theatre2.edit', record.id)} 
                                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} /> Open Record
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4">
                            <Pagination links={records.links} />
                        </div>

                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}