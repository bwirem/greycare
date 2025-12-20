import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import Modal from '@/Components/CustomModal';

export default function Index({ auth, types, filters, success }) {
    const { data, setData } = useForm({ search: filters.search || "" });
    const [modal, setModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route("systemconfiguration13.leavetypes.index"), { search: data.search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search]);

    const handleDelete = () => {
        router.delete(route("systemconfiguration13.leavetypes.destroy", modal.id), { 
            onSuccess: () => setModal({ isOpen: false, id: null }) 
        });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Leave Types</h2>}>
            <Head title="Leave Types" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>}
                    
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={data.search} 
                                    onChange={e => setData("search", e.target.value)} 
                                    className="pl-10 rounded-md border-gray-300 w-64" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration13.leavetypes.create")} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Type
                                </Link>
                                <Link href={route("systemconfiguration13.index")} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                                </Link>
                            </div>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Days Allowed (Yearly)</th>
                                    <th className="px-4 py-3 text-left">Description</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {types.data.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 font-medium text-gray-900">{type.name}</td>
                                        <td className="px-4 py-4">{type.days_per_year}</td>
                                        <td className="px-4 py-4 text-gray-500 text-sm truncate max-w-xs">{type.description || '-'}</td>
                                        <td className="px-4 py-4 text-center space-x-3">
                                            <Link href={route("systemconfiguration13.leavetypes.edit", type.id)} className="text-blue-600 hover:text-blue-800">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Link>
                                            <button onClick={() => setModal({ isOpen: true, id: type.id })} className="text-red-600 hover:text-red-800">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {types.data.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-gray-500">No leave types found.</td></tr>}
                            </tbody>
                        </table>
                        <Pagination class="mt-6" links={types.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, id: null })} onConfirm={handleDelete} title="Delete Leave Type" message="Are you sure? This cannot be undone." />
        </HumanResourceLayout>
    );
}