import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faProcedures, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function RoomIndex({ auth, rooms, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.rooms.index"), 
            { search: e.target.value }, { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.rooms.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Rooms & Beds</h2>}>
            <Head title="Rooms & Beds" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search rooms..." value={searchData.search} onChange={handleSearch} className="w-full rounded-md border-gray-300 pl-10 focus:border-red-500 focus:ring-red-500" />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.rooms.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Room
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-red-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Beds</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rooms.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center">
                                                <FontAwesomeIcon icon={faDoorOpen} className="text-gray-400 mr-2" />
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                    {item.ward?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                 <span className="flex items-center justify-center gap-1 text-gray-600">
                                                    <FontAwesomeIcon icon={faProcedures} className="text-xs" /> 
                                                    {item.beds_count}
                                                 </span>
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route("systemconfiguration5.rooms.edit", item.id)} className="text-blue-600 hover:text-blue-900" title="Edit Room & Manage Beds">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" title="Delete Room">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={rooms.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Room" message="Are you sure? This will delete the room and all associated beds." />
        </AuthenticatedLayout>
    );
}