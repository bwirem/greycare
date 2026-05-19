import React from 'react';
import AuthenticatedLayout from '@/Layouts/MortuaryLayout';
import { Head } from '@inertiajs/react';
import MortuaryForm from './MortuaryForm';

export default function Edit({ auth, mortuary }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-slate-800">Edit Mortuary Facility</h2>}
        >
            <Head title="Edit Mortuary" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <MortuaryForm mortuary={mortuary} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}