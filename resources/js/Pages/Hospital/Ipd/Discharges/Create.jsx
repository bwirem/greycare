import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DischargeCreate({ admission, statuses }) {
    const { data, setData, post, processing } = useForm({
        discharge_status_id: '',
        remarks: '',
        discharge_date: new Date().toISOString().slice(0, 16)
    });

    const submit = (e) => {
        e.preventDefault();
        if(confirm('Are you sure you want to discharge this patient? This will free the bed.')) {
            post(route('inpatient1.store', admission.id));
        }
    };

    return (
        <HospitalLayout header={<h2>Discharge Patient</h2>}>
            <Head title="Discharge" />
            <div className="py-8 max-w-xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold">{admission.patient.first_name} {admission.patient.last_name}</h3>
                        <p className="text-gray-500">Admitted: {new Date(admission.created_at).toLocaleDateString()}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel value="Discharge Date/Time" />
                            <TextInput type="datetime-local" className="w-full" value={data.discharge_date} onChange={e => setData('discharge_date', e.target.value)} />
                        </div>

                        <div>
                            <InputLabel value="Discharge Outcome" />
                            <select className="w-full border-gray-300 rounded" onChange={e => setData('discharge_status_id', e.target.value)}>
                                <option value="">Select Outcome...</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Clinical Remarks / Summary" />
                            <textarea 
                                className="w-full border-gray-300 rounded shadow-sm" 
                                rows="4"
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                            ></textarea>
                        </div>

                        <PrimaryButton className="w-full justify-center bg-red-600 hover:bg-red-700" disabled={processing}>
                            Finalize Discharge
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}