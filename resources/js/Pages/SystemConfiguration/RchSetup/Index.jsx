import React from "react";
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyringe,          // Vaccines
    faVenusMars,        // Family Planning
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function RchSetupIndex({
    auth,
    vaccineCount = 0,
    fpMethodCount = 0
}) {
    const dashboardItems = [
        { 
            title: "Vaccines Schedule", 
            count: vaccineCount, 
            icon: faSyringe, 
            routeName: 'systemconfiguration14.vaccines.index', 
            color: 'blue', 
            description: "Manage Immunization types (BCG, Polio, etc)." 
        },
        { 
            title: "FP Methods", 
            count: fpMethodCount, 
            icon: faVenusMars, 
            routeName: 'systemconfiguration14.fpmethods.index', 
            color: 'purple', 
            description: "Manage Family Planning methods (Pills, Loops)." 
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
                    RCH Configuration
                </h2>
            }
        >
            <Head title="RCH Setup" />

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