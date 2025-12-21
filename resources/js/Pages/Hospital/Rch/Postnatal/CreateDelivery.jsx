import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import axios from 'axios';

export default function CreateDelivery({ auth, preselected }) {
    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activePregnancy, setActivePregnancy] = useState(preselected || null);

    const { data, setData, post, processing, errors } = useForm({
        pregnancy_id: preselected?.id || '',
        delivery_datetime: new Date().toISOString().slice(0, 16), // datetime-local format
        mode_of_delivery: 'SVD',
        outcome: 'Live Birth',
        placenta_delivery: 'Complete',
        blood_loss_ml: '',
        child_gender: 'Male',
        birth_weight_kg: '',
        apgar_score_1min: '',
        apgar_score_5min: '',
        complications: ''
    });

    // Load Patient/Pregnancy Logic (Similar to ANC Visit)
    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`
                }));
                setPatientOptions(options);
            });
    };

    const handlePatientSelect = async (opt) => {
        setSelectedPatient(opt);
        if (opt) {
            // Fetch active pregnancy via API (Assume endpoint exists, or reuse ANC search)
            try {
                const res = await axios.get(route('rch1.visit.create'), { // HACK: reusing endpoint logic concept
                     params: { patient_code: opt.value } // Ideally use dedicated API
                });
                // Since this is client side logic simulation, assume we got the pregnancy object back
                // In production, make a dedicated API method: RchPostnatalController@searchPregnancy
            } catch (e) { }
            
            // For now, if user selects patient, reload page to find pregnancy
             window.location.href = route('rch2.delivery.create', { patient_code: opt.value });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rch2.delivery.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Record Delivery (Birth)</h2>}
        >
            <Head title="Record Delivery" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {!activePregnancy ? (
                         <div className="bg-white p-6 shadow-sm rounded-lg mb-6">
                            <h3 className="text-lg font-medium mb-4">Find Mother (Active Pregnancy)</h3>
                            <Select
                                options={patientOptions}
                                onInputChange={loadPatients}
                                onChange={handlePatientSelect}
                                placeholder="Search Mother..."
                            />
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="border-b pb-4 mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Mother: {activePregnancy.patient.first_name} {activePregnancy.patient.last_name}</h3>
                                <p className="text-sm text-gray-500">ANC: {activePregnancy.anc_number} | EDD: {activePregnancy.edd_date}</p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <input type="hidden" value={data.pregnancy_id} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date & Time of Delivery *</label>
                                        <input type="datetime-local" value={data.delivery_datetime} onChange={e => setData('delivery_datetime', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                        {errors.delivery_datetime && <p className="text-red-500 text-xs mt-1">{errors.delivery_datetime}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mode of Delivery *</label>
                                        <select value={data.mode_of_delivery} onChange={e => setData('mode_of_delivery', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="SVD">Spontaneous Vaginal Delivery (SVD)</option>
                                            <option value="C-Section">Caesarean Section</option>
                                            <option value="Vacuum">Vacuum Extraction</option>
                                            <option value="Breech">Breech Delivery</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Outcome *</label>
                                        <select value={data.outcome} onChange={e => setData('outcome', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="Live Birth">Live Birth</option>
                                            <option value="Fresh Still Birth">Fresh Still Birth</option>
                                            <option value="Macerated Still Birth">Macerated Still Birth</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Placenta Delivery</label>
                                        <select value={data.placenta_delivery} onChange={e => setData('placenta_delivery', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="Complete">Complete</option>
                                            <option value="Incomplete">Incomplete</option>
                                            <option value="Manual Removal">Manual Removal</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Blood Loss (ml)</label>
                                        <input type="number" value={data.blood_loss_ml} onChange={e => setData('blood_loss_ml', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. 200" />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-6">
                                    <h4 className="font-semibold text-gray-700 mb-4 border-b pb-2">Baby Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <select value={data.child_gender} onChange={e => setData('child_gender', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Birth Weight (kg)</label>
                                            <input type="number" step="0.01" value={data.birth_weight_kg} onChange={e => setData('birth_weight_kg', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                            {errors.birth_weight_kg && <p className="text-red-500 text-xs mt-1">{errors.birth_weight_kg}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">APGAR (1 min)</label>
                                            <input type="number" min="0" max="10" value={data.apgar_score_1min} onChange={e => setData('apgar_score_1min', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">APGAR (5 min)</label>
                                            <input type="number" min="0" max="10" value={data.apgar_score_5min} onChange={e => setData('apgar_score_5min', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Complications / Notes</label>
                                    <textarea value={data.complications} onChange={e => setData('complications', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2"></textarea>
                                </div>

                                <div className="flex justify-end gap-4 border-t pt-4">
                                    <Link href={route('rch2.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                                    <button disabled={processing} className="bg-purple-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                                        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                        Save Delivery Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}