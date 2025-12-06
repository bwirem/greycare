import React from "react";
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLayerGroup,       // Facility Options
    faUsers,            // Billing Groups
    faSitemap,          // Subgroups
    faClinicMedical,    // Treatment Points
    faBed,              // Wards
    faProcedures,       // Rooms/Beds
    faStethoscope,      // Diagnosis
    faTags,             // Diagnosis Groups
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export default function FacilitySetupIndex({ 
    auth, 
    facilityOptionCount = 0,
    billingGroupCount = 0,
    billingSubGroupCount = 0,
    treatmentPointCount = 0,
    wardCount = 0,
    diagnosisCount = 0
}) {
    const dashboardItems = [
        // --- Existing Items ---
        { 
            title: "Facility Options", 
            count: facilityOptionCount, 
            icon: faLayerGroup, 
            routeName: 'systemconfiguration5.facilityoptions.index', 
            color: 'purple', 
            description: "General facility settings." 
        },
        { 
            title: "Billing Groups", 
            count: billingGroupCount, 
            icon: faUsers, 
            routeName: 'systemconfiguration5.billinggroups.index', 
            color: 'blue', 
            description: "Manage Payment Modes (Cash, Insurance)." 
        },
        { 
            title: "Billing Subgroups", 
            count: billingSubGroupCount, 
            icon: faSitemap, 
            routeName: 'systemconfiguration5.billingsubgroups.index', 
            color: 'indigo', 
            description: "Specific Insurance Plans." 
        },
        { 
            title: "OPD Treatment Points", 
            count: treatmentPointCount, 
            icon: faClinicMedical, 
            routeName: 'systemconfiguration5.treatmentpoints.index', 
            color: 'teal', 
            description: "Clinics and Service Points." 
        },

        // --- NEW ITEMS ---
        { 
            title: "IPD Wards", 
            count: wardCount, 
            icon: faBed, 
            routeName: 'systemconfiguration5.wards.index', 
            color: 'orange', 
            description: "Manage Wards (Maternity, ICU, General)." 
        },
        { 
            title: "Rooms & Beds", 
            count: 0, // Logic can be added later
            icon: faProcedures, 
            routeName: 'systemconfiguration5.rooms.index', 
            color: 'red', 
            description: "Manage physical rooms and bed numbers." 
        },
        { 
            title: "Diagnosis Groups", 
            count: 0, 
            icon: faTags, 
            routeName: 'systemconfiguration5.diagnosisgroups.index', 
            color: 'green', 
            description: "Categorize diseases (Infectious, Chronic)." 
        },
        { 
            title: "ICD-10 Diagnoses", 
            count: diagnosisCount, 
            icon: faStethoscope, 
            routeName: 'systemconfiguration5.diagnoses.index', 
            color: 'cyan', 
            description: "Manage International Classification of Diseases." 
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Facility Setup Dashboard</h2>}
        >
            <Head title="Facility Setup" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {dashboardItems.map((item, index) => (
                            <Link
                                key={index}
                                href={route(item.routeName)}
                                className={`block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-all duration-300 border-l-4 border-${item.color}-500 group`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 bg-${item.color}-500 rounded-md p-3 shadow`}>
                                            <FontAwesomeIcon icon={item.icon} className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-4 w-0 flex-1">
                                            <p className={`text-base font-semibold text-gray-800 group-hover:text-${item.color}-600`}>
                                                {item.title}
                                            </p>
                                            {item.count > 0 && (
                                                <p className="text-2xl font-bold text-gray-600">{item.count}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-gray-500 line-clamp-2 h-8">
                                        {item.description}
                                    </p>
                                    <div className={`mt-3 flex items-center text-xs font-bold text-${item.color}-600 uppercase tracking-wide`}>
                                        Manage <FontAwesomeIcon icon={faArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
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