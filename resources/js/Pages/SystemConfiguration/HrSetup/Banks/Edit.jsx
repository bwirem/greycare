import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import BankForm from './BankForm';

export default function Edit({ auth, bank }) {
    return (
        <HumanResourceLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Bank</h2>}
        >
            <Head title={`Edit ${bank.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-900">Update Bank</h3>
                            <p className="text-sm text-gray-600">
                                Update details for <strong>{bank.name}</strong>.
                            </p>
                        </div>
                        <BankForm bank={bank} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}