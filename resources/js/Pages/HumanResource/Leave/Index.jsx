import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faCheck, faTimes, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import Modal from '@/Components/CustomModal';

export default function Index({ auth, requests, filters, stats, flash }) {
    const { data, setData } = useForm({ 
        search: filters.search || "", 
        status: filters.status || "" 
    });
    
    // Modal State for Approve/Reject remarks
    const [actionModal, setActionModal] = useState({ isOpen: false, type: null, id: null });
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route("humanresurces5.index"), { search: data.search, status: data.status }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search, data.status]);

    const handleAction = () => {
        const routeName = actionModal.type === 'approve' ? 'humanresurces5.approve' : 'humanresurces5.reject';
        router.post(route(routeName, actionModal.id), { remarks }, {
            onSuccess: () => {
                setActionModal({ isOpen: false, type: null, id: null });
                setRemarks('');
            }
        });
    };

    const handleDelete = (id) => {
        if(confirm('Delete this request?')) {
            router.delete(route('humanresurces5.destroy', id));
        }
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Leave Management</h2>}>
            <Head title="Leave Requests" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                            <span className="text-gray-500 text-sm">Pending Approval</span>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                            <span className="text-gray-500 text-sm">Currently On Leave</span>
                            <div className="text-2xl font-bold">{stats.on_leave}</div>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                            <span className="text-gray-500 text-sm">Total Approved</span>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                        </div>
                    </div>

                    {flash?.success && <div className="p-4 bg-green-100 text-green-700 rounded">{flash.success}</div>}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" placeholder="Search Employee..." value={data.search} onChange={e => setData("search", e.target.value)} className="pl-10 rounded-md border-gray-300" />
                                </div>
                                <select value={data.status} onChange={e => setData("status", e.target.value)} className="rounded-md border-gray-300">
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <Link href={route("humanresurces5.create")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Apply Leave
                            </Link>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Employee</th>
                                    <th className="px-4 py-3 text-left">Leave Type</th>
                                    <th className="px-4 py-3 text-left">Duration</th>
                                    <th className="px-4 py-3 text-left">Days</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">{req.employee.first_name} {req.employee.last_name}</div>
                                            <div className="text-xs text-gray-500">{req.employee.employee_code}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">{req.leave_type?.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {req.start_date} <span className="mx-1">to</span> {req.end_date}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-center">{req.days_requested}</td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-4 py-4 text-center space-x-2">
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => setActionModal({ isOpen: true, type: 'approve', id: req.id })} className="text-green-600 hover:text-green-800" title="Approve">
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </button>
                                                    <button onClick={() => setActionModal({ isOpen: true, type: 'reject', id: req.id })} className="text-red-600 hover:text-red-800" title="Reject">
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                    <Link href={route('humanresurces5.edit', req.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(req.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {requests.data.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-gray-500">No requests found.</td></tr>}
                            </tbody>
                        </table>
                        <Pagination class="mt-6" links={requests.links} />
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            <Modal 
                isOpen={actionModal.isOpen} 
                onClose={() => setActionModal({ isOpen: false, type: null, id: null })} 
                onConfirm={handleAction}
                title={actionModal.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                message={
                    <div>
                        <p className="mb-2">Are you sure you want to {actionModal.type} this request?</p>
                        <textarea 
                            className="w-full border-gray-300 rounded-md text-sm" 
                            placeholder="Add remarks (optional)..." 
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        ></textarea>
                    </div>
                }
            />
        </HumanResourceLayout>
    );
}

function StatusBadge({ status }) {
    const colors = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
        Cancelled: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-semibold ${colors[status]}`}>{status}</span>;
}