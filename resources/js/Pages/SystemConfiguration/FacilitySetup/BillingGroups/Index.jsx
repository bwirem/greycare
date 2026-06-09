import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faPlus, faEdit, faTrash, faHome, 
    faShieldAlt, faCloudDownloadAlt, faList, faSpinner, faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal'; 
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function GroupIndex({ auth, groups, success, filters, errors }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    
    // State Management
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, idToDelete: null });
    const [loadState, setLoadState] = useState({ isOpen: false, group: null });
    const [isLoading, setIsLoading] = useState(false);

    // Toast Handling
    useEffect(() => { 
        if (success) toast.success(success); 
        if (errors?.error) toast.error(errors.error);
    }, [success, errors]);

    // Handlers
    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.billinggroups.index"), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    // Delete Handlers
    const handleDelete = (id) => setDeleteModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.billinggroups.destroy", deleteModalState.idToDelete), {
            onSuccess: () => setDeleteModalState({ isOpen: false, idToDelete: null }),
        });
    };

    // Load Package Handlers
    const openLoadModal = (group) => setLoadState({ isOpen: true, group: group });

    const confirmLoadPackages = () => {
        setIsLoading(true);
        router.post(route('systemconfiguration5.billinggroups.load_packages', loadState.group.id), {}, {
            onFinish: () => {
                setIsLoading(false);
                setLoadState({ isOpen: false, group: null });
            },
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Billing Groups (Payment Modes)</h2>}>
            <Head title="Billing Groups" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search groups..." 
                                    value={searchData.search} 
                                    onChange={handleSearch} 
                                    className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.billinggroups.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create Group
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group Name</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ceiling</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {groups.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                {item.isinsurance ? (
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center justify-center w-fit mx-auto">
                                                        <FontAwesomeIcon icon={faShieldAlt} className="mr-1" /> Insurance
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Cash/Standard</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                {item.hasceiling ? (item.ceilingamount > 0 ? item.ceilingamount.toLocaleString() : 'Yes') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.inactive ? 
                                                    <span className="text-red-500 text-xs font-bold bg-red-100 px-2 py-1 rounded">Inactive</span> : 
                                                    <span className="text-green-500 text-xs font-bold bg-green-100 px-2 py-1 rounded">Active</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    {/* API ACTIONS (Insurance Only) */}
                                                    {item.isinsurance && (
                                                        <>
                                                            <button
                                                                onClick={() => openLoadModal(item)}
                                                                className="text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-bold flex items-center shadow-sm transition"
                                                                title="Download Price Packages from API"
                                                            >
                                                                <FontAwesomeIcon icon={faCloudDownloadAlt} className="mr-1" /> Load
                                                            </button>
                                                            
                                                            <Link
                                                                href={route('systemconfiguration5.billinggroups.packages', item.id)}
                                                                className="text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-xs font-bold flex items-center shadow-sm transition"
                                                                title="View Loaded Packages"
                                                            >
                                                                <FontAwesomeIcon icon={faList} className="mr-1" /> View
                                                            </Link>
                                                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                                        </>
                                                    )}

                                                    <Link href={route("systemconfiguration5.billinggroups.edit", item.id)} className="text-blue-600 hover:text-blue-900">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 ml-2">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={groups.links} />
                    </div>
                </div>
            </div>
            
            {/* DELETE CONFIRMATION MODAL */}
            <Modal 
                isOpen={deleteModalState.isOpen} 
                onClose={() => setDeleteModalState({ isOpen: false, idToDelete: null })} 
                onConfirm={handleConfirmDelete} 
                title="Delete Group" 
                message="Are you sure? This may affect existing patients and billing records." 
            />

            {/* LOAD PACKAGES MODAL */}
            {loadState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
                        <div className="flex items-center mb-4 text-green-700">
                            <FontAwesomeIcon icon={faCloudDownloadAlt} size="lg" className="mr-3" />
                            <h3 className="text-lg font-bold">Load Price Packages</h3>
                        </div>

                        <div className="mb-6 text-gray-600">
                            <p className="mb-2">You are about to download the latest tariff data for:</p>
                            <p className="font-bold text-gray-800 text-lg mb-2">{loadState.group?.name}</p>
                            
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-xs text-yellow-700">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                <strong>Note:</strong> This process connects to the external API and updates the local database. It may take up to a minute depending on the data size.
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setLoadState({ isOpen: false, group: null })}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            
                            <button
                                onClick={confirmLoadPackages}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded font-bold shadow-sm flex items-center transition ${
                                    isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                        Downloading...
                                    </>
                                ) : (
                                    'Confirm & Load'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}