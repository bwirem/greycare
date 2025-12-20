import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import InsuranceForm from './InsuranceForm';

export default function Edit({ auth, insurance }) {
    return (
        <HumanResourceLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Insurance Type</h2>}
        >
            <Head title={`Edit ${insurance.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4 border-b pb-2">
                            <p className="text-sm text-gray-600">Update insurance policy rates.</p>
                        </div>
                        <InsuranceForm insurance={insurance} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}