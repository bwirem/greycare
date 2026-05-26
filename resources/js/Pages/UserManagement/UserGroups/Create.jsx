import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Modal from '@/Components/CustomModal';

export default function Create({ auth, staffCategories = [] }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        name: '',      
        staffcategory: '', 
    });

    const [modalState, setModalState] = useState({ isOpen: false, message: '', isAlert: false });
    const [isSaving, setIsSaving] = useState(false);

    const handleModalClose = () => setModalState({ isOpen: false, message: '', isAlert: false });
    const showAlert = (message) => setModalState({ isOpen: true, message, isAlert: true });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        post(route('usermanagement.usergroups.store'), {
            onSuccess: () => {
                setIsSaving(false);
                reset();
                showAlert('Role created successfully!');
            },
            onError: () => {
                setIsSaving(false);
                showAlert('An error occurred while saving.');
            },
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth?.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Role</h2>}
        >
            <Head title="New Role" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                                
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Role Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="e.g. Senior Nurse"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>                                                          

                                <div>
                                    <label htmlFor="staffcategory" className="block text-sm font-medium text-gray-700">Staff Category</label>
                                    <select
                                        id="staffcategory"
                                        value={data.staffcategory}
                                        onChange={(e) => setData('staffcategory', e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 ${errors.staffcategory ? 'border-red-500' : ''}`}
                                    >
                                        <option value="" disabled>Select a Category...</option>
                                        {/* Safely map categories */}
                                        {staffCategories?.map((category) => (
                                            <option key={category?.id} value={category?.id}>
                                                {category?.name || "Unknown"}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.staffcategory && <p className="text-sm text-red-600 mt-1">{errors.staffcategory}</p>}
                                </div>

                            </div>
                                                    
                            <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
                                <Link
                                    href={route('usermanagement.usergroups.index')} 
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || isSaving}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>{isSaving ? 'Saving...' : 'Save Role'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Modal isOpen={modalState.isOpen} onClose={handleModalClose} title="Alert" message={modalState.message} isAlert={true} />
        </AuthenticatedLayout>
    );
}