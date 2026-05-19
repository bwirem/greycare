import AuthenticatedLayout from '@/Layouts/Orphanage';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faArrowRight,
    faChild,
    faHandshake,
    faDonate,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';

import usePermissionsStore from '@/stores/usePermissionsStore';

// Reusable Card Component
function SummaryCard({
    title,
    value,
    unit,
    description,
    linkHref,
    linkText,
    icon,
    iconBgColor,
    footerText,
    footerTextColor = "text-gray-500 dark:text-gray-400"
}) {

    const valueTextColor = iconBgColor
        ? iconBgColor.replace('bg-', 'text-')
        : 'text-gray-800 dark:text-white';

    const linkColor = iconBgColor
        ? iconBgColor.replace('bg-', 'text-')
        : 'text-indigo-600 dark:text-indigo-400';

    const displayValue = (value !== undefined && value !== null)
        ? value
        : 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col justify-between border border-gray-100 dark:border-gray-700">

            <div>
                <div className="flex items-start">

                    <div className={`p-3.5 ${iconBgColor || 'bg-gray-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon
                            icon={icon}
                            className="text-white h-6 w-6"
                            aria-label={title}
                        />
                    </div>

                    <div className="ml-4 flex-1">

                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {title}
                        </p>

                        <h3 className={`text-2xl sm:text-3xl font-bold ${valueTextColor} dark:text-gray-100 mt-1`}>
                            {displayValue}

                            {unit && displayValue !== 'N/A' && (
                                <small className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                                    {unit}
                                </small>
                            )}
                        </h3>

                        {description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                {description}
                            </p>
                        )}

                    </div>
                </div>
            </div>

            <div className="mt-4">
                {linkHref ? (
                    <Link
                        href={linkHref}
                        className={`${linkColor} hover:underline text-sm font-medium flex items-center group`}
                    >
                        {linkText || 'View Details'}

                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Link>
                ) : footerText ? (
                    <span className={`text-sm ${footerTextColor}`}>
                        {footerText}
                    </span>
                ) : (
                    <div className="h-[20px]"></div>
                )}
            </div>

        </div>
    );
}

export default function OrphanageDashboard({ auth }) {

    // Fetch permissions from store
    const modules = usePermissionsStore((state) => state.modules);

    // URLs
    const urls = {
        orphanageHub: '/orphanage',
        childRecords: '/orphanage0',
        adoptionRequests: '/orphanage1',
        orphanageDischarge: '/orphanage2',
        orphanageHistory: '/orphanage3',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Orphanage Centre Dashboard
                </h2>
            }
        >
            <Head title="Orphanage Centre" />

            <div className="py-12">

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* Navigation */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">

                        <div>
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">
                                Orphanage Centre Dashboard
                            </h3>

                            <p className="text-sm text-gray-500">
                                Child Welfare, Adoption & Discharge Management
                            </p>
                        </div>

                        <Link
                            href={route('dashboard')}
                            className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            ← Back to Main Menu
                        </Link>

                    </div>

                    {/* --- ORPHANAGE SECTION --- */}
                    {modules.some(module => module.modulekey === 'orphanage') && (

                        <section>

                            <div className="flex justify-between items-center mb-4">

                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                    Orphanage Services
                                </h3>

                                <Link
                                    href={urls.orphanageHub}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group"
                                >
                                    Open Orphanage Hub

                                    <FontAwesomeIcon
                                        icon={faArrowRight}
                                        className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </Link>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                                {/* Child Records */}
                                <SummaryCard
                                    title="Child Records"
                                    description="Register and manage children information."
                                    icon={faChild}
                                    iconBgColor="bg-pink-600"
                                    linkHref={urls.childRecords}
                                    linkText="Manage Records"
                                />

                                {/* Adoption Requests */}
                                <SummaryCard
                                    title="Adoption Requests"
                                    description="Review and process adoption applications."
                                    icon={faHandshake}
                                    iconBgColor="bg-blue-600"
                                    linkHref={urls.adoptionRequests}
                                    linkText="View Requests"
                                />

                                {/* Discharge */}
                                <SummaryCard
                                    title="Discharge"
                                    description="Manage child release and reintegration."
                                    icon={faDonate}
                                    iconBgColor="bg-amber-600"
                                    linkHref={urls.orphanageDischarge}
                                    linkText="Manage Discharge"
                                />

                                {/* History */}
                                <SummaryCard
                                    title="Orphanage History"
                                    description="View historical records and reports."
                                    icon={faChartLine}
                                    iconBgColor="bg-emerald-600"
                                    linkHref={urls.orphanageHistory}
                                    linkText="View History"
                                />

                            </div>

                        </section>

                    )}

                </div>

            </div>

        </AuthenticatedLayout>
    );
}