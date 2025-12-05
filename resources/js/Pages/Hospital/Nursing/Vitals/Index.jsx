import React from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUserNurse, faThermometerHalf, faClock, faArrowRight 
} from "@fortawesome/free-solid-svg-icons";

export default function NursingIndex({ auth, queue }) {
    
    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon icon={faUserNurse} className="mr-2 text-pink-500" />
                    Nursing Station (Triage)
                </h2>
            }
        >
            <Head title="Nursing Station" />

            <div className="py-2">
                
                {/* Stats */}
                <div className="mb-6 bg-white p-4 rounded shadow-sm border-l-4 border-pink-500 flex justify-between items-center">
                    <div>
                        <div className="text-gray-500 text-sm font-bold uppercase">Pending Patients</div>
                        <div className="text-2xl font-bold text-gray-800">{queue.length}</div>
                    </div>
                    <FontAwesomeIcon icon={faClock} className="text-gray-300 text-4xl" />
                </div>

                {/* Patient Queue Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic / Doctor</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {queue.length > 0 ? (
                                    queue.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                                    {item.time_in}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-800">{item.patient_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.file_number} | {item.gender}, {item.age} Yrs
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.clinic}</div>
                                                <div className="text-xs text-gray-500">{item.doctor}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link 
                                                    href={route('nursing0.create', item.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none transition ease-in-out duration-150"
                                                >
                                                    <FontAwesomeIcon icon={faThermometerHalf} className="mr-2" />
                                                    Take Vitals
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <FontAwesomeIcon icon={faUserNurse} className="text-4xl text-gray-300 mb-2" />
                                                <p>No patients waiting for vitals.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}