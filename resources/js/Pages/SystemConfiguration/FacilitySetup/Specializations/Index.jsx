import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faPlus, faEdit, faTrash, faHome, faUserMd, faMoneyBillWave 
} from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function SpecializationIndex({ auth, specializations, filters, success }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.specializations.index"), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.specializations.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Doctor Specializations</h2>}>
            <Head title="Specializations" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Actions */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchData.search} 
                                    onChange={handleSearch} 
                                    className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.specializations.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow-sm">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Revisit Days</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Case Charge</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revisit Charge</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {specializations.data.length > 0 ? (
                                        specializations.data.map((spec) => {
                                            // Helper to find rules safely
                                            const newRule = spec.charge_rules?.find(r => r.visit_type === 'new');
                                            const revisitRule = spec.charge_rules?.find(r => r.visit_type === 'revisit');

                                            return (
                                                <tr key={spec.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mr-3">
                                                                <FontAwesomeIcon icon={faUserMd} />
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">{spec.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold border">
                                                            {spec.revisit_days} Days
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{newRule?.bill_item?.name || 'Not Set'}</span>
                                                            <span className="text-xs text-gray-400">
                                                                {newRule?.bill_item ? parseFloat(newRule.bill_item.price1).toLocaleString() : '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{revisitRule?.bill_item?.name || 'Not Set'}</span>
                                                            <span className="text-xs text-gray-400">
                                                                {revisitRule?.bill_item ? parseFloat(revisitRule.bill_item.price1).toLocaleString() : '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center space-x-4">
                                                        <Link href={route("systemconfiguration5.specializations.edit", spec.id)} className="text-blue-600 hover:text-blue-900">
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(spec.id)} className="text-red-600 hover:text-red-900">
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                No specializations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={specializations.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Specialization" message="Are you sure? This will remove pricing rules associated with it." />
        </AuthenticatedLayout>
    );
}