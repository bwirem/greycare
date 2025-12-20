import React from 'react';
import { Link, useForm, Head} from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileCsv, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Import({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        file: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('humanresurces1.import.store'));
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Import Attendance</h2>}>
            <Head title="Import Attendance" />
            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-medium">Upload File</h3>
                            <Link href={route('humanresurces1.index')} className="text-sm text-gray-500 hover:text-gray-700">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back
                            </Link>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                            <p className="text-sm text-blue-700">
                                Upload a CSV or Excel file containing attendance logs. <br/>
                                <strong>Required Columns:</strong> EmployeeCode, Date, TimeIn, TimeOut.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition">
                                <FontAwesomeIcon icon={faFileCsv} className="text-4xl text-gray-400 mb-4" />
                                <div className="space-y-1">
                                    <label htmlFor="file-upload" className="cursor-pointer text-indigo-600 hover:text-indigo-500 font-medium">
                                        <span>Click to Upload a file</span>
                                        <input 
                                            id="file-upload" 
                                            name="file-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            onChange={e => setData('file', e.target.files[0])}
                                            accept=".csv, .xlsx, .xls"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500">CSV, XLS, XLSX up to 10MB</p>
                                </div>
                                {data.file && (
                                    <p className="mt-4 text-sm text-gray-700 font-semibold">
                                        Selected: {data.file.name}
                                    </p>
                                )}
                            </div>
                            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={processing || !data.file} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center">
                                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                    {processing ? 'Uploading...' : 'Upload & Process'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}