import React from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function History({ auth, pregnancy, visits }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Visit History</h2>}
        >
            <Head title="ANC History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        
                        {/* Header Info */}
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div>
                                <h3 className="text-lg font-bold">{pregnancy.patient.first_name} {pregnancy.patient.last_name}</h3>
                                <p className="text-sm text-gray-500">ANC: {pregnancy.anc_number} | LMP: {pregnancy.lmp_date}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('rch1.index')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                                </Link>
                                <Link href={route('rch1.visit.create', { patient_code: pregnancy.patient_code })} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlus} /> New Visit
                                </Link>
                            </div>
                        </div>

                        {/* Visits Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestation</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight / BP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {visits.length > 0 ? (
                                        visits.map((visit) => (
                                            <tr key={visit.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {new Date(visit.created_at).toLocaleDateString()}
                                                    <div className="text-xs text-gray-500">{new Date(visit.created_at).toLocaleTimeString()}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{visit.gestational_age_weeks} Weeks</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {visit.weight_kg ? `${visit.weight_kg}kg` : '-'} <br/>
                                                    {visit.bp_systolic}/{visit.bp_diastolic}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    Fundal: {visit.fundal_height_cm}cm <br/>
                                                    FHR: {visit.fetal_heart_rate}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    {/* THIS IS THE LINK TO OPEN EditVisit.jsx */}
                                                    <Link 
                                                        href={route('rch1.edit', visit.id)} 
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No visits recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}