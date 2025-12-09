import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';

export default function DoctorIpdIndex({ admissions }) {
    return (
        <HospitalLayout header={<h2>Inpatient Ward Rounds</h2>}>
            <Head title="Ward Rounds" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admissions.data.map((adm) => (
                        <div key={adm.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {adm.patient.first_name} {adm.patient.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{adm.patientcode}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        {adm.ward?.name}
                                    </span>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-gray-500 text-xs">Bed No</span>
                                        <span className="font-medium">{adm.bed?.name || 'Unassigned'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">Admitted On</span>
                                        <span className="font-medium">{new Date(adm.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Link 
                                        href={route('doctor1.create', adm.id)}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                    >
                                        Conduct Round
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </HospitalLayout>
    );
}