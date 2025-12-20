import React from 'react';
import { Link, useForm ,Head} from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth, employees }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '',
        attendance_date: new Date().toISOString().split('T')[0],
        clock_in: '',
        clock_out: '',
        status: 'Present',
        remarks: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('humanresurces1.store'), {
            onSuccess: () => reset()
        });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Manual Attendance Entry</h2>}>
            <Head title="Add Attendance" />
            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-medium">Record Details</h3>
                            <Link href={route('humanresurces1.index')} className="text-sm text-gray-500 hover:text-gray-700">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee*</label>
                                <select 
                                    value={data.employee_id} 
                                    onChange={e => setData('employee_id', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} ({emp.employee_code})
                                        </option>
                                    ))}
                                </select>
                                {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date*</label>
                                <input 
                                    type="date" 
                                    value={data.attendance_date} 
                                    onChange={e => setData('attendance_date', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                />
                                {errors.attendance_date && <p className="text-red-500 text-xs mt-1">{errors.attendance_date}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time In (24h)</label>
                                    <input 
                                        type="time" 
                                        value={data.clock_in} 
                                        onChange={e => setData('clock_in', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time Out (24h)</label>
                                    <input 
                                        type="time" 
                                        value={data.clock_out} 
                                        onChange={e => setData('clock_out', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                    {errors.clock_out && <p className="text-red-500 text-xs mt-1">{errors.clock_out}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select 
                                    value={data.status} 
                                    onChange={e => setData('status', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">On Leave</option>
                                    <option value="Holiday">Holiday</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                <textarea 
                                    value={data.remarks} 
                                    onChange={e => setData('remarks', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    rows="3"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSave} className="mr-2" />}
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}