import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faDoorClosed, faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function RoomIndex({ auth, rooms, success, filters, errors }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { 
        if (success) toast.success(success); 
        if (errors?.error) toast.error(errors.error);
    }, [success, errors]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration16.rooms.index"), 
            { search: e.target.value }, { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration16.rooms.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-slate-800">Mortuary Rooms & Cabinets</h2>}>
            <Head title="Mortuary Rooms" />
            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search rooms..." value={searchData.search} onChange={handleSearch} className="w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration16.rooms.create")} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Room
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Room Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mortuary Facility</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Total Cabinets</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Daily Charge</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {rooms.data.length > 0 ? (
                                        rooms.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center">
                                                    <FontAwesomeIcon icon={faDoorClosed} className="text-slate-400 mr-2" />
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-slate-200">
                                                        {item.mortuary?.name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="flex items-center justify-center gap-1 text-slate-600">
                                                        <FontAwesomeIcon icon={faBoxArchive} className="text-xs text-indigo-400" /> 
                                                        {item.cabinets_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                                    {item.bls_item 
                                                        ? parseFloat(item.bls_item.price1).toLocaleString(undefined, {minimumFractionDigits: 2}) 
                                                        : <span className="text-slate-400 text-xs italic">Not Set</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <Link href={route("systemconfiguration16.rooms.edit", item.id)} className="text-indigo-600 hover:text-indigo-900" title="Edit Room & Prices">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" title="Delete Room">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-500">No rooms found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={rooms.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Room" message="Are you sure? This will delete the room. You can only do this if it contains no cabinets." />
        </AuthenticatedLayout>
    );
}