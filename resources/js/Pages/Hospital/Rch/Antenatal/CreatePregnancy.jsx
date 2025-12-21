import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function CreatePregnancy({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        patient_code: '',
        anc_number: '',
        gravida: '',
        parity: '',
        lmp_date: '',
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [edd, setEdd] = useState('');

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue })) // Reuse the search API
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`
                }));
                setPatientOptions(options);
            });
    };

    // Auto-calculate EDD
    const handleLmpChange = (date) => {
        setData('lmp_date', date);
        if (date) {
            const lmp = new Date(date);
            lmp.setDate(lmp.getDate() + 7); // +7 Days
            lmp.setMonth(lmp.getMonth() + 9); // +9 Months
            setEdd(lmp.toISOString().split('T')[0]);
        } else {
            setEdd('');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rch1.register.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Register New Pregnancy</h2>}
        >
            <Head title="ANC Registration" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Patient Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient *</label>
                                <Select
                                    options={patientOptions}
                                    onInputChange={loadPatients}
                                    onChange={(opt) => setData('patient_code', opt?.value)}
                                    placeholder="Search by Name or File No..."
                                    className="basic-single"
                                />
                                {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Facility ANC Number</label>
                                    <input type="text" value={data.anc_number} onChange={e => setData('anc_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. ANC/2025/001" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Menstrual Period (LMP) *</label>
                                    <input type="date" value={data.lmp_date} onChange={e => handleLmpChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                    {edd && <p className="text-xs text-green-600 mt-1 font-bold">Estimated Delivery: {edd}</p>}
                                    {errors.lmp_date && <p className="text-red-500 text-xs mt-1">{errors.lmp_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gravida (Total Pregnancies) *</label>
                                    <input type="number" value={data.gravida} onChange={e => setData('gravida', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required min="1" />
                                    {errors.gravida && <p className="text-red-500 text-xs mt-1">{errors.gravida}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parity (Previous Births) *</label>
                                    <input type="number" value={data.parity} onChange={e => setData('parity', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required min="0" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Link href={route('rch1.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                    Register Pregnancy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}