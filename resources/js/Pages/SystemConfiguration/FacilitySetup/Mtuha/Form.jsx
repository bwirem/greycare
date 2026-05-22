import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function MtuhaForm({ type, diagnosis = null, groups }) {
    const { data, setData, post, put, processing, errors } = useForm({
        description: diagnosis?.description || '',
        mtuha_code: diagnosis?.mtuha_code || '',
        dxt_diagnoses_group_id: diagnosis?.dxt_diagnoses_group_id || '',
        exact_codes: diagnosis?.exact_codes || '',
        ranges:diagnosis?.ranges || '',
        priority:diagnosis?.priority || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (diagnosis) {
            put(route('systemconfiguration5.mtuha.update', { type, id: diagnosis.id }));
        } else {
            post(route('systemconfiguration5.mtuha.store', type));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">MTUHA Disease Name *</label>
                    <input 
                        type="text" 
                        value={data.description} 
                        onChange={e => setData('description', e.target.value)} 
                        className="w-full border rounded p-2" 
                        placeholder="e.g. Malaria, Severe/Complicated"
                        required 
                    />
                    {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">MTUHA Code</label>
                    <input 
                        type="text" 
                        value={data.mtuha_code} 
                        onChange={e => setData('mtuha_code', e.target.value)} 
                        className="w-full border rounded p-2" 
                        placeholder="e.g. 01"
                    />
                    {errors.mtuha_code && <p className="text-red-500 text-xs">{errors.mtuha_code}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category Group</label>
                    <select value={data.dxt_diagnoses_group_id} onChange={e => setData('dxt_diagnoses_group_id', e.target.value)} className="w-full border rounded p-2">
                        <option value="">Select Group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Exact ICD-10 Mapping Code(s)</label>
                    <input 
                        type="text" 
                        value={data.exact_codes} 
                        onChange={e => setData('exact_codes', e.target.value)} 
                        className="w-full border rounded p-2" 
                        placeholder="e.g. B50.0, B50.8, B50.9" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Accepts single codes (A41.9), ranges (B77-B83), or lists (A09, A08)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ICD-10 Mapping Code Renges</label>
                    <input 
                        type="text" 
                        value={data.ranges} 
                        onChange={e => setData('ranges', e.target.value)} 
                        className="w-full border rounded p-2" 
                        placeholder="e.g. B50.0, B50.8, B50.9" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Accepts single codes (A41.9), ranges (B77-B83), or lists (A09, A08)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <input 
                        type="text" 
                        value={data.priority} 
                        onChange={e => setData('priority', e.target.value)} 
                        className="w-full border rounded p-2" 
                        placeholder="e.g. 01"
                    />
                    {errors.priority && <p className="text-red-500 text-xs">{errors.priority}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.mtuha.index', type)} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {diagnosis ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}