import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faHome, faFilter } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function ParameterIndex({ auth, parameters, panels, success }) {
    const [selectedPanel, setSelectedPanel] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleFilter = (e) => {
        setSelectedPanel(e.target.value);
        router.get(route('systemconfiguration6.parameters.index'), { panel_id: e.target.value }, { preserveState: true });
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration6.parameters.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Test Parameters (Results)</h2>}>
            <Head title="Parameters" />
            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-2 w-full md:w-1/3">
                                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                                <select value={selectedPanel} onChange={handleFilter} className="w-full rounded-md border-gray-300">
                                    <option value="">Filter by Panel (All)</option>
                                    {panels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration6.parameters.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Parameter
                                </Link>
                                <Link href={route("systemconfiguration6.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Panel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {parameters.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.panel?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {item.result_type === 1 ? 'Numeric' : item.result_type === 2 ? 'Text' : 'Dropdown'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.units || '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route("systemconfiguration6.parameters.edit", item.id)} className="text-blue-600 hover:text-blue-900">
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
                        <Pagination class="mt-6" links={parameters.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Parameter" message="Are you sure?" />
        </AuthenticatedLayout>
    );
}