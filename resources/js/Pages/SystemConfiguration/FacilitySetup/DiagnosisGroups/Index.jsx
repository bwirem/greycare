import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout"; // Use your layout
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faTags } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";

export default function GroupIndex({ auth, groups, filters }) {
    const { data, setData } = useForm({ search: filters.search || "" });
    const [modal, setModal] = useState({ isOpen: false, id: null });

    const handleSearch = (e) => {
        setData("search", e.target.value);
        router.get(route("systemconfiguration5.diagnosisgroups.index"), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const confirmDelete = () => router.delete(route("systemconfiguration5.diagnosisgroups.destroy", modal.id), { onSuccess: () => setModal({ isOpen: false, id: null }) });

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Diagnosis Groups</h2>}>
            <Head title="Diagnosis Groups" />
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between mb-6">
                        <div className="relative w-64">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" placeholder="Search..." value={data.search} onChange={handleSearch} className="w-full pl-10 border rounded-md" />
                        </div>
                        <div className="flex gap-2">
                             <Link href={route("systemconfiguration5.diagnosisgroups.create")} className="bg-green-600 text-white px-4 py-2 rounded flex items-center"><FontAwesomeIcon icon={faPlus} className="mr-2"/> Add Group</Link>
                             <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><FontAwesomeIcon icon={faHome} className="mr-2"/> Home</Link>
                        </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-green-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {groups.data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-2"><FontAwesomeIcon icon={faTags} className="text-green-500"/>{item.name}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <Link href={route("systemconfiguration5.diagnosisgroups.edit", item.id)} className="text-blue-600"><FontAwesomeIcon icon={faEdit} /></Link>
                                        <button onClick={() => setModal({ isOpen: true, id: item.id })} className="text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination class="mt-6" links={groups.links} />
                </div>
            </div>
            <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false })} onConfirm={confirmDelete} title="Delete Group" message="Are you sure?" />
        </AuthenticatedLayout>
    );
}