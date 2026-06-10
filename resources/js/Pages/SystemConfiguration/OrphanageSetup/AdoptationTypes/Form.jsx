import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faSpinner,
    faPeopleArrows
} from '@fortawesome/free-solid-svg-icons';

export default function Form({ adoptationType = null }) {

    const { data, setData, post, put, processing, errors } = useForm({
        code: adoptationType?.CODE || '',
        description: adoptationType?.description || '',
        orphanagetoorphanages: adoptationType?.orphanagetoorphanages || 0,
        orphanagetoadoptiveparent: adoptationType?.orphanagetoadoptiveparent || 0,
    });

    const submit = (e) => {
        e.preventDefault();

        if (adoptationType) {
            put(route('systemconfiguration17.adoptationtypes.update', adoptationType.autocode));
        } else {
            post(route('systemconfiguration17.adoptationtypes.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">

            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">

                <h3 className="text-sm font-bold text-slate-700 uppercase border-b pb-2 mb-4">
                    <FontAwesomeIcon icon={faPeopleArrows} className="mr-2 text-slate-400" />
                    Adoption Type Details
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
                            className="mt-1 block w-full rounded-md border-slate-300"
                        />

                        {errors.code &&
                            <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                        }
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Description *
                        </label>

                        <input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300"
                        />

                        {errors.description &&
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        }
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.orphanagetoorphanages == 1}
                            onChange={(e) =>
                                setData('orphanagetoorphanages', e.target.checked ? 1 : 0)
                            }
                            className="rounded border-slate-300"
                        />

                        <label className="ml-2 text-sm text-slate-700">
                            Orphanage To Orphanage
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.orphanagetoadoptiveparent == 1}
                            onChange={(e) =>
                                setData('orphanagetoadoptiveparent', e.target.checked ? 1 : 0)
                            }
                            className="rounded border-slate-300"
                        />

                        <label className="ml-2 text-sm text-slate-700">
                            Orphanage To Adoptive Parent
                        </label>
                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">

                <Link
                    href={route('systemconfiguration17.adoptationtypes.index')}
                    className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded"
                >
                    Cancel
                </Link>

                <button
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
                >
                    {processing
                        ? <FontAwesomeIcon icon={faSpinner} spin />
                        : <FontAwesomeIcon icon={faSave} />
                    }

                    {adoptationType
                        ? 'Update Adoption Type'
                        : 'Save Adoption Type'}
                </button>

            </div>

        </form>
    );
}