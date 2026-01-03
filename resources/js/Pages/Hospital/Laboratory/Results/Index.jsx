import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faFlask, faEdit, faVial, 
    faCheckCircle, faSpinner, faCalendarAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function ResultsIndex({ samples, filters }) {
    // 1. Initialize state with filters provided by the controller
    // filters.date will contain "Today" by default from the backend logic
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    // 2. Main Search Handler (for text search)
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboratory1.index'), { search, date }, { preserveState: true });
    };

    // 3. Date Change Handler (Triggers immediately)
    const handleDateChange = (newDate) => {
        setDate(newDate);
        router.get(
            route('laboratory1.index'), 
            { search, date: newDate }, 
            { preserveState: true, replace: true }
        );
    };

    // 4. Grouping Logic: Group samples by patient code
    const groupedSamples = samples.data.reduce((groups, sample) => {
        const key = sample.prescription.patientcode;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(sample);
        return groups;
    }, {});

    return (
        <HospitalLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lab Results Processing</h2>}>
            <Head title="Lab Results" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* --- Toolbar --- */}
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600 mb-2 lg:mb-0">
                            Enter results for collected samples.
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            
                            {/* Date Filter */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                </span>
                                <TextInput 
                                    type="date"
                                    className="pl-10 w-full sm:w-40"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                />
                            </div>

                            {/* Search Input */}
                            <div className="flex gap-2 w-full sm:w-64">
                                <TextInput 
                                    className="w-full"
                                    placeholder="Search Patient Name or ID..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <PrimaryButton type="submit">
                                    <FontAwesomeIcon icon={faSearch} />
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* --- Data Table --- */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider w-3/12">Patient Details</th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider w-2/12">Sample ID</th> */}
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider w-3/12">Test Panel</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider w-2/12">Collected At</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-green-800 uppercase tracking-wider w-2/12">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(groupedSamples).length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                            No pending samples found for this date.
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(groupedSamples).map(([patientCode, groupItems]) => {
                                        // Get patient details from the first sample in the group
                                        const firstSample = groupItems[0];
                                        const patient = firstSample.prescription.patient;

                                        return (
                                            <tr key={patientCode} className="hover:bg-green-50 transition-colors border-b border-gray-200">
                                                
                                                {/* 1. Patient Details (Rendered Once) */}
                                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                                    <div className="font-bold text-gray-900 text-base">
                                                        {patient.first_name} {patient.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                                        {patientCode}
                                                    </div>
                                                    <div className="text-xs text-green-600 font-semibold mt-1">
                                                        {groupItems.length} Pending Result{groupItems.length > 1 ? 's' : ''}
                                                    </div>
                                                </td>

                                                {/* 2. Sample IDs (Stacked) */}
                                                {/* <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-3">
                                                        {groupItems.map((sample) => (
                                                            <div key={sample.id} className="h-8 flex items-center">
                                                                <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-300">
                                                                    <FontAwesomeIcon icon={faVial} className="mr-2 text-gray-400" />
                                                                    {sample.sample_code}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td> */}

                                                {/* 3. Test Panel (Stacked) */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-3">
                                                        {groupItems.map((sample) => (
                                                            <div key={sample.id} className="h-8 flex items-center">
                                                                <div className="text-sm font-medium text-gray-800">
                                                                    <FontAwesomeIcon icon={faFlask} className="mr-2 text-green-600 opacity-70"/>
                                                                    {sample.prescription.panel.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* 4. Collected Date / Status (Stacked) */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-3">
                                                        {groupItems.map((sample) => (
                                                            <div key={sample.id} className="h-8 flex items-center text-xs">
                                                                <div className="flex flex-col leading-tight">
                                                                    <span className="text-gray-500">
                                                                        {new Date(sample.collected_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </span>
                                                                    {sample.status === 'collected' ? (
                                                                        <span className="text-blue-600 font-bold flex items-center">
                                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Ready
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-yellow-600 font-bold flex items-center">
                                                                            <FontAwesomeIcon icon={faSpinner} className="mr-1" /> In Progress
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* 5. Actions (Stacked) */}
                                                <td className="px-6 py-4 align-top text-right">
                                                    <div className="flex flex-col gap-3 items-end">
                                                        {groupItems.map((sample) => (
                                                            <div key={sample.id} className="h-8 flex items-center">
                                                                <Link 
                                                                    href={route('laboratory1.create', sample.id)}
                                                                    className={`inline-flex items-center px-3 py-1 rounded text-[10px] uppercase font-bold shadow-sm transition ${
                                                                        sample.status === 'collected' 
                                                                        ? 'bg-green-600 text-white hover:bg-green-700' 
                                                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                                    }`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                                    {sample.status === 'collected' ? 'Enter Results' : 'Continue'}
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <Pagination links={samples.links} />
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}