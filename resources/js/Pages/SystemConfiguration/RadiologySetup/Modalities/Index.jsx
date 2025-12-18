import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faHome } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";

export default function ModalityIndex({ auth, modalities }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Modalities (Machines)</h2>}>
            <Head title="Modalities" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Machine List</h3>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration7.modalities.create")} className="bg-green-600 text-white px-4 py-2 rounded flex items-center"><FontAwesomeIcon icon={faPlus} className="mr-2"/> Add Machine</Link>
                                <Link href={route("systemconfiguration7.index")} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><FontAwesomeIcon icon={faHome} className="mr-2"/> Home</Link>
                            </div>
                        </div>
                        <div className="overflow-x-auto border rounded">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AE Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP:Port</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalities.data.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{m.name}</td>
                                            <td className="px-6 py-4">{m.code}</td>
                                            <td className="px-6 py-4 text-gray-500">{m.ae_title || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{m.ip_address ? `${m.ip_address}:${m.port}` : '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route('systemconfiguration7.modalities.edit', m.id)} className="text-blue-600"><FontAwesomeIcon icon={faEdit} /></Link>
                                                {/* Add Delete Button logic here similar to other modules */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={modalities.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}