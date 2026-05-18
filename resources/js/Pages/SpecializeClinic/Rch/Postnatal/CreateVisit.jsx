import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function CreateVisit({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        patient_code: '',
        visit_date: new Date().toISOString().split('T')[0],
        timing: '48 Hours',
        uterus_involution: '',
        lochia_status: '',
        c_section_wound: '',
        vitamin_a_given: false,
        counseling_given: ''
    });

    const [patientOptions, setPatientOptions] = useState([]);

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

    const submit = (e) => {
        e.preventDefault();
        post(route('rch2.visit.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">New PNC Visit (Mother)</h2>}
        >
            <Head title="PNC Visit" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Mother *</label>
                                <Select
                                    options={patientOptions}
                                    onInputChange={loadPatients}
                                    onChange={(opt) => setData('patient_code', opt?.value)}
                                    placeholder="Search..."
                                />
                                {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Visit Date *</label>
                                    <input type="date" value={data.visit_date} onChange={e => setData('visit_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Timing *</label>
                                    <select value={data.timing} onChange={e => setData('timing', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="48 Hours">Within 48 Hours</option>
                                        <option value="7 Days">Within 7 Days</option>
                                        <option value="42 Days">Within 42 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Uterus Involution</label>
                                    <input type="text" value={data.uterus_involution} onChange={e => setData('uterus_involution', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. Contracted" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lochia Status</label>
                                    <select value={data.lochia_status} onChange={e => setData('lochia_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="">Select</option>
                                        <option value="Rubra (Red)">Rubra (Red)</option>
                                        <option value="Serosa (Pink/Brown)">Serosa (Pink/Brown)</option>
                                        <option value="Alba (White/Yellow)">Alba (White/Yellow)</option>
                                        <option value="Foul Smelling">Foul Smelling</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">C-Section Wound</label>
                                    <select value={data.c_section_wound} onChange={e => setData('c_section_wound', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="">N/A</option>
                                        <option value="Intact/Clean">Intact/Clean</option>
                                        <option value="Infected/Pus">Infected/Pus</option>
                                        <option value="Gaping">Gaping</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-4">
                                <input type="checkbox" checked={data.vitamin_a_given} onChange={e => setData('vitamin_a_given', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                <label className="text-sm font-medium text-gray-700">Vitamin A Supplement Given?</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Counseling Given</label>
                                <textarea value={data.counseling_given} onChange={e => setData('counseling_given', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2" placeholder="e.g. Exclusive Breastfeeding, Hygiene..."></textarea>
                            </div>

                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Link href={route('rch2.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                                <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                    Save Checkup
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}