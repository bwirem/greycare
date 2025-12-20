import React, { useEffect, useState, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faUniversity } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";

export default function Index({ auth, banks, filters, success }) {
    const { data, setData } = useForm({ search: filters.search || "" });
    const [modal, setModal] = useState({ isOpen: false, id: null });
    const searchRef = useRef(null);

    useEffect(() => {
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            router.get(route("systemconfiguration11.banks.index"), { search: data.search }, { preserveState: true, replace: true });
        }, 300);
    }, [data.search]);

    const handleDelete = () => {
        router.delete(route("systemconfiguration11.banks.destroy", modal.id), { 
            onSuccess: () => setModal({ isOpen: false, id: null }) 
        });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Banks</h2>}>
            <Head title="Banks" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/3">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search banks..." 
                                    value={data.search} 
                                    onChange={e => setData("search", e.target.value)} 
                                    className="pl-10 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration11.banks.create")} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Bank
                                </Link>
                                <Link href={route("systemconfiguration11.index")} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {banks.data.length > 0 ? (
                                        banks.data.map((bank) => (
                                            <tr key={bank.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{bank.code}</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    <FontAwesomeIcon icon={faUniversity} className="text-gray-400 mr-2" />
                                                    {bank.name}
                                                </td>
                                                <td className="px-4 py-4 text-center space-x-3">
                                                    <Link href={route("systemconfiguration11.banks.edit", bank.id)} className="text-blue-600 hover:text-blue-900">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => setModal({ isOpen: true, id: bank.id })} className="text-red-600 hover:text-red-900">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-gray-500">No banks found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={banks.links} />
                    </div>
                </div>
            </div>
            <Modal 
                isOpen={modal.isOpen} 
                onClose={() => setModal({ isOpen: false, id: null })} 
                onConfirm={handleDelete} 
                title="Delete Bank" 
                message="Are you sure you want to remove this bank from the system?" 
            />
        </HumanResourceLayout>
    );
}