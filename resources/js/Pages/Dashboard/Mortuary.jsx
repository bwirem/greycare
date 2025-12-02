import AuthenticatedLayout from '@/Layouts/MortuaryLayout'; // Or your specific layout
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookDead,
    faCross,
    faHandshake,
    faArrowRight,
    faBed,
    faSearch
} from '@fortawesome/free-solid-svg-icons';

// Reusable Card Component (Included locally for standalone functionality)
function SummaryCard({ title, value, unit, description, linkHref, linkText, icon, iconBgColor, footerText }) {
    const valueTextColor = iconBgColor ? iconBgColor.replace('bg-', 'text-') : 'text-gray-800 dark:text-white';
    const linkColor = iconBgColor ? iconBgColor.replace('bg-', 'text-') : 'text-indigo-600 dark:text-indigo-400';
    const displayValue = (value !== undefined && value !== null) ? value : 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col justify-between">
            <div>
                <div className="flex items-start">
                    <div className={`p-3.5 ${iconBgColor || 'bg-gray-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" aria-label={title} />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                        <h3 className={`text-2xl sm:text-3xl font-bold ${valueTextColor} dark:text-gray-100 mt-1`}>
                            {displayValue}
                            {unit && displayValue !== 'N/A' && <small className="text-gray-500 dark:text-gray-400 text-sm ml-1">{unit}</small>}
                        </h3>
                        {description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-3">
                {linkHref ? (
                    <Link href={linkHref} className={`${linkColor} hover:underline text-sm font-medium flex items-center group`}>
                        {linkText || 'View Details'}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                ) : (
                   <span className="text-sm text-gray-400">{footerText}</span>
                )}
            </div>
        </div>
    );
}

export default function MortuaryIndex({ auth, mortuaryOccupancy = 0 }) {
    
    const urls = {
        deceasedRecords: '/mortuary/records', // Adjusted route naming convention
        releaseBody: '/mortuary/release',
        reports: '/mortuary/reports'
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Mortuary Services
                </h2>
            }
        >
            <Head title="Mortuary Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header / Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="mb-4 sm:mb-0">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg">Mortuary Operations</h3>
                            <p className="text-sm text-gray-500">Manage intake, storage, autopsies, and release.</p>
                        </div>
                        <Link href={route('dashboard')} className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            ← Back to Main Menu
                        </Link>
                    </div>

                    {/* Operational Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1: Occupancy Stats */}
                        <SummaryCard
                            title="Current Occupancy"
                            value={mortuaryOccupancy}
                            unit="Bodies"
                            icon={faBed} 
                            iconBgColor="bg-slate-700"
                            linkHref={urls.deceasedRecords}
                            linkText="View Occupancy Register"
                        />

                        {/* Card 2: Intake / Registration */}
                        <SummaryCard
                            title="Register Deceased"
                            description="Process new body admission."
                            icon={faBookDead}
                            iconBgColor="bg-stone-600"
                            linkHref={urls.deceasedRecords} 
                            linkText="New Admission Entry"
                        />

                        {/* Card 3: Release */}
                        <SummaryCard
                            title="Release Body"
                            description="Handover to family/funeral home."
                            icon={faHandshake}
                            iconBgColor="bg-gray-600"
                            linkHref={urls.releaseBody}
                            linkText="Process Release"
                        />
                    </div>
                    
                    {/* Quick Actions / Search Section (Optional placeholder) */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Search</h4>
                        <div className="relative max-w-xl">
                            <input 
                                type="text" 
                                placeholder="Search by deceased name or tag number..." 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-stone-500"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}