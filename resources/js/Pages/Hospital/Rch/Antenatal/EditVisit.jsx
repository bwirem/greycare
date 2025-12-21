import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function EditVisit({ auth, visit }) {
    const { data, setData, put, processing, errors } = useForm({
        gestational_age_weeks: visit.gestational_age_weeks,
        fundal_height_cm: visit.fundal_height_cm || '',
        fetal_heart_rate: visit.fetal_heart_rate || '',
        fetal_lie: visit.fetal_lie || '',
        urine_albumin: visit.urine_albumin || '',
        syphilis_result: visit.syphilis_result || '',
        hiv_status: visit.hiv_status || '',
        arv_prophylaxis: !!visit.arv_prophylaxis,
        ipt_malaria: !!visit.ipt_malaria,
        tt_vaccine: !!visit.tt_vaccine,
        iron_folate: !!visit.iron_folate,
        deworming: !!visit.deworming,
        remarks: visit.remarks || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('rch1.update', visit.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Edit ANC Visit</h2>}
        >
            <Head title="Edit Visit" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Patient: {visit.pregnancy?.patient?.first_name} {visit.pregnancy?.patient?.last_name}</h3>
                        
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gestational Age (Weeks)</label>
                                    <input type="number" value={data.gestational_age_weeks} onChange={e => setData('gestational_age_weeks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fundal Height (cm)</label>
                                    <input type="number" value={data.fundal_height_cm} onChange={e => setData('fundal_height_cm', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" step="0.1" />
                                </div>
                                {/* Add remaining fields similar to CreateVisit... */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                    <textarea value={data.remarks} onChange={e => setData('remarks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="3"></textarea>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Link href={route('rch1.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                    Update Visit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}