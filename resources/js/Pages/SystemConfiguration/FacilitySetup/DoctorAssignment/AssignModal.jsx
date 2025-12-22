import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal'; // Assuming you have a generic Modal wrapper, or use the one below
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faTimes, faUserMd } from '@fortawesome/free-solid-svg-icons';

export default function AssignModal({ isOpen, onClose, user, specializations }) {
    const { data, setData, put, processing, reset } = useForm({
        specialization_id: user?.specialization_id || '',
    });

    // Update form data when user changes
    React.useEffect(() => {
        setData('specialization_id', user?.specialization_id || '');
    }, [user]);

    const submit = (e) => {
        e.preventDefault();
        put(route('systemconfiguration5.doctor-assignment.update', user.id), {
            onSuccess: () => {
                onClose();
                reset();
            }
        });
    };

    if (!user) return null;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserMd} className="text-emerald-600" />
                        Assign Specialization
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">Doctor:</p>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <form onSubmit={submit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Specialization</label>
                        <select
                            value={data.specialization_id}
                            onChange={(e) => setData('specialization_id', e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">-- General / None --</option>
                            {specializations.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            This determines the consultation charges (New vs Revisit) for this doctor.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                            Save Assignment
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}