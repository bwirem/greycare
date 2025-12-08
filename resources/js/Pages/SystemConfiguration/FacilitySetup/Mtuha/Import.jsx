import React from 'react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faDownload, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function MtuhaImport({ auth, type, pageTitle, flash }) {
    const { data, setData, post, progress, processing, errors } = useForm({
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('systemconfiguration5.mtuha.import.store', type));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">{pageTitle}</h2>}>
            <Head title={`Import ${type.toUpperCase()}`} />

            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                    
                    {/* Header / Download Template */}
                    <div className="flex justify-between items-center mb-6">
                        <a href={route('systemconfiguration5.mtuha.index', type)} className="text-gray-500 hover:text-gray-700">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-1"/> Back
                        </a>
                        <a href={route('systemconfiguration5.mtuha.template', type)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                            <FontAwesomeIcon icon={faDownload} className="mr-2"/> Download Template
                        </a>
                    </div>

                    {/* Import Errors Display */}
                    {flash?.import_errors && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="font-bold text-red-700">Import Failed</p>
                            <ul className="list-disc pl-5 text-sm text-red-600 mt-2 max-h-40 overflow-y-auto">
                                {flash.import_errors.map((err, idx) => (
                                    <li key={idx}>
                                        Row {err.row}: {Object.values(err.errors).flat().join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition-colors">
                        <div className="space-y-2">
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">Upload Excel File</h3>
                            <p className="text-sm text-gray-500">Supported formats: .xlsx, .xls, .csv</p>
                        </div>

                        <div className="flex justify-center">
                            <input 
                                type="file" 
                                accept=".xlsx, .xls, .csv"
                                onChange={e => setData('file', e.target.files[0])}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>
                        {errors.file && <div className="text-red-500 text-sm">{errors.file}</div>}
                        
                        {progress && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={processing || !data.file} 
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Import Data'}
                        </button>
                    </form>

                    <div className="mt-6 text-sm text-gray-500">
                        <h4 className="font-bold">Instructions:</h4>
                        <ul className="list-disc list-inside mt-2">
                            <li>Download the template first.</li>
                            <li><strong>group</strong> column: Enter category name (e.g., 'Infectious Diseases'). It will be created if missing.</li>
                            <li><strong>icd_map</strong> column: Enter code (e.g., 'B50.0').</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}