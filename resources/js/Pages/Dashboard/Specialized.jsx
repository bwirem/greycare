import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    // Removed Mortuary Icons (faBookDead, faCross, faHandshake)
    faBabyCarriage, faRibbon, faWalking, 
    faArrowRight, faPlusSquare,
    faIdCard, faTablets, faNotesMedical
} from '@fortawesome/free-solid-svg-icons';
import usePermissionsStore from '@/stores/usePermissionsStore';

// Reusable Card Component
function SummaryCard({ title, value, unit, description, linkHref, linkText, icon, iconBgColor, footerText, footerTextColor = "text-gray-500 dark:text-gray-400" }) {
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
                ) : footerText ? (
                    <span className={`text-sm ${footerTextColor}`}>{footerText}</span>
                ) : <div className="h-[20px]"></div>}
            </div>
        </div>
    );
}

export default function Specialized({ 
    auth,
    // Removed mortuaryOccupancy prop
    physioSessionsToday = 0 
}) {
    // Fetch permissions from store
    const modules = usePermissionsStore((state) => state.modules);

    // Define URLs for Specialized Modules
    const urls = {
        // RCH
        rchHub: '/rch',
        rchRegistration: '/rch0', // Family Planning
        antenatal: '/rch1',

        // HIV
        hivHub: '/hivart',
        hivEnrollment: '/hivart0',
        artManagement: '/hivart1',

        // Physio
        physioHub: '/physiotherapy',
        physioSessions: '/physiotherapy0',
        physioNotes: '/physiotherapy1',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Specialized Care
                </h2>
            }
        >
            <Head title="Specialized Clinics" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* Navigation Back */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Specialized Clinics Dashboard</h3>
                            <p className="text-sm text-gray-500">RCH, CTC & Physiotherapy</p>
                        </div>
                        <Link href={route('dashboard')} className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            ← Back to Main Menu
                        </Link>
                    </div>

                    {/* --- RCH / MCH SECTION --- */}
                    {modules.some(module => module.modulekey === 'rch') && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">RCH / MCH Clinic</h3>
                            <Link href={urls.rchHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to RCH Hub <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Antenatal Care"
                                description="Pregnancy monitoring & visits."
                                icon={faBabyCarriage}
                                iconBgColor="bg-pink-500"
                                linkHref={urls.antenatal}
                                linkText="ANC Register"
                            />
                            <SummaryCard
                                title="Family Planning"
                                description="Reproductive health services."
                                icon={faPlusSquare}
                                iconBgColor="bg-rose-500"
                                linkHref={urls.rchRegistration}
                                linkText="FP Services"
                            />
                        </div>
                    </section>
                    )}

                    {/* --- HIV / ART SECTION --- */}
                    {modules.some(module => module.modulekey === 'hivart') && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">HIV - CTC Clinic</h3>
                            <Link href={urls.hivHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to CTC Hub <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Enrollment"
                                description="Register new CTC clients."
                                icon={faIdCard}
                                iconBgColor="bg-red-600"
                                linkHref={urls.hivEnrollment}
                                linkText="Client Registry"
                            />
                            <SummaryCard
                                title="ART Management"
                                description="Medication dispensing & adherence."
                                icon={faTablets}
                                iconBgColor="bg-orange-600"
                                linkHref={urls.artManagement}
                                linkText="Manage ART"
                            />
                        </div>
                    </section>
                    )}

                    {/* --- PHYSIOTHERAPY SECTION --- */}
                    {modules.some(module => module.modulekey === 'physiotherapy') && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Physiotherapy</h3>
                            <Link href={urls.physioHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to Physio Hub <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Sessions Today"
                                value={physioSessionsToday}
                                unit="Sessions"
                                icon={faWalking}
                                iconBgColor="bg-teal-600"
                                linkHref={urls.physioSessions}
                                linkText="View Schedule"
                            />
                            <SummaryCard
                                title="Progress Notes"
                                description="Patient therapy records."
                                icon={faNotesMedical}
                                iconBgColor="bg-emerald-600"
                                linkHref={urls.physioNotes}
                                linkText="View Notes"
                            />
                        </div>
                    </section>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}