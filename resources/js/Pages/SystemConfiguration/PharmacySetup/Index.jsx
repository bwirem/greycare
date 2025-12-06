import React from "react";
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPrescriptionBottleAlt, // Drug Master
    faClock,                 // Frequencies
    faCalendarAlt,           // Durations
    faSyringe,               // Routes (e.g. IV/IM)
    faArrowRight 
} from '@fortawesome/free-solid-svg-icons';

export default function PharmacySetupIndex({ auth }) {
    const dashboardItems = [
        { 
            title: "Drug Master", 
            icon: faPrescriptionBottleAlt, 
            routeName: 'systemconfiguration9.drugmaster.index', 
            color: 'blue', 
            description: "Configure Strength, Volume & Formulation for Inventory Items." 
        },
        { 
            title: "Dosage Frequencies", 
            icon: faClock, 
            routeName: 'systemconfiguration9.frequencies.index', 
            color: 'green', 
            description: "Manage frequencies like OD, BID, TID and their multipliers." 
        },
        { 
            title: "Treatment Durations", 
            icon: faCalendarAlt, 
            routeName: 'systemconfiguration9.durations.index', 
            color: 'purple', 
            description: "Define durations like 5/7, 1/52 and their day values." 
        },
        { 
            title: "Administration Routes", 
            icon: faSyringe, 
            routeName: 'systemconfiguration9.routes.index', 
            color: 'red', 
            description: "Manage routes of administration (Oral, IV, IM, SC)." 
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Pharmacy Configuration</h2>}>
            <Head title="Pharmacy Setup" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardItems.map((item, idx) => (
                            <Link 
                                key={idx} 
                                href={route(item.routeName)} 
                                className={`block bg-white shadow-sm rounded-lg hover:shadow-lg transition-all duration-300 border-l-4 border-${item.color}-500 group`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 p-3 rounded-md bg-${item.color}-100 text-${item.color}-600`}>
                                            <FontAwesomeIcon icon={item.icon} size="lg" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className={`text-lg font-bold text-gray-800 group-hover:text-${item.color}-600 transition-colors`}>
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className={`text-sm font-semibold text-${item.color}-600`}>Manage</span>
                                        <FontAwesomeIcon 
                                            icon={faArrowRight} 
                                            className={`text-${item.color}-400 transform group-hover:translate-x-1 transition-transform`} 
                                        />
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