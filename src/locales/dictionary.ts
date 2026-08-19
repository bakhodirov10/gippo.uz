import uzCommon from './uz/common.json';
import uzNav from './uz/nav.json';
import uzFooter from './uz/footer.json';
import uzLanding from './uz/landing.json';
import uzAuth from './uz/auth.json';
import uzDoctors from './uz/doctors.json';
import uzAppointments from './uz/appointments.json';
import uzAi from './uz/ai.json';
import uzDashboard from './uz/dashboard.json';
import uzDoctor from './uz/doctor.json';
import uzAdmin from './uz/admin.json';
import uzSpecialties from './uz/specialties.json';
import uzPayments from './uz/payments.json';
import uzProfile from './uz/profile.json';
import uzAbout from './uz/about.json';
import uzContact from './uz/contact.json';

import ruCommon from './ru/common.json';
import ruNav from './ru/nav.json';
import ruFooter from './ru/footer.json';
import ruLanding from './ru/landing.json';
import ruAuth from './ru/auth.json';
import ruDoctors from './ru/doctors.json';
import ruAppointments from './ru/appointments.json';
import ruAi from './ru/ai.json';
import ruDashboard from './ru/dashboard.json';
import ruDoctor from './ru/doctor.json';
import ruAdmin from './ru/admin.json';
import ruSpecialties from './ru/specialties.json';
import ruPayments from './ru/payments.json';
import ruProfile from './ru/profile.json';
import ruAbout from './ru/about.json';
import ruContact from './ru/contact.json';

import enCommon from './en/common.json';
import enNav from './en/nav.json';
import enFooter from './en/footer.json';
import enLanding from './en/landing.json';
import enAuth from './en/auth.json';
import enDoctors from './en/doctors.json';
import enAppointments from './en/appointments.json';
import enAi from './en/ai.json';
import enDashboard from './en/dashboard.json';
import enDoctor from './en/doctor.json';
import enAdmin from './en/admin.json';
import enSpecialties from './en/specialties.json';
import enPayments from './en/payments.json';
import enProfile from './en/profile.json';
import enAbout from './en/about.json';
import enContact from './en/contact.json';

export type Language = 'uz' | 'ru' | 'en';

export const translations = {
  uz: {
    common: uzCommon,
    nav: uzNav,
    footer: uzFooter,
    landing: uzLanding,
    hero: {
      badge: uzLanding.heroBadge,
      title: uzLanding.heroTitle,
      titleGradient: uzLanding.heroTitleGradient,
      subtitle: uzLanding.heroSubtitle,
      searchPlaceholder: uzLanding.searchPlaceholder,
      findDoctor: uzLanding.findDoctor,
      chatAI: uzLanding.chatAI,
      iAmDoctor: uzLanding.iAmDoctor,
      verifiedBadge: uzLanding.verifiedBadge,
      freeBadge: uzLanding.freeBadge,
    },
    trust: uzLanding.trustSection,
    howItWorks: uzLanding.howItWorks,
    features: uzLanding.features,
    auth: uzAuth,
    doctors: uzDoctors,
    appointments: uzAppointments,
    ai: uzAi,
    dashboard: uzDashboard,
    doctorPortal: uzDoctor,
    doctor: uzDoctor,
    admin: uzAdmin,
    specialties: uzSpecialties,
    payments: uzPayments,
    profile: uzProfile,
    about: uzAbout,
    contact: uzContact,
    status: uzCommon.statusMap,
    theme: {
      light: "Yorug'",
      dark: "Tungi",
      system: "Tizim",
    },
  },
  ru: {
    common: ruCommon,
    nav: ruNav,
    footer: ruFooter,
    landing: ruLanding,
    hero: {
      badge: ruLanding.heroBadge,
      title: ruLanding.heroTitle,
      titleGradient: ruLanding.heroTitleGradient,
      subtitle: ruLanding.heroSubtitle,
      searchPlaceholder: ruLanding.searchPlaceholder,
      findDoctor: ruLanding.findDoctor,
      chatAI: ruLanding.chatAI,
      iAmDoctor: ruLanding.iAmDoctor,
      verifiedBadge: ruLanding.verifiedBadge,
      freeBadge: ruLanding.freeBadge,
    },
    trust: ruLanding.trustSection,
    howItWorks: ruLanding.howItWorks,
    features: ruLanding.features,
    auth: ruAuth,
    doctors: ruDoctors,
    appointments: ruAppointments,
    ai: ruAi,
    dashboard: ruDashboard,
    doctorPortal: ruDoctor,
    doctor: ruDoctor,
    admin: ruAdmin,
    specialties: ruSpecialties,
    payments: ruPayments,
    profile: ruProfile,
    about: ruAbout,
    contact: ruContact,
    status: ruCommon.statusMap,
    theme: {
      light: "Светлая",
      dark: "Тёмная",
      system: "Системная",
    },
  },
  en: {
    common: enCommon,
    nav: enNav,
    footer: enFooter,
    landing: enLanding,
    hero: {
      badge: enLanding.heroBadge,
      title: enLanding.heroTitle,
      titleGradient: enLanding.heroTitleGradient,
      subtitle: enLanding.heroSubtitle,
      searchPlaceholder: enLanding.searchPlaceholder,
      findDoctor: enLanding.findDoctor,
      chatAI: enLanding.chatAI,
      iAmDoctor: enLanding.iAmDoctor,
      verifiedBadge: enLanding.verifiedBadge,
      freeBadge: enLanding.freeBadge,
    },
    trust: enLanding.trustSection,
    howItWorks: enLanding.howItWorks,
    features: enLanding.features,
    auth: enAuth,
    doctors: enDoctors,
    appointments: enAppointments,
    ai: enAi,
    dashboard: enDashboard,
    doctorPortal: enDoctor,
    doctor: enDoctor,
    admin: enAdmin,
    specialties: enSpecialties,
    payments: enPayments,
    profile: enProfile,
    about: enAbout,
    contact: enContact,
    status: enCommon.statusMap,
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
  },
};
