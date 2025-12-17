import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowLeft, faBoxOpen, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import Pagination from '@/Components/Pagination';

export default function Packages({ auth, group, packages, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('systemconfiguration5.billinggroups.packages', group.id), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Price Packages: {group.name}</h2>}>
            <Head title={`Packages - ${group.name}`} />
            
            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    
                    {/* Header / Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <Link 
                            href={route('systemconfiguration5.billinggroups.index')} 
                            className="text-gray-600 hover:text-gray-900 flex items-center font-medium"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Groups
                        </Link>

                        <form onSubmit={handleSearch} className="relative w-full md:w-96">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search Item Name or Code..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </form>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center">
                        <div className="mr-4 bg-blue-200 p-3 rounded-full text-blue-700">
                            <FontAwesomeIcon icon={faBoxOpen} size="lg" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Items Loaded</p>
                            <p className="text-2xl font-bold text-gray-800">{packages.total}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Scheme ID</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Price (TZS)</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Restriction</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {packages.data.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No packages found. Try loading them first.</td></tr>
                                ) : (
                                    packages.data.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{pkg.item_code}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{pkg.item_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.scheme_id || 'All'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">
                                                {parseFloat(pkg.unit_price).toLocaleString('en-TZ', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {pkg.is_restricted ? (
                                                    <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold inline-flex items-center">
                                                        <FontAwesomeIcon icon={faLock} className="mr-1" /> Restricted
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold inline-flex items-center">
                                                        <FontAwesomeIcon icon={faUnlock} className="mr-1" /> Open
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <Pagination links={packages.links} />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}