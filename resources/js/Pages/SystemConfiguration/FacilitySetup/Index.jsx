import React from "react";
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLayerGroup,       // Facility Options
    faUsers,            // Billing Groups
    faSitemap,          // Subgroups
    faClinicMedical,    // Treatment Points
    faListAlt,          // Other
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function FacilitySetupIndex({ 
    auth, 
    facilityOptionCount = 0,
    billingGroupCount = 0,
    billingSubGroupCount = 0,
    treatmentPointCount = 0,
    otherOptionCount = 0
}) {
    // Define dashboard items configuration
    const dashboardItems = [
        { 
            title: "Facility Options", 
            count: facilityOptionCount, 
            icon: faLayerGroup, 
            routeName: 'systemconfiguration5.facilityoptions.index', 
            color: 'purple', 
            description: "General facility settings and global configurations." 
        },
        { 
            title: "Billing Groups", 
            count: billingGroupCount, 
            icon: faUsers, 
            routeName: 'systemconfiguration5.billinggroups.index', 
            color: 'blue', 
            description: "Manage Corporate clients, Insurance companies, and Cash schemes." 
        },
        { 
            title: "Billing Subgroups", 
            count: billingSubGroupCount, 
            icon: faSitemap, 
            routeName: 'systemconfiguration5.billingsubgroups.index', 
            color: 'indigo', 
            description: "Specific insurance plans or corporate schemes." 
        },
        { 
            title: "Treatment Points", 
            count: treatmentPointCount, 
            icon: faClinicMedical, 
            routeName: 'systemconfiguration5.treatmentpoints.index', 
            color: 'teal', 
            description: "Manage Clinics, Wards, and Service Delivery points." 
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Facility Setup Dashboard
                </h2>
            }
        >
            <Head title="Facility Setup" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Grid Layout: 2 columns on medium screens, 3 on large */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Mapped Dynamic Cards */}
                        {dashboardItems.map((item, index) => (
                            <Link
                                key={index}
                                href={route(item.routeName)}
                                className={`block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group border-l-4 border-${item.color}-500`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 bg-${item.color}-500 rounded-md p-3 shadow`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dt>
                                                <p className={`text-lg font-semibold text-gray-800 group-hover:text-${item.color}-600 transition-colors duration-300`}>
                                                    {item.title}
                                                </p>
                                            </dt>
                                            <dd className="flex items-baseline">
                                                <p className={`text-3xl font-bold text-${item.color}-600`}>
                                                    {item.count}
                                                </p>
                                                <p className="ml-2 text-sm font-medium text-gray-500">
                                                    Records
                                                </p>
                                            </dd>
                                            <p className="mt-3 text-sm text-gray-500">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className={`flex items-center text-sm font-medium text-${item.color}-600 group-hover:text-${item.color}-700`}>
                                            Manage {item.title}
                                            <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Static/External Card: Other Options */}
                        <a
                            href="/addorlistexpense/view"
                            className="block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group border-l-4 border-gray-500"
                        >
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-gray-500 rounded-md p-3 shadow">
                                        <FontAwesomeIcon icon={faListAlt} className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt>
                                            <p className="text-lg font-semibold text-gray-800 group-hover:text-gray-600 transition-colors duration-300">
                                                Other Setup Options
                                            </p>
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <p className="text-3xl font-bold text-gray-600">
                                                {otherOptionCount}
                                            </p>
                                            <p className="ml-2 text-sm font-medium text-gray-500">
                                                Items
                                            </p>
                                        </dd>
                                        <p className="mt-3 text-sm text-gray-500">
                                            Access miscellaneous configurations.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-700">
                                        Manage Other Options
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </a>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}