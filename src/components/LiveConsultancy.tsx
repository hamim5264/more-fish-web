import React from 'react';
import { useLang } from '../context/LanguageContext';
import { Phone, MessageSquare, Video, ShieldCheck, UserCheck, Clock } from 'lucide-react';

interface Expert {
  name: string;
  nameBn: string;
  title: string;
  titleBn: string;
  specialty: string;
  specialtyBn: string;
  availability: string;
  availabilityBn: string;
}

export const LiveConsultancy: React.FC = () => {
  const { t, lang } = useLang();

  const experts: Expert[] = [
    {
      name: 'Dr. Rafiqul Islam',
      nameBn: 'ডা. রফিকুল ইসলাম',
      title: 'Senior Aquaculture Specialist & Vet',
      titleBn: 'সিনিয়র অ্যাকুয়াকালচার স্পেশালিস্ট ও পশু চিকিৎসক',
      specialty: 'Fish Pathological Diagnosis & Treatment',
      specialtyBn: 'মাছের রোগ নির্ণয় ও চিকিৎসা',
      availability: 'Sat - Thu (10:00 AM - 6:00 PM)',
      availabilityBn: 'শনি - বৃহস্পতি (সকাল ১০:০০ - সন্ধ্যা ৬:০০)',
    },
    {
      name: 'Dr. Fahmida Rahman',
      nameBn: 'ডা. ফাহমিদা রহমান',
      title: 'Water Quality Analyst',
      titleBn: 'পানি মান নিয়ন্ত্রণ বিশ্লেষক',
      specialty: 'Biofloc & RAS Water Chemistry',
      specialtyBn: 'বায়োফ্লক এবং আরএএস পানির রসায়ন',
      availability: 'Sun - Fri (2:00 PM - 8:00 PM)',
      availabilityBn: 'রবি - শুক্র (দুপুর ২:০০ - রাত ৮:০০)',
    },
    {
      name: 'Engr. Anisur Rahman',
      nameBn: 'প্রকৌশলী আনিসুর রহমান',
      title: 'IoT & Aeration Systems Engineer',
      titleBn: 'আইওটি এবং এয়ারেশন সিস্টেম ইঞ্জিনিয়ার',
      specialty: 'Nano Bubble & Automated Telemetry Controls',
      specialtyBn: 'ন্যানো বাবল এবং স্বয়ংক্রিয় টেলিমეტ্রি নিয়ন্ত্রণ',
      availability: '24/7 Hardware Support',
      availabilityBn: '২৪/৭ হার্ডওয়্যার সাপোর্ট',
    },
  ];

  const handleCall = () => {
    window.location.href = 'tel:+8801898938355';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/8801898938355', '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">{t('live_consultancy')}</h4>
            <p className="text-[11px] font-black text-font-light uppercase">Expert Consultations & Hotline Support</p>
          </div>
        </div>
      </div>

      {/* Main Support Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Call Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between h-56 transition-transform hover:scale-[1.01]">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10 shadow-xs">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-black text-2xl">24/7 Technical Support Hotline</h3>
            <p className="text-white/90 text-sm font-bold">
              Get immediate solutions to your farm equipment, sensor queries, and urgent pond emergencies.
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="font-mono font-black text-lg">+880 1898-938355</span>
            <button
              onClick={handleCall}
              className="px-6 py-3 bg-white text-blue-600 font-black text-sm rounded-xl shadow-md hover:bg-cyan-50 transition-colors cursor-pointer"
            >
              {t('call_now')}
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between h-56 transition-transform hover:scale-[1.01]">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10 shadow-xs">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-black text-2xl">Chat with Expert Vet</h3>
            <p className="text-white/90 text-sm font-bold">
              Share images of infected fish, water test kit colors, and receive instant diagnostic support.
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="font-mono font-black text-lg">WhatsApp Available</span>
            <button
              onClick={handleWhatsApp}
              className="px-6 py-3 bg-white text-emerald-600 font-black text-sm rounded-xl shadow-md hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              {t('chat_expert')}
            </button>
          </div>
        </div>
      </div>

      {/* Expert Panel Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100/40 border border-indigo-200 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            <h4 className="font-black text-lg text-font-dark">{t('expert_panel')}</h4>
          </div>
          <span className="text-[10px] font-black bg-white text-primary border border-indigo-200 px-3 py-1 rounded-full uppercase shadow-xs">
            Premium Panel
          </span>
        </div>

        <p className="text-sm text-font-dark font-black leading-relaxed bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
          Our panel of certified fishery experts, biologists, and veterinary doctors provide one-on-one video consultations for premium club members. Ensure your water test data is synced before booking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experts.map((exp, idx) => (
            <div
              key={idx}
              className="border border-indigo-200 rounded-2xl p-5 bg-white space-y-4 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-base shadow-sm uppercase">
                  {exp.name.split(' ').pop()?.slice(0, 2) || 'EX'}
                </div>
                <div>
                  <h5 className="font-black text-sm text-font-dark">
                    {lang === 'bn' ? exp.nameBn : exp.name}
                  </h5>
                  <p className="text-[11px] text-font-light font-bold">
                    {lang === 'bn' ? exp.titleBn : exp.title}
                  </p>
                </div>
              </div>

              <div className="border-t border-indigo-100 pt-3 space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-font-dark">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>{lang === 'bn' ? exp.specialtyBn : exp.specialty}</span>
                </div>
                <div className="flex items-center gap-1.5 text-font-light font-bold">
                  <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>{lang === 'bn' ? exp.availabilityBn : exp.availability}</span>
                </div>
              </div>

              <button
                onClick={() => alert('Video consultations require a Smart Khamari Premium Club Membership.')}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-lg transition-colors cursor-pointer shadow-xs border border-primary"
              >
                {t('premium_consultation')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
