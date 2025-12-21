import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import axios from 'axios'; // Inertia comes with axios usually, or import from 'axios'

export default function CreateVisit({ auth, preselectedPregnancy }) {
    // Stage 1: Search Patient
    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activePregnancy, setActivePregnancy] = useState(preselectedPregnancy || null);
    const [loadingPregnancy, setLoadingPregnancy] = useState(false);

    // Stage 2: Form Data
    const { data, setData, post, processing, errors } = useForm({
        pregnancy_id: '',
        gestational_age_weeks: '',
        fundal_height_cm: '',
        fetal_heart_rate: '',
        fetal_lie: '',
        urine_albumin: '',
        syphilis_result: '',
        hiv_status: '',
        arv_prophylaxis: false,
        ipt_malaria: false,
        tt_vaccine: false,
        iron_folate: false,
        deworming: false,
        remarks: ''
    });

    useEffect(() => {
        if (preselectedPregnancy) {
            setSelectedPatient({
                value: preselectedPregnancy.patient_code,
                label: `${preselectedPregnancy.patient.first_name} ${preselectedPregnancy.patient.last_name}`
            });
            setData('pregnancy_id', preselectedPregnancy.id);
            // Auto calc GA if possible (simple calc from PHP controller or do here)
             // For now user enters GA
        }
    }, [preselectedPregnancy]);

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
            setLoadingPregnancy(true);
            try {
                // You need to create this route in web.php or Controller method
                // We'll assume a custom endpoint or inertia props reload. 
                // For simplicity, let's use a specialized method in controller for JSON check.
                const res = await axios.get(route('rch1.index'), { // Using index with a param as hack or proper API
                    params: { search: opt.value, format: 'json' } // This logic depends on controller
                });
                // Since I didn't make a JSON API in the controller earlier, let's assume we redirect 
                // or reload the page with the patient_code param which triggers the preselectedPregnancy logic
                router.visit(route('rch1.visit.create', { patient_code: opt.value }));
            } catch (e) {
                console.error(e);
            }
        } else {
            setActivePregnancy(null);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rch1.visit.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">New ANC Visit</h2>}
        >
            <Head title="ANC Visit" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Step 1: Patient Selection */}
                    {!activePregnancy && (
                        <div className="bg-white p-6 shadow-sm rounded-lg mb-6">
                            <h3 className="text-lg font-medium mb-4">Select Patient</h3>
                            <Select
                                options={patientOptions}
                                onInputChange={loadPatients}
                                onChange={(opt) => router.visit(route('rch1.visit.create', { patient_code: opt?.value }))}
                                placeholder="Search by Name or File No..."
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                If patient is not found, ensure they are registered in the main system.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Visit Form */}
                    {activePregnancy && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {activePregnancy.patient.first_name} {activePregnancy.patient.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        ANC No: {activePregnancy.anc_number} | G{activePregnancy.gravida} P{activePregnancy.parity} | 
                                        LMP: {activePregnancy.lmp_date}
                                    </p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active Pregnancy</span>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <input type="hidden" value={data.pregnancy_id} />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Clinical Measurements */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gestational Age (Weeks) *</label>
                                        <input type="number" value={data.gestational_age_weeks} onChange={e => setData('gestational_age_weeks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required min="1" max="45" />
                                        {errors.gestational_age_weeks && <p className="text-red-500 text-xs mt-1">{errors.gestational_age_weeks}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fundal Height (cm)</label>
                                        <input type="number" value={data.fundal_height_cm} onChange={e => setData('fundal_height_cm', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" step="0.1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fetal Heart Rate (bpm)</label>
                                        <input type="text" value={data.fetal_heart_rate} onChange={e => setData('fetal_heart_rate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="140" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fetal Lie</label>
                                        <select value={data.fetal_lie} onChange={e => setData('fetal_lie', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="">Select</option>
                                            <option value="Longitudinal">Longitudinal</option>
                                            <option value="Transverse">Transverse</option>
                                            <option value="Oblique">Oblique</option>
                                        </select>
                                    </div>
                                    
                                    {/* Lab Quick Checks */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Urine Albumin</label>
                                        <select value={data.urine_albumin} onChange={e => setData('urine_albumin', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="">Not Done</option>
                                            <option value="Neg">Negative</option>
                                            <option value="+">+</option>
                                            <option value="++">++</option>
                                            <option value="+++">+++</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">HIV Status</label>
                                        <select value={data.hiv_status} onChange={e => setData('hiv_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="">Unknown</option>
                                            <option value="Neg">Negative</option>
                                            <option value="Known Pos">Known Positive</option>
                                            <option value="New Pos">New Positive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Interventions (Checkboxes) */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-800 mb-3">Interventions Given Today</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={data.iron_folate} onChange={e => setData('iron_folate', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <span>Iron & Folate</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={data.ipt_malaria} onChange={e => setData('ipt_malaria', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <span>SP (Malaria)</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={data.tt_vaccine} onChange={e => setData('tt_vaccine', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <span>TT Vaccine</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={data.deworming} onChange={e => setData('deworming', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <span>Deworming</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={data.arv_prophylaxis} onChange={e => setData('arv_prophylaxis', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <span>ARV Prophylaxis</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                    <textarea value={data.remarks} onChange={e => setData('remarks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="3"></textarea>
                                </div>

                                <div className="flex justify-end gap-4 border-t pt-4">
                                    <Link href={route('rch1.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                                    <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                                        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                        Save Visit
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