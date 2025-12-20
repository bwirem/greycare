import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import BioDataForm from './Partials/BioDataForm';

export default function Create({ auth }) {
    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">New Employee</h2>}>
            <Head title="Create Employee" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="bg-yellow-50 p-4 rounded-md mb-6 text-sm text-yellow-700 border border-yellow-200">
                            <strong>Note:</strong> Start by filling out the basic information. You can add Job Details, Banking Info, and Emergency Contacts on the next screen.
                        </div>
                        <BioDataForm />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}