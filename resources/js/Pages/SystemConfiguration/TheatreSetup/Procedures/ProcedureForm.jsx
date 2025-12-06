import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function ProcedureForm({ procedure = null, groups }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: procedure?.name || '',
        code: procedure?.code || '',
        theatre_procedure_group_id: procedure?.theatre_procedure_group_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (procedure) {
            put(route('systemconfiguration8.procedures.update', procedure.id));
        } else {
            post(route('systemconfiguration8.procedures.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Procedure Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Group</label>
                    <select value={data.theatre_procedure_group_id} onChange={e => setData('theatre_procedure_group_id', e.target.value)} className="w-full border rounded p-2">
                        <option value="">Select Group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration8.procedures.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {procedure ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}