import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faCheck, faTimes, faShieldAlt,faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function GroupIndex({ auth, groups, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.billinggroups.index"), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.billinggroups.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Billing Groups (Payment Modes)</h2>}>
            <Head title="Billing Groups" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
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

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
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
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.code || '-'}</td>
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
                                            <td className="px-6 py-4 text-center space-x-4">
                                                {/* NEW BUTTON: Only for Insurance Groups */}
                                                {item.isinsurance && (
                                                    <Link
                                                        href={route('systemconfiguration5.billinggroups.load_packages', item.id)}
                                                        method="post"
                                                        as="button"
                                                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                        title="Download Price Packages"
                                                        onStart={() => confirm("This might take a minute. Continue?")}
                                                    >
                                                        <FontAwesomeIcon icon={faCloudDownloadAlt} /> Load Pkgs
                                                    </Link>
                                                )}
                                                <Link href={route("systemconfiguration5.billinggroups.edit", item.id)} className="text-blue-600 hover:text-blue-900">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
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
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Group" message="Are you sure? This may affect existing patients." />
        </AuthenticatedLayout>
    );
}