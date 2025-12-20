import React, { useEffect, useState, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";

export default function Index({ auth, departments, filters, success }) {
    const { data, setData } = useForm({ search: filters.search || "" });
    const [modal, setModal] = useState({ isOpen: false, id: null });
    const searchRef = useRef(null);

    useEffect(() => {
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            router.get(route("systemconfiguration11.departments.index"), { search: data.search }, { preserveState: true, replace: true });
        }, 300);
    }, [data.search]);

    const handleDelete = () => {
        router.delete(route("systemconfiguration11.departments.destroy", modal.id), { onSuccess: () => setModal({ isOpen: false, id: null }) });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Departments</h2>}>
            <Head title="Departments" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" placeholder="Search..." value={data.search} onChange={e => setData("search", e.target.value)} className="pl-10 rounded-md border-gray-300" />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration11.departments.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"><FontAwesomeIcon icon={faPlus} /> Create</Link>
                                <Link href={route("systemconfiguration11.index")} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"><FontAwesomeIcon icon={faHome} /> Back</Link>
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {departments.data.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm font-medium">{dept.code}</td>
                                        <td className="px-4 py-4 text-sm">{dept.name}</td>
                                        <td className="px-4 py-4 text-center space-x-4">
                                            <Link href={route("systemconfiguration11.departments.edit", dept.id)} className="text-blue-600"><FontAwesomeIcon icon={faEdit} /></Link>
                                            <button onClick={() => setModal({ isOpen: true, id: dept.id })} className="text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination class="mt-6" links={departments.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, id: null })} onConfirm={handleDelete} title="Delete Department" message="Are you sure?" />
        </HumanResourceLayout>
    );
}