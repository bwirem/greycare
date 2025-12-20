import React, { useState } from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head } from '@inertiajs/react';
import BioDataForm from './Partials/BioDataForm';
import JobDetailsForm from './Partials/JobDetailsForm';
import BankingForm from './Partials/BankingForm';
import ContactList from './Partials/ContactList';

export default function Edit({ auth, employee, departments, positions, banks }) {
    const [activeTab, setActiveTab] = useState('bio');

    const tabs = [
        { id: 'bio', label: 'Bio Data' },
        { id: 'job', label: 'Job & Salary' },
        { id: 'banking', label: 'Banking Info' },
        { id: 'contacts', label: 'Contacts' },
    ];

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Manage Employee: {employee.first_name}</h2>}>
            <Head title={`Edit ${employee.first_name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        
                        {/* Tab Headers */}
                        <div className="border-b border-gray-200 flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                                        activeTab === tab.id 
                                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'bio' && <BioDataForm employee={employee} />}
                            
                            {activeTab === 'job' && (
                                <JobDetailsForm 
                                    employee={employee} 
                                    departments={departments} 
                                    positions={positions} 
                                />
                            )}
                            
                            {activeTab === 'banking' && (
                                <BankingForm 
                                    employee={employee} 
                                    banks={banks} 
                                />
                            )}
                            
                            {activeTab === 'contacts' && (
                                <ContactList 
                                    employee={employee} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}