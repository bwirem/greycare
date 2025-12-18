import React from "react";
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCut, faTags, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function TheatreSetupIndex({ auth }) {
    const dashboardItems = [
        { 
            title: "Procedure Groups", 
            icon: faTags, 
            routeName: 'systemconfiguration8.groups.index', 
            color: 'orange', 
            description: "Categorize surgeries (Major, Minor, General)." 
        },
        { 
            title: "Procedures", 
            icon: faCut, 
            routeName: 'systemconfiguration8.procedures.index', 
            color: 'red', 
            description: "Manage specific operations and pricing." 
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Theatre Configuration</h2>}>
            <Head title="Theatre Setup" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardItems.map(item => (
                            <Link key={item.title} href={route(item.routeName)} className={`block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow border-l-4 border-${item.color}-500`}>
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 bg-${item.color}-500 rounded-md p-3 shadow`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="ml-5">
                                            <p className="text-lg font-semibold text-gray-800">{item.title}</p>
                                            <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-sm font-medium text-gray-600">
                                        Manage {item.title} <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}