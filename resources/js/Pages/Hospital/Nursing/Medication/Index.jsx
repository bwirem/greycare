import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faSearch, faUserInjured, faBed } from '@fortawesome/free-solid-svg-icons';

export default function MedicationIndex({ queue }) {
    const [search, setSearch] = useState('');

    const filteredQueue = queue.filter(pt => 
        pt.patient_name.toLowerCase().includes(search.toLowerCase()) || 
        pt.patient_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Medication Administration</h2>}>
            <Head title="Nursing Meds" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* Search */}
                <div className="mb-6 relative w-full md:w-1/3">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500" 
                        placeholder="Search Patient..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQueue.length > 0 ? filteredQueue.map(pt => (
                        <div key={`${pt.type}-${pt.id}`} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900">{pt.patient_name}</h3>
                                    <p className="text-xs text-gray-500 font-mono">{pt.patient_code}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${pt.type === 'IPD' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {pt.type}
                                </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={pt.type === 'IPD' ? faBed : faUserInjured} className="text-gray-400" />
                                {pt.location}
                            </div>

                            <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                    {pt.med_count} Active Rx
                                </span>
                                <Link 
                                    href={route('nursing1.create', { id: pt.id, type: pt.type })} 
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faPills} /> Administer
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-gray-400 italic">No patients with active medications found.</div>
                    )}
                </div>
            </div>
        </HospitalLayout>
    );
}