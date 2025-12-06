import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function ProcedureForm({ procedure = null, modalities }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: procedure?.name || '',
        code: procedure?.code || '',
        rad_modality_id: procedure?.rad_modality_id || '',
        body_part: procedure?.body_part || '',
        duration_minutes: procedure?.duration_minutes || 15,
        contrast_required: procedure ? Boolean(procedure.contrast_required) : false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (procedure) {
            put(route('systemconfiguration7.procedures.update', procedure.id));
        } else {
            post(route('systemconfiguration7.procedures.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Exam Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code (CPT)</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Modality (Machine) *</label>
                    <select value={data.rad_modality_id} onChange={e => setData('rad_modality_id', e.target.value)} className="w-full border rounded p-2" required>
                        <option value="">Select Modality</option>
                        {modalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                    <input type="number" value={data.duration_minutes} onChange={e => setData('duration_minutes', e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" checked={data.contrast_required} onChange={e => setData('contrast_required', e.target.checked)} className="mr-2" />
                <label>Contrast Required</label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration7.procedures.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {procedure ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}