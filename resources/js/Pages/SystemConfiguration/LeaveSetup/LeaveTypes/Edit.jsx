import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import LeaveTypeForm from './LeaveTypeForm';

export default function Edit({ auth, type }) {
    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Leave Type</h2>}>
            <Head title="Edit Leave Type" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4 border-b pb-2">
                            <p className="text-sm text-gray-600">Update leave policy details.</p>
                        </div>
                        <LeaveTypeForm type={type} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}