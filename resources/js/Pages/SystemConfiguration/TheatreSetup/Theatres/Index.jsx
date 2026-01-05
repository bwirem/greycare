import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faDoorOpen, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Pagination from '@/Components/Pagination';

export default function TheatreIndex({ auth, theatres }) {
    
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this theatre?')) {
            router.delete(route('systemconfiguration8.theatres.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Theatres Management</h2>}>
            <Head title="Theatres" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <FontAwesomeIcon icon={faDoorOpen} className="text-gray-400"/> List of Theatres
                            </h3>
                            <Link href={route('systemconfiguration8.theatres.create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 text-sm">
                                <FontAwesomeIcon icon={faPlus} /> Add Theatre
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {theatres.data.length > 0 ? (
                                        theatres.data.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{t.name}</div>
                                                    <div className="text-xs text-gray-500">{t.code || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {t.location && (
                                                        <div className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-300"/>
                                                            {t.location}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {t.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('systemconfiguration8.theatres.edit', t.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                                    </Link>
                                                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900">
                                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No theatres found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            <Pagination links={theatres.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}