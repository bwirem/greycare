import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';

export default function PrescriptionShow({ prescription }) {
    
    const cancelRx = () => {
        if(confirm('Are you sure you want to cancel this prescription?')) {
            router.post(route('pharmacy.prescriptions.cancel', prescription.id));
        }
    };

    return (
        <HospitalLayout header={<h2>Prescription Details</h2>}>
            <Head title="Rx Details" />

            <div className="py-8 max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    
                    <div className="flex justify-between items-start border-b pb-4 mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Rx #{prescription.id}</h3>
                            <p className="text-sm text-gray-500">Date: {new Date(prescription.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm font-medium text-gray-700">Status</span>
                            <span className="font-bold text-lg text-indigo-600">{prescription.status}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 className="font-bold text-gray-700">Patient Info</h4>
                            <p>{prescription.patient.first_name} {prescription.patient.last_name}</p>
                            <p className="text-sm text-gray-500">ID: {prescription.patientcode}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700">Clinical Info</h4>
                            <p>Doctor: {prescription.doctor.name}</p>
                            <p className="text-sm text-gray-500">Item: {prescription.product?.name}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-6">
                        <h4 className="font-bold text-gray-700 mb-2">Instructions</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-500">Dosage:</span> {prescription.dosage}</div>
                            <div><span className="text-gray-500">Freq:</span> {prescription.frequency}</div>
                            <div><span className="text-gray-500">Duration:</span> {prescription.duration}</div>
                        </div>
                        <div className="mt-2 text-sm"><span className="text-gray-500">Qty:</span> {prescription.quantity_prescribed}</div>
                    </div>

                    <h4 className="font-bold text-gray-700 mb-2">Dispensation History</h4>
                    <table className="min-w-full divide-y divide-gray-200 mb-6">
                        <thead>
                            <tr>
                                <th className="text-left text-xs uppercase text-gray-500 py-2">Date</th>
                                <th className="text-left text-xs uppercase text-gray-500 py-2">Pharmacist</th>
                                <th className="text-right text-xs uppercase text-gray-500 py-2">Qty Issued</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescription.dispensations.length === 0 ? <tr><td colSpan="3" className="text-sm text-gray-500 py-2">No items dispensed yet.</td></tr> :
                            prescription.dispensations.map(d => (
                                <tr key={d.id}>
                                    <td className="text-sm py-2">{new Date(d.dispensed_at).toLocaleString()}</td>
                                    <td className="text-sm py-2">{d.pharmacist.name}</td>
                                    <td className="text-sm py-2 text-right font-bold">{d.quantity_issued}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {prescription.status !== 'Dispensed' && prescription.status !== 'Cancelled' && (
                        <div className="flex justify-end pt-4 border-t">
                            <button onClick={cancelRx} className="text-red-600 hover:text-red-800 font-bold text-sm uppercase">
                                Cancel Prescription
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </HospitalLayout>
    );
}