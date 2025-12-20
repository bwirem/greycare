import React, { useEffect } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faCog, faCheckCircle, faLock } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, periods, filters, flash }) {
    const { data, setData } = useForm({ search: filters.search || "" });
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route("humanresurces3.index"), { search: data.search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search]);

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Payroll Periods</h2>}>
            <Head title="Payroll" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{flash.success}</div>}
                    
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" placeholder="Search Month..." value={data.search} onChange={e => setData("search", e.target.value)} className="pl-10 rounded-md border-gray-300" />
                            </div>
                            <Link href={route("humanresurces3.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Period
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Period Name</th>
                                        <th className="px-4 py-3 text-left">Start Date</th>
                                        <th className="px-4 py-3 text-left">End Date</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {periods.data.map((period) => (
                                        <tr key={period.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 font-medium text-gray-900">{period.name}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{period.start_date}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{period.end_date}</td>
                                            <td className="px-4 py-4 text-center">
                                                <StatusBadge status={period.status} />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Link href={route("humanresurces3.manage", period.id)} className="text-blue-600 hover:text-blue-900 font-medium">
                                                    <FontAwesomeIcon icon={faCog} className="mr-1" /> Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {periods.data.length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-6 text-gray-500">No payroll periods found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={periods.links} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}

function StatusBadge({ status }) {
    const styles = {
        Draft: 'bg-gray-100 text-gray-800',
        Processing: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-blue-100 text-blue-800',
        Paid: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-semibold ${styles[status]}`}>{status}</span>;
}