import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import PanelForm from './PanelForm';

export default function Edit({ auth, panel, categories, samples, activePriceCategories }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Test Panel</h2>}>
            <Head title={`Edit ${panel.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <PanelForm 
                            panel={panel} 
                            categories={categories} 
                            samples={samples} 
                            activePriceCategories={activePriceCategories} 
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}