import React from "react";
import AuthenticatedLayout from '@/Layouts/Orphanage';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPeopleArrows,
    faClipboardList,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

import "@fortawesome/fontawesome-svg-core/styles.css";

export default function SetupIndex({
    auth,
    adoptationTypeCount = 0,
    registrationTypeCount = 0,
}) {

    const dashboardItems = [
        {
            title: "Adoption Types",
            count: adoptationTypeCount,
            icon: faPeopleArrows,
            routeName: 'systemconfiguration17.adoptationtypes.index',
            color: 'blue',
            description: 'Manage orphanage-to-orphanage and orphanage-to-adoptive-parent adoption types.'
        },
        {
            title: "Registration Types",
            count: registrationTypeCount,
            icon: faClipboardList,
            routeName: 'systemconfiguration17.registrationtypes.index',
            color: 'green',
            description: 'Manage orphan registration classifications and registration categories.'
        },
    ];

    const colorClasses = {
        blue: {
            border: 'border-blue-500',
            bg: 'bg-blue-500',
            text: 'text-blue-600',
            hover: 'group-hover:text-blue-600',
            link: 'text-blue-600 group-hover:text-blue-700',
        },
        green: {
            border: 'border-green-500',
            bg: 'bg-green-500',
            text: 'text-green-600',
            hover: 'group-hover:text-green-600',
            link: 'text-green-600 group-hover:text-green-700',
        },
    };

    const Card = ({
        title,
        count,
        icon,
        routeName,
        color,
        description
    }) => {
        const styles = colorClasses[color];

        return (
            <Link
                href={route(routeName)}
                className={`block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-all duration-300 ease-in-out group border-l-4 ${styles.border}`}
            >
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 ${styles.bg} rounded-md p-3 shadow`}>
                            <FontAwesomeIcon
                                icon={icon}
                                className="h-8 w-8 text-white"
                            />
                        </div>

                        <div className="ml-5 w-0 flex-1">
                            <dt>
                                <p className={`text-lg font-semibold text-gray-800 ${styles.hover} transition-colors duration-300`}>
                                    {title}
                                </p>
                            </dt>

                            <dd className="flex items-baseline">
                                <p className={`text-3xl font-bold ${styles.text}`}>
                                    {count}
                                </p>
                            </dd>

                            {description && (
                                <p className="mt-3 text-sm text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className={`flex items-center text-sm font-medium ${styles.link}`}>
                            Manage {title}
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Adoption & Registration Configuration
                </h2>
            }
        >
            <Head title="Adoption & Registration Setup" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Configuration Modules
                        </h3>
                        <p className="text-sm text-gray-500">
                            Manage adoption types and registration types used throughout the orphanage management system.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {dashboardItems.map((item) => (
                            <Card
                                key={item.title}
                                {...item}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}