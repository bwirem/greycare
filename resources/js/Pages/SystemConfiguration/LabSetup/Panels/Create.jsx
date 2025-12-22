import React from 'react';
import AuthenticatedLayout from '@/Layouts/ResourceLayout'; // Assumed ResourceLayout based on your Product example
import { Head } from '@inertiajs/react';
import PanelForm from './PanelForm';

export default function Create({ auth, categories, samples, activePriceCategories }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Create Test Panel</h2>}>
            <Head title="Create Panel" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <PanelForm 
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