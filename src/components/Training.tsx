// H:\DMA Hamim\DMA-Web-App\src\components\Training.tsx
import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { BookOpen, Calendar, MapPin, CheckCircle, User, Phone } from 'lucide-react';

export const Training: React.FC = () => {
  const { t } = useLang();
  const [registeringCourse, setRegisteringCourse] = useState<any>(null);
  
  // Registration Inputs
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [success, setSuccess] = useState(false);

  const workshops = [
    { id: 1, title: 'High Density Fish Farming (RAS)', desc: 'Learn to design, operate, and troubleshoot Recirculating Aquaculture Systems for high density stocking.', duration: '3 Days (Theory + Farm Visit)', fee: '৳৫,০০০', schedule: 'July 10-12, 2026', location: 'DMA Head Office & Demo Farm Mymensingh' },
    { id: 2, title: 'Smart Aeration & DO Management', desc: 'Understanding dissolved oxygen dynamics, nano bubbles, and automatic aerator threshold settings.', duration: '1 Day (Technical Workshop)', fee: '৳১,৫০০', schedule: 'July 18, 2026', location: 'Mohammadpur Office, Dhaka' },
    { id: 3, title: 'Biofloc Aquaculture Technology', desc: 'Step by step setup of biofloc tanks, carbon nitrogen ratio management, and water testing methods.', duration: '2 Days', fee: '৳৩,০০০', schedule: 'August 02-03, 2026', location: 'Online Classroom (Zoom Live)' }
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setRegisteringCourse(null);
      setUserName('');
      setUserPhone('');
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
        <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-font-dark">{t('training_workshop')}</h4>
          <p className="text-[10px] font-bold text-font-light uppercase">Upskill your aquaculture enterprise</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workshops.map((course) => (
          <div 
            key={course.id} 
            className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[360px]"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-primary bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100 w-fit uppercase tracking-wider">
                {course.duration}
              </span>
              <h4 className="font-bold text-base text-font-dark leading-snug">{course.title}</h4>
              <p className="text-xs text-font-light leading-relaxed font-semibold">{course.desc}</p>
            </div>

            <div className="space-y-4 border-t border-cyan-50/50 pt-4">
              <div className="space-y-2 text-xs font-semibold text-font-dark">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span className="truncate">{course.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="font-black text-primary text-sm">Course Fee: {course.fee}</span>
                <button
                  onClick={() => setRegisteringCourse(course)}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal overlay */}
      {registeringCourse && (
        <div className="fixed inset-0 bg-font-dark/30 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl border border-cyan-100 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-black text-font-dark leading-tight border-b border-cyan-50 pb-3">
              Registration Form
            </h4>
            <p className="text-xs text-font-light font-bold uppercase mt-1 text-primary">{registeringCourse.title}</p>
            
            {success ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h5 className="font-bold text-font-dark">Registered Successfully</h5>
                <p className="text-xs text-font-light">We will contact you shortly with course schedules.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">Your Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-cyan-100 rounded-2xl text-sm font-semibold focus:outline-none"
                    />
                    <User className="absolute left-3 top-3 w-4 h-4 text-cyan-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-cyan-100 rounded-2xl text-sm font-semibold focus:outline-none"
                    />
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-cyan-500" />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setRegisteringCourse(null)}
                    className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-font-dark text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
