import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// ADD faCloudUploadAlt
import { faSearch, faPlus, faEdit, faTrash, faHome, faStethoscope, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";

export default function IcdIndex({ auth, diagnoses, filters }) {
    const { data, setData } = useForm({ search: filters.search || "" });
    const [modal, setModal] = useState({ isOpen: false, id: null });

    const handleSearch = (e) => {
        setData("search", e.target.value);
        router.get(route("systemconfiguration5.diagnoses.index"), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const confirmDelete = () => router.delete(route("systemconfiguration5.diagnoses.destroy", modal.id), { onSuccess: () => setModal({ isOpen: false, id: null }) });

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">ICD-10 Diagnoses</h2>}>
            <Head title="ICD Diagnoses" />
            <div className="py-12 max-w-6xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between mb-6">
                        <div className="relative w-64">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" placeholder="Search ICD or Name..." value={data.search} onChange={handleSearch} className="w-full pl-10 border rounded-md" />
                        </div>
                        <div className="flex gap-2">
                            {/* IMPORT BUTTON ADDED HERE */}
                            <Link href={route("systemconfiguration5.diagnoses.import.show")} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center shadow">
                                <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2"/> Import
                            </Link>

                            <Link href={route("systemconfiguration5.diagnoses.create")} className="bg-green-600 text-white px-4 py-2 rounded flex items-center shadow">
                                <FontAwesomeIcon icon={faPlus} className="mr-2"/> Add ICD
                            </Link>
                            <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center shadow">
                                <FontAwesomeIcon icon={faHome} className="mr-2"/> Home
                            </Link>
                        </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-cyan-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {diagnoses.data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-cyan-700 font-bold">{item.code}</td>
                                    <td className="px-6 py-4 flex items-center gap-2"><FontAwesomeIcon icon={faStethoscope} className="text-gray-400"/> {item.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.group?.name || '-'}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <Link href={route("systemconfiguration5.diagnoses.edit", item.id)} className="text-blue-600"><FontAwesomeIcon icon={faEdit} /></Link>
                                        <button onClick={() => setModal({ isOpen: true, id: item.id })} className="text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination class="mt-6" links={diagnoses.links} />
                </div>
            </div>
            <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false })} onConfirm={confirmDelete} title="Delete ICD" message="Are you sure?" />
        </AuthenticatedLayout>
    );
}