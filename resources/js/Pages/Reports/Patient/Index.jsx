import AuthenticatedLayout from '@/Layouts/FinanceLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserInjured, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function PatientSearch({ auth, results, filters }) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        // Use the route defined in DoctorReportsController
        get(route('reports.doctor.patient_history'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Patient History Search</h2>}>
            <Head title="Search Patient" />
            <div className="py-12 max-w-4xl mx-auto px-4">
                
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                    <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faUserInjured} className="text-4xl text-indigo-500 dark:text-indigo-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Find Patient Record</h3>
                    
                    <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Enter Name, File No, or Phone..." 
                            value={data.search}
                            onChange={e => setData('search', e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </form>
                </div>

                {results.length > 0 && (
                    <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">File No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {results.map((patient) => (
                                    <tr key={patient.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-indigo-600 dark:text-indigo-400 font-bold">{patient.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">{patient.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{patient.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{patient.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                href={route('reports.doctor.patient_history.show', patient.code)} 
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-end"
                                            >
                                                View History <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}