import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faHome, faUserMd, faEdit, faStethoscope, faFilter, faUsers 
} from '@fortawesome/free-solid-svg-icons';
import Pagination from '@/Components/Pagination';
import { toast } from 'react-toastify';
import AssignModal from './AssignModal';

export default function DoctorAssignmentIndex({ auth, users, specializations, userGroups, filters, success }) {
    // Initialize search from filters or empty
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    
    // Initialize group filter from filters or empty
    const [selectedGroup, setSelectedGroup] = useState(filters.usergroup_id || "");
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { if (success) toast.success(success); }, [success]);

    // Handle Text Search
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchData("search", query);
        
        router.get(route("systemconfiguration5.doctor-assignment.index"), 
            { 
                search: query, 
                usergroup_id: selectedGroup // Maintain selected group
            }, 
            { preserveState: true, replace: true }
        );
    };

    // Handle User Group Filter Change
    const handleGroupChange = (e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);

        router.get(route("systemconfiguration5.doctor-assignment.index"), 
            { 
                search: searchData.search, // Maintain search text
                usergroup_id: groupId 
            }, 
            { preserveState: true, replace: true }
        );
    };

    const openAssignModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Doctor Assignments</h2>}>
            <Head title="Assign Doctors" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Filters */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            
                            {/* Filter Section */}
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-2/3">
                                {/* Search Input */}
                                <div className="relative w-full sm:w-1/2">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search users..." 
                                        value={searchData.search} 
                                        onChange={handleSearch} 
                                        className="w-full rounded-md border-gray-300 pl-10 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm" 
                                    />
                                </div>

                                {/* User Group Dropdown */}
                                <div className="relative w-full sm:w-1/2">
                                    <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedGroup}
                                        onChange={handleGroupChange}
                                        className="w-full rounded-md border-gray-300 pl-10 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                                    >
                                        <option value="">All User Groups</option>
                                        {userGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm whitespace-nowrap">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User / Doctor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Specialization</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                                                            <FontAwesomeIcon icon={faUserMd} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        <FontAwesomeIcon icon={faUsers} className="mr-1 text-gray-400" />
                                                        {user.user_group?.name || 'No Group'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.specialization ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                            <FontAwesomeIcon icon={faStethoscope} className="mr-1.5" />
                                                            {user.specialization.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">General / Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button 
                                                        onClick={() => openAssignModal(user)} 
                                                        className="text-emerald-600 hover:text-emerald-900 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} /> Assign
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                No users found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={users.links} />
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AssignModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={selectedUser} 
                specializations={specializations} 
            />
        </AuthenticatedLayout>
    );
}