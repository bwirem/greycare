import React from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Edit({ auth, leave, leaveTypes }) {
    const { data, setData, put, processing, errors } = useForm({
        leave_type_id: leave.leave_type_id,
        start_date: leave.start_date,
        end_date: leave.end_date,
        reason: leave.reason || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('humanresurces5.update', leave.id));
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Request</h2>}>
            <Head title="Edit Leave" />
            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-lg font-medium">Modify Request</h3>
                                <p className="text-sm text-gray-500">Employee: {leave.employee.first_name} {leave.employee.last_name}</p>
                            </div>
                            <Link href={route('humanresurces5.index')} className="text-sm text-gray-500 hover:text-gray-700">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Leave Type*</label>
                                <select 
                                    value={data.leave_type_id} 
                                    onChange={e => setData('leave_type_id', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    {leaveTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date*</label>
                                    <input 
                                        type="date" 
                                        value={data.start_date} 
                                        onChange={e => setData('start_date', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date*</label>
                                    <input 
                                        type="date" 
                                        value={data.end_date} 
                                        onChange={e => setData('end_date', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                <textarea 
                                    value={data.reason} 
                                    onChange={e => setData('reason', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    rows="3"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSave} className="mr-2" />}
                                    Update Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}