import React from "react";
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faVial,             // Nature of Sample
    faBan,              // Rejection Reasons
    faBuilding,         // Categories (Departments)
    faFlask,            // Panels (Tests)
    faMicroscope,       // Parameters (Results)
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function LabSetupIndex({
    auth,
    sampleCount = 0,
    rejectionCount = 0,
    categoryCount = 0,
    panelCount = 0,
    parameterCount = 0
}) {
    const dashboardItems = [
        { 
            title: "Sample Types", 
            count: sampleCount, 
            icon: faVial, 
            routeName: 'systemconfiguration6.samples.index', 
            color: 'red', 
            description: "Define specimen types (Blood, Urine, etc)." 
        },
        { 
            title: "Rejection Reasons", 
            count: rejectionCount, 
            icon: faBan, 
            routeName: 'systemconfiguration6.rejections.index', 
            color: 'orange', 
            description: "Manage reasons for sample rejection." 
        },
        { 
            title: "Lab Categories", 
            count: categoryCount, 
            icon: faBuilding, 
            routeName: 'systemconfiguration6.categories.index', 
            color: 'blue', 
            description: "Set up departments (Hematology, Biochemistry)." 
        },
        { 
            title: "Test Panels", 
            count: panelCount, 
            icon: faFlask, 
            routeName: 'systemconfiguration6.panels.index', 
            color: 'green', 
            description: "Manage orderable tests and prices." 
        },
        { 
            title: "Test Parameters", 
            count: parameterCount, 
            icon: faMicroscope, 
            routeName: 'systemconfiguration6.parameters.index', 
            color: 'purple', 
            description: "Configure specific result fields & ranges." 
        },
    ];

    const Card = ({ title, count, icon, routeName, color, description }) => (
        <Link
            href={route(routeName)}
            className={`block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group border-l-4 border-${color}-500`}
        >
            <div className="p-6">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 bg-${color}-500 rounded-md p-3 shadow`}>
                        <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dt>
                            <p className={`text-lg font-semibold text-gray-800 group-hover:text-${color}-600 transition-colors duration-300`}>
                                {title}
                            </p>
                        </dt>
                        <dd className="flex items-baseline">
                            <p className={`text-3xl font-bold text-${color}-600`}>
                                {count}
                            </p>
                        </dd>
                        {description && <p className="mt-3 text-sm text-gray-500">{description}</p>}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className={`flex items-center text-sm font-medium text-${color}-600 group-hover:text-${color}-700`}>
                        Manage {title}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Laboratory Configuration
                </h2>
            }
        >
            <Head title="Lab Setup" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardItems.map(item => <Card key={item.title} {...item} />)}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}