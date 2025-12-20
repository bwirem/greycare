import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faHome, faInfinity } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';

export default function Index({ auth, brackets, success }) {
    const [modal, setModal] = useState({ isOpen: false, id: null });

    const handleDelete = () => {
        router.delete(route("systemconfiguration12.tax.destroy", modal.id), { 
            onSuccess: () => setModal({ isOpen: false, id: null }) 
        });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">PAYE Tax Brackets</h2>}>
            <Head title="Tax Brackets" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Configured Bands</h3>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration12.tax.create")} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Band
                                </Link>
                                <Link href={route("systemconfiguration12.index")} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                                </Link>
                            </div>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lower Limit</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upper Limit</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate (%)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fixed Amount</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {brackets.data.map((band) => (
                                    <tr key={band.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm">{parseFloat(band.lower_limit).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                                            {band.upper_limit ? parseFloat(band.upper_limit).toLocaleString() : <FontAwesomeIcon icon={faInfinity} />}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-red-600">{band.rate}%</td>
                                        <td className="px-4 py-4 text-sm">{parseFloat(band.fixed_amount).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-center space-x-3">
                                            <Link href={route("systemconfiguration12.tax.edit", band.id)} className="text-blue-600"><FontAwesomeIcon icon={faEdit} /></Link>
                                            <button onClick={() => setModal({ isOpen: true, id: band.id })} className="text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, id: null })} onConfirm={handleDelete} title="Delete Tax Band" message="Are you sure?" />
        </HumanResourceLayout>
    );
}