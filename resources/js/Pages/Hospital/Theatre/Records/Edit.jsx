import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function RecordEdit({ booking }) {
    const { data, setData, put, processing } = useForm({
        status: booking.status,
        remarks: booking.remarks || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('theatre2.update', booking.id));
    };

    return (
        <HospitalLayout header={<h2>Intra-Operative Record</h2>}>
            <Head title="Surgery Record" />

            <div className="py-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white p-6 shadow rounded-lg">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold">{booking.patient.first_name} {booking.patient.last_name}</h3>
                        <p className="text-gray-500">{booking.procedure.name}</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Surgery Status</label>
                        <select 
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm"
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                        >
                            <option>Scheduled</option>
                            <option>In-Progress</option>
                            <option>Recovery</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Surgical Notes / Remarks</label>
                        <textarea 
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm"
                            rows="5"
                            value={data.remarks}
                            onChange={e => setData('remarks', e.target.value)}
                        ></textarea>
                    </div>

                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Update Record
                    </PrimaryButton>
                </form>
            </div>
        </HospitalLayout>
    );
}