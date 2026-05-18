import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/MortuaryLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faHandshake, faUser } from '@fortawesome/free-solid-svg-icons';

export default function ReleaseCreate({ record }) {
    const { data, setData, post, processing, errors } = useForm({
        receiver_name: '',
        receiver_id_number: '',
        relationship: '',
        released_at: new Date().toISOString().slice(0, 16),
        remarks: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mortuary1.store', record.id));
    };

    return (
        <HospitalLayout header={<h2>Process Body Handover</h2>}>
            <Head title="Release Body" />
            
            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                
                {/* LEFT: Deceased Info */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md border-t-4 border-gray-600">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{record.first_name} {record.last_name}</h3>
                                <p className="text-sm text-gray-300 font-mono">{record.patient_code || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300 mt-4 border-t border-gray-600 pt-4">
                            <div><strong>Gender:</strong> {record.gender}</div>
                            <div><strong>Age:</strong> {record.age} Yrs</div>
                            <div><strong>Cabinet:</strong> {record.cabinet_number}</div>
                            <div><strong>Date of Death:</strong> {new Date(record.date_of_death).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Release Form */}
                <div className="w-full lg:w-2/3">
                    <form onSubmit={submit} className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                        <h3 className="font-bold text-lg text-green-800 mb-6 flex items-center gap-2 pb-2 border-b">
                            <FontAwesomeIcon icon={faHandshake} /> Receiver Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div className="md:col-span-2">
                                <InputLabel value="Full Name of Receiver *" />
                                <TextInput className="w-full mt-1" required value={data.receiver_name} onChange={e => setData('receiver_name', e.target.value)} />
                                {errors.receiver_name && <p className="text-red-500 text-xs mt-1">{errors.receiver_name}</p>}
                            </div>
                            
                            <div>
                                <InputLabel value="Receiver National ID / Passport *" />
                                <TextInput className="w-full mt-1" required value={data.receiver_id_number} onChange={e => setData('receiver_id_number', e.target.value)} />
                                {errors.receiver_id_number && <p className="text-red-500 text-xs mt-1">{errors.receiver_id_number}</p>}
                            </div>

                            <div>
                                <InputLabel value="Relationship to Deceased *" />
                                <TextInput className="w-full mt-1" placeholder="e.g. Brother, Wife, Police Officer" required value={data.relationship} onChange={e => setData('relationship', e.target.value)} />
                                {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
                            </div>

                            <div>
                                <InputLabel value="Date/Time of Release *" />
                                <TextInput type="datetime-local" className="w-full mt-1" required value={data.released_at} onChange={e => setData('released_at', e.target.value)} />
                                {errors.released_at && <p className="text-red-500 text-xs mt-1">{errors.released_at}</p>}
                            </div>
                            
                            <div className="md:col-span-2">
                                <InputLabel value="Remarks / Internal Notes" />
                                <textarea className="w-full border-gray-300 rounded-md shadow-sm mt-1" rows="3" value={data.remarks} onChange={e => setData('remarks', e.target.value)}></textarea>
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                            <Link href={route('mortuary1.index')} className="px-5 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-200">
                                <FontAwesomeIcon icon={faUndo} className="mr-2" /> Cancel
                            </Link>
                            <PrimaryButton className="px-6 py-2 bg-green-600 hover:bg-green-700 shadow-md" disabled={processing}>
                                {processing ? 'Processing...' : 'Confirm & Release Body'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}