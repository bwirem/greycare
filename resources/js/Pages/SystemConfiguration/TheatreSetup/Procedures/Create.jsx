import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import ProcedureForm from './ProcedureForm';

export default function Create({ auth, groups, activePriceCategories }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Add Procedure</h2>}
        >
            <Head title="Add Procedure" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <ProcedureForm 
                            groups={groups} 
                            activePriceCategories={activePriceCategories} 
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}