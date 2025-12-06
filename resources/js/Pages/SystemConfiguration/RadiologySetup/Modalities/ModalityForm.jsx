import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function ModalityForm({ modality = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: modality?.name || '',
        code: modality?.code || '',
        ae_title: modality?.ae_title || '',
        ip_address: modality?.ip_address || '',
        port: modality?.port || '',
        room_identifier: modality?.room_identifier || '',
        is_active: modality ? Boolean(modality.is_active) : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (modality) {
            put(route('systemconfiguration7.modalities.update', modality.id));
        } else {
            post(route('systemconfiguration7.modalities.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Modality Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">DICOM Code (e.g. CT, MR)</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" required />
                    {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-bold text-gray-700 mb-3">PACS / DICOM Interface</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500">AE Title</label>
                        <input type="text" value={data.ae_title} onChange={e => setData('ae_title', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g. GE_CT01" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500">IP Address</label>
                        <input type="text" value={data.ip_address} onChange={e => setData('ip_address', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="192.168.1.50" />
                        {errors.ip_address && <p className="text-red-500 text-xs">{errors.ip_address}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500">Port</label>
                        <input type="text" value={data.port} onChange={e => setData('port', e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="104" />
                    </div>
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="mr-2" />
                <label>Machine Active</label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration7.modalities.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {modality ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}