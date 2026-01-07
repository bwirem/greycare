import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStethoscope,
    faNotesMedical,
    faArrowRight,
    faCut,
    faFileMedicalAlt,
    faMicroscope // Using microscope for Diagnosis/Lab related reports
} from '@fortawesome/free-solid-svg-icons';

function ReportCard({ title, value, description, icon, iconBgColor, linkHref, linkText }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <Link href={linkHref || '#'} className="block group flex-grow flex flex-col">
                <div className="flex items-start mb-auto">
                    <div className={`p-3.5 ${iconBgColor || 'bg-indigo-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                        {value !== undefined && (
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</h3>
                        )}
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-sm font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center">
                        {linkText}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3" />
                    </span>
                </div>
            </Link>
        </div>
    );
}

export default function DoctorReportsDashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Doctor Workload Hub</h2>}>
            <Head title="Doctor Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <ReportCard
                            title="OPD Consultations"
                            value={stats.opd_today}
                            description="Patients seen in OPD Today."
                            icon={faStethoscope}
                            iconBgColor="bg-blue-600"
                            linkHref={route('reports.doctor.opd_workload')}
                            linkText="View OPD Report"
                        />
                        <ReportCard
                            title="IPD Rounds"
                            value={stats.rounds_today}
                            description="Ward rounds conducted Today."
                            icon={faNotesMedical}
                            iconBgColor="bg-green-600"
                            linkHref={route('reports.doctor.ipd_workload')}
                            linkText="View IPD Report"
                        />
                        
                        {/* Patient History */}
                        <ReportCard
                            title="Patient Medical History"
                            description="Search and view comprehensive patient timeline."
                            icon={faFileMedicalAlt}
                            iconBgColor="bg-teal-600"
                            linkHref={route('reports.doctor.patient_history')} 
                            linkText="Search Records"
                        />

                        {/* --- NEW CARD: Diagnosis Reports --- */}
                        <ReportCard
                            title="Diagnosis Statistics"
                            description="Top ICD-10 codes and Internal Mappings."
                            icon={faMicroscope}
                            iconBgColor="bg-purple-600"
                            linkHref={route('reports.doctor.diagnosis')} 
                            linkText="View Disease Stats"
                        />

                        {/* Placeholder for Theatre Report */}
                        <ReportCard
                            title="Surgeries"
                            value={stats.surgeries_today}
                            description="Procedures performed Today."
                            icon={faCut}
                            iconBgColor="bg-red-500"
                            linkHref="#" 
                            linkText="Coming Soon"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}