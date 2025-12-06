import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faFileMedical } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function MtuhaIndex({ auth, diagnoses, type, pageTitle, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.mtuha.index", type), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.mtuha.destroy", { type, id: modalState.idToDelete }), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    // Tab Configuration
    const tabs = [
        { id: 'opd', label: 'OPD' },
        { id: 'ipd', label: 'IPD' },
        { id: 'dental', label: 'Dental' },
        { id: 'eyes', label: 'Eyes' },
    ];

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Mtuha Diagnoses</h2>}>
            <Head title={pageTitle} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                {tabs.map((tab) => (
                                    <Link
                                        key={tab.id}
                                        href={route('systemconfiguration5.mtuha.index', tab.id)}
                                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            type === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder={`Search ${type.toUpperCase()}...`}
                                    value={searchData.search} 
                                    onChange={handleSearch} 
                                    className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.mtuha.create", type)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Diagnosis
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ICD Map</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {diagnoses.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.code || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.group?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.maptocode || '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route("systemconfiguration5.mtuha.edit", { type, id: item.id })} className="text-blue-600 hover:text-blue-900">
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
                        <Pagination class="mt-6" links={diagnoses.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Diagnosis" message="Are you sure?" />
        </AuthenticatedLayout>
    );
}