import React from 'react';
import { Link, useForm ,Head} from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth }) {
    const currentYear = new Date().getFullYear();
    const { data, setData, post, processing, errors } = useForm({
        year: currentYear,
        month: new Date().getMonth() + 1
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('humanresurces3.store'));
    };

    const months = [
        {id: 1, name: 'January'}, {id: 2, name: 'February'}, {id: 3, name: 'March'},
        {id: 4, name: 'April'}, {id: 5, name: 'May'}, {id: 6, name: 'June'},
        {id: 7, name: 'July'}, {id: 8, name: 'August'}, {id: 9, name: 'September'},
        {id: 10, name: 'October'}, {id: 11, name: 'November'}, {id: 12, name: 'December'},
    ];

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">New Payroll Period</h2>}>
            <Head title="Create Payroll" />
            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-medium">Select Period</h3>
                            <Link href={route('humanresurces3.index')} className="text-sm text-gray-500 hover:text-gray-700">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Month</label>
                                    <select value={data.month} onChange={e => setData('month', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        {months.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Year</label>
                                    <input type="number" value={data.year} onChange={e => setData('year', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                    {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                                Creating a payroll period initializes the bucket for this month. 
                                You will be able to generate calculations in the next step.
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                                    <FontAwesomeIcon icon={faSave} className="mr-2" /> Create Period
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}