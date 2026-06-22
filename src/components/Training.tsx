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
        <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-2xl text-font-dark">{t('training_workshop')}</h4>
          <p className="text-[11px] font-black text-font-light uppercase">Upskill your aquaculture enterprise</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workshops.map((course) => (
          <div 
            key={course.id} 
            className="bg-gradient-to-br from-indigo-50 to-blue-100/40 border border-indigo-200 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between h-[380px] group"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary bg-white px-2.5 py-1 rounded-full border border-indigo-200 w-fit uppercase tracking-wider shadow-xs">
                {course.duration}
              </span>
              <h4 className="font-black text-lg text-font-dark group-hover:text-primary transition-colors leading-snug">{course.title}</h4>
              <p className="text-xs text-font-light leading-relaxed font-bold">{course.desc}</p>
            </div>

            <div className="space-y-4 border-t border-indigo-100 pt-4">
              <div className="space-y-2 text-xs font-black text-font-dark uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span className="truncate">{course.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-indigo-100 pt-3">
                <span className="font-black text-primary text-sm">Fee: {course.fee}</span>
                <button
                  onClick={() => setRegisteringCourse(course)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer border border-primary"
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
        <div className="fixed inset-0 bg-font-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-white via-cyan-50/20 to-white p-8 rounded-3xl border border-cyan-200 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 select-text">
            <h4 className="font-black text-font-dark text-xl leading-tight border-b border-cyan-100 pb-3">
              Registration Form
            </h4>
            <p className="text-xs font-black text-primary bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-1.5 w-fit uppercase mt-2 shadow-xs">{registeringCourse.title}</p>
            
            {success ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h5 className="font-black text-lg text-font-dark">Registered Successfully</h5>
                <p className="text-xs text-font-light font-bold">We will contact you shortly with course schedules.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-font-dark mb-1.5 uppercase tracking-wide">Your Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-white border border-cyan-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-cyan-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-font-dark mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-white border border-cyan-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-cyan-500" />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setRegisteringCourse(null)}
                    className="flex-1 py-3 bg-white border border-cyan-200 text-font-dark text-xs font-black rounded-xl hover:bg-cyan-50 transition-colors shadow-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer border border-primary"
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
