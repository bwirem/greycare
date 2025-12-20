import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import SocialSecurityForm from './SocialSecurityForm';

export default function Create({ auth }) {
    return (
        <HumanResourceLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Social Security Type</h2>}
        >
            <Head title="Create NSSF Type" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4 border-b pb-2">
                            <p className="text-sm text-gray-600">Add a new statutory deduction type (e.g. NSSF).</p>
                        </div>
                        <SocialSecurityForm />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}