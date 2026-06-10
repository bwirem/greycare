import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faSpinner,
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';

export default function Form({ registrationType = null }) {

    const { data, setData, post, put, processing, errors } = useForm({
        code: registrationType?.CODE || '',
        description: registrationType?.description || '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (registrationType) {
            put(
                route(
                    'systemconfiguration17.registrationtypes.update',
                    registrationType.autocode
                )
            );
        } else {
            post(route('systemconfiguration17.registrationtypes.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">

            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">

                <h3 className="text-sm font-bold text-slate-700 uppercase border-b pb-2 mb-4">
                    <FontAwesomeIcon
                        icon={faClipboardList}
                        className="mr-2 text-slate-400"
                    />
                    Registration Type Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Code *
                        </label>

                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />

                        {errors.code && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.code}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Description *
                        </label>

                        <input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />

                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.description}
                            </p>
                        )}
                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">

                <Link
                    href={route('systemconfiguration17.registrationtypes.index')}
                    className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded"
                >
                    Cancel
                </Link>

                <button
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                        <FontAwesomeIcon icon={faSave} />
                    )}

                    {registrationType
                        ? 'Update Registration Type'
                        : 'Save Registration Type'}
                </button>

            </div>

        </form>
    );
}