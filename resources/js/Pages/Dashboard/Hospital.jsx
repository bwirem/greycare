import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    // Medical & Hospital Icons
    faStethoscope, faProcedures, faUserMd, faUserNurse, faHeartbeat,
    faMicroscope, faTint, faRadiation, faCross, faBookDead, faHandshake,
    faClipboardList, faFileMedical, faBed, faDoorOpen, faVials, faXRay,
    faSyringe, faBabyCarriage, faRibbon, faNotesMedical, faCalendarCheck,
    faFileSignature, faAmbulance, faTablets, faIdCard,
    // Pharmacy Icons
    faCapsules, faPrescriptionBottle,
    
    // Common
    faArrowRight, faChartBar, faExclamationTriangle, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";
import usePermissionsStore from '@/stores/usePermissionsStore';

// Reusable Card Component (Kept from original)
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

export default function Hospital({
    auth,
    // Props passed from DashboardController
    opdRegistrationsToday = 0,
    activeAdmissionsCount = 0,
    doctorsOnDuty = 0,
    pendingSurgeries = 0,
    pendingLabTests = 0,
    pendingRadTests = 0,
    mortuaryOccupancy = 0,
    pendingPrescriptions = 0,

    // 1. Receive the prop here
    hospitalModuleKeys,
}) {
    // 1. Define application URLs
    // These paths must match your backend Route definitions
    const urls = {
        // Outpatient
        opdHub: '/outpatient',
        newRegistration: '/outpatient0', 
        referrals: '/outpatient2', 

        // Inpatient
        ipdHub: '/inpatient',
        admissions: '/inpatient0',
        discharges: '/inpatient1',

        // Doctor & Nursing
        doctorHub: '/doctor',
        myVisits: '/doctor0',
        prescriptions: '/doctor2',
        
        // Ancillary
        theatreHub: '/theatre0',
        labHub: '/laboratory0',
        radiologyHub: '/radiology0',

        // Pharmacy
        pharmacyHub: '/pharmacy',
        dispensing: '/pharmacy0',
        rxManagement: '/pharmacy1',

        // Mortuary
        mortuaryHub: '/mortuary',
        deceasedRecords: '/mortuary0',
        releaseBody: '/mortuary1',
    };

    // 2. Fetch permissions
    const modules = usePermissionsStore((state) => state.modules);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Hospital Services
                </h2>
            }

            hospitalModuleKeys={hospitalModuleKeys} // 2. Pass the prop to layout
        >
            <Head title="Hospital Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* Navigation Back to Main Menu */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Clinical Dashboard</h3>
                            <p className="text-sm text-gray-500">Overview of medical operations</p>
                        </div>
                        <Link href={route('dashboard')} className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            ← Back to Main Menu
                        </Link>
                    </div>
                     
                    {/* Outpatient Section */}
                    {modules.some(module => module.modulekey === 'outpatient') && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Outpatient (OPD)</h3>
                            {/* <Link href={urls.opdHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to OPD Hub <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link> */}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Registrations Today"
                                value={opdRegistrationsToday}
                                unit="Patients"
                                icon={faClipboardList}
                                iconBgColor="bg-blue-500"
                                linkHref={urls.newRegistration}
                                linkText="View Registrations"
                            />
                            <SummaryCard
                                title="New Registration"
                                description="Register a new patient."
                                icon={faPlusSquare}
                                iconBgColor="bg-sky-500"
                                linkHref={urls.newRegistration}
                                linkText="Register Patient"
                            />
                            <SummaryCard
                                title="Referrals"
                                description="Patients referred to other hospitals."
                                icon={faAmbulance}
                                iconBgColor="bg-orange-500"
                                linkHref={urls.referrals}
                                linkText="Manage Referrals"
                            />
                        </div>
                    </section>
                    )}

                    {/* Inpatient Section */}
                    {modules.some(module => module.modulekey === 'inpatient') && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Inpatient (IPD)</h3>
                            {/* <Link href={urls.ipdHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to IPD Hub <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link> */}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Active Admissions"
                                value={activeAdmissionsCount}
                                unit="Patients"
                                icon={faProcedures}
                                iconBgColor="bg-teal-500"
                                linkHref={urls.admissions}
                                linkText="View Ward List"
                            />
                            <SummaryCard
                                title="New Admission"
                                description="Admit a patient to a ward."
                                icon={faBed}
                                iconBgColor="bg-green-500"
                                linkHref={urls.admissions}
                                linkText="Admit Patient"
                            />
                            <SummaryCard
                                title="Discharges"
                                description="Process patient discharges."
                                icon={faDoorOpen}
                                iconBgColor="bg-gray-500"
                                linkHref={urls.discharges}
                                linkText="Discharge Summary"
                            />
                        </div>
                    </section>    
                    )}              

                    {/* Clinical Services (Doctor/Nursing) */}
                    {(modules.some(module => module.modulekey === 'doctor') || modules.some(module => module.modulekey === 'nursing')) && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Clinical Services</h3>
                            {/* <Link href={urls.doctorHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to Doctor Station <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link> */}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Doctors On Duty"
                                value={doctorsOnDuty}
                                icon={faUserMd}
                                iconBgColor="bg-indigo-500"
                                linkHref={urls.doctorHub}
                                linkText="Staff Schedule"
                            />
                            <SummaryCard
                                title="Pending Visits"
                                description="Patients waiting for consultation."
                                icon={faStethoscope}
                                iconBgColor="bg-purple-500"
                                linkHref={urls.myVisits}
                                linkText="View Queue"
                            />
                            <SummaryCard
                                title="Prescriptions"
                                description="Manage patient prescriptions."
                                icon={faTablets}
                                iconBgColor="bg-pink-500"
                                linkHref={urls.prescriptions}
                                linkText="Write Prescription"
                            />
                        </div>
                    </section>
                    )}

                    {/* Pharmacy Section */}
                    {modules.some(module => module.modulekey === 'pharmacy') && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Pharmacy</h3>
                            {/* <Link href={urls.pharmacyHub} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center group">
                                Go to Pharmacy <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link> */}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Pending Rx"
                                value={pendingPrescriptions}
                                unit="Requests"
                                icon={faPrescriptionBottle}
                                iconBgColor="bg-emerald-500"
                                linkHref={urls.rxManagement}
                                linkText="View Queue"
                            />
                            <SummaryCard
                                title="Dispensing"
                                description="Dispense medication to patients."
                                icon={faCapsules}
                                iconBgColor="bg-lime-600"
                                linkHref={urls.dispensing}
                                linkText="Dispense Drugs"
                            />
                            <SummaryCard
                                title="Stock Check"
                                description="Check drug availability."
                                icon={faVials}
                                iconBgColor="bg-emerald-600"
                                linkHref={urls.pharmacyHub}
                                linkText="View Inventory"
                            />
                        </div>
                    </section>
                    )}

                    {/* Ancillary Services (Lab, Theatre, Radiology) */}
                    {(modules.some(module => module.modulekey === 'laboratory') || modules.some(module => module.modulekey === 'theatre')) && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Ancillary Services</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.some(module => module.modulekey === 'laboratory') && (
                            <SummaryCard
                                title="Lab Requests"
                                value={pendingLabTests}
                                unit="Pending"
                                icon={faMicroscope}
                                iconBgColor="bg-red-500"
                                linkHref={urls.labHub}
                                linkText="Laboratory"
                            />
                            )}
                            {modules.some(module => module.modulekey === 'theatre') && (
                            <SummaryCard
                                title="Surgeries"
                                value={pendingSurgeries}
                                unit="Scheduled"
                                icon={faHeartbeat}
                                iconBgColor="bg-rose-600"
                                linkHref={urls.theatreHub}
                                linkText="Theatre Schedule"
                            />
                            )}
                             {modules.some(module => module.modulekey === 'radiology') && (
                            <SummaryCard
                                title="Radiology"
                                value={pendingRadTests}
                                description="X-Ray, CT & MRI Requests"
                                icon={faRadiation}
                                iconBgColor="bg-yellow-500"
                                linkHref={urls.radiologyHub}
                                linkText="Radiology Dept"
                            />
                            )}
                        </div>
                    </section>
                    )}
                   

                </div>
            </div>
        </AuthenticatedLayout>
    );
}