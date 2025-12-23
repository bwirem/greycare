import React from "react";
import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLayerGroup, faUsers, faSitemap, faClinicMedical, 
    faBed, faProcedures, faStethoscope, faTags, faArrowRight, faFileMedical,
    faUserMd, faDoorOpen // <--- Added Icon
} from '@fortawesome/free-solid-svg-icons';

export default function FacilitySetupIndex({ 
    auth, 
    facilityOptionCount, 
    billingGroupCount, 
    billingSubGroupCount, 
    treatmentPointCount, 
    wardCount, 
    diagnosisCount,
    specializationCount,     // <--- Added Prop
    dischargeStatusCount // <--- 2. Add Prop
}) {
    const dashboardItems = [
        { 
            title: "Facility Options", count: facilityOptionCount, icon: faLayerGroup, 
            routeName: 'systemconfiguration5.facilityoptions.index', color: 'purple', description: "General facility settings." 
        },
        { 
            title: "Billing Groups", count: billingGroupCount, icon: faUsers, 
            routeName: 'systemconfiguration5.billinggroups.index', color: 'blue', description: "Manage Payment Modes." 
        },
        { 
            title: "Billing Subgroups", count: billingSubGroupCount, icon: faSitemap, 
            routeName: 'systemconfiguration5.billingsubgroups.index', color: 'indigo', description: "Specific Insurance Plans." 
        },
        // --- NEW SPECIALIZATION CARD ---
        { 
            title: "Doctor Specializations", 
            count: specializationCount, 
            icon: faUserMd, 
            routeName: 'systemconfiguration5.specializations.index', 
            color: 'emerald', 
            description: "Manage consult fees & revisit rules." 
        },
        // -------------------------------
        { 
            title: "Assign Doctors", 
            count: 0, // Or pass User::count() if you want
            icon: faStethoscope, 
            routeName: 'systemconfiguration5.doctor-assignment.index', 
            color: 'teal', 
            description: "Map doctors to specializations." 
        },
        { 
            title: "OPD Treatment Points", count: treatmentPointCount, icon: faClinicMedical, 
            routeName: 'systemconfiguration5.treatmentpoints.index', color: 'teal', description: "Clinics and Service Points." 
        },
        { 
            title: "IPD Wards", count: wardCount, icon: faBed, 
            routeName: 'systemconfiguration5.wards.index', color: 'orange', description: "Manage Wards (Maternity, ICU)." 
        },
        { 
            title: "Rooms & Beds", count: 0, icon: faProcedures, 
            routeName: 'systemconfiguration5.rooms.index', color: 'red', description: "Manage physical rooms and beds." 
        },
        // --- 3. ADD THIS CARD ---
        { 
            title: "Discharge Statuses", 
            count: dischargeStatusCount, 
            icon: faDoorOpen, 
            routeName: 'systemconfiguration5.dischargestatuses.index', 
            color: 'orange', 
            description: "Outcomes (Recovered, Referred, etc)." 
        },
        { 
            title: "Diagnosis Groups", count: 0, icon: faTags, 
            routeName: 'systemconfiguration5.diagnosisgroups.index', color: 'green', description: "Categorize diseases." 
        },
        { 
            title: "ICD-10 Diagnoses", count: diagnosisCount, icon: faStethoscope, 
            routeName: 'systemconfiguration5.diagnoses.index', color: 'cyan', description: "International Classification." 
        },
        { 
            title: "Mtuha Diagnoses", 
            count: 0, 
            icon: faFileMedical, 
            routeName: 'systemconfiguration5.mtuha.index', 
            routeParams: { type: 'opd' }, 
            color: 'pink', 
            description: "Manage OPD, IPD, Dental, Eye specific diagnoses." 
        }
    ];

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Facility Setup Dashboard</h2>}>
            <Head title="Facility Setup" />
            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardItems.map((item, index) => (
                        <Link
                            key={index}
                            href={route(item.routeName, item.routeParams || {})}
                            className={`block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-all duration-300 border-l-4 border-${item.color}-500 group`}
                        >
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className={`flex-shrink-0 bg-${item.color}-500 rounded-md p-3 shadow`}>
                                        <FontAwesomeIcon icon={item.icon} className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4 w-0 flex-1">
                                        <p className={`text-base font-semibold text-gray-800 group-hover:text-${item.color}-600`}>{item.title}</p>
                                        {item.count >= 0 && <p className="text-2xl font-bold text-gray-600">{item.count}</p>}
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-gray-500 line-clamp-2 h-8">{item.description}</p>
                                <div className={`mt-3 flex items-center text-xs font-bold text-${item.color}-600 uppercase`}>
                                    Manage <FontAwesomeIcon icon={faArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}