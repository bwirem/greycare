import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faUserTie } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, employees, filters }) {
    const { data, setData } = useForm({ search: filters.search || "" });

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route("humanresurces0.index"), { search: data.search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search]);

    const handleDelete = (id) => {
        if(confirm("Are you sure? This will delete the employee record.")) {
            router.delete(route("humanresurces0.destroy", id));
        }
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Employee Records</h2>}>
            <Head title="Employees" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" placeholder="Search Name, ID..." value={data.search} onChange={e => setData("search", e.target.value)} className="pl-10 rounded-md border-gray-300 w-64" />
                            </div>
                            <Link href={route("humanresurces0.create")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Employee
                            </Link>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Employee</th>
                                    <th className="px-4 py-3 text-left">Job Title</th>
                                    <th className="px-4 py-3 text-left">Department</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.data.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                    {emp.photo_path ? (
                                                        <img src={`/storage/${emp.photo_path}`} alt="" className="h-full w-full object-cover"/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faUserTie} className="text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</div>
                                                    <div className="text-sm text-gray-500">{emp.employee_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">{emp.current_job?.position?.title || '-'}</td>
                                        <td className="px-4 py-4 text-sm">{emp.current_job?.department?.name || '-'}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center space-x-3">
                                            <Link href={route("humanresurces0.edit", emp.id)} className="text-blue-600 hover:text-blue-900 font-medium">Manage</Link>
                                            <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-900"><FontAwesomeIcon icon={faTrash} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination class="mt-6" links={employees.links} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}