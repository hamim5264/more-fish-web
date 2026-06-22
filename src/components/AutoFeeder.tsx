import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useLang } from '../context/LanguageContext';
import { Radio, RefreshCw, AlertTriangle, Clock, Plus, Trash2, ShieldCheck, Play } from 'lucide-react';
import type { AquacultureFlow } from '../types/aquaculture';

interface AutoFeederProps {
  flow?: AquacultureFlow;
}

interface FeedSchedule {
  id: string;
  time: string;
  amountKg: number;
  isEnabled: boolean;
}

export const AutoFeeder: React.FC<AutoFeederProps> = ({ flow = 'fish' }) => {
  const { t } = useLang();
  
  // State
  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('');
  const [deviceData, setDeviceData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Demo / Simulation Mode
  const [showDemo, setShowDemo] = useState(false);
  const [demoFeeders, setDemoFeeders] = useState([
    { id: 'feeder-1', name: 'Auto Feeder 1', isOnline: true, isRunning: false, lastFed: 'Today, 09:00 AM' },
    { id: 'feeder-2', name: 'Auto Feeder 2', isOnline: true, isRunning: false, lastFed: 'Yesterday, 05:00 PM' },
  ]);
  const [feedingStates, setFeedingStates] = useState<Record<string, boolean>>({});
  const [schedules, setSchedules] = useState<FeedSchedule[]>([
    { id: '1', time: '09:00', amountKg: 2.5, isEnabled: true },
    { id: '2', time: '17:00', amountKg: 3.0, isEnabled: true },
  ]);

  // Schedule form state
  const [newTime, setNewTime] = useState('12:00');
  const [newAmount, setNewAmount] = useState('2.0');

  // Load ponds on mount
  useEffect(() => {
    const fetchPonds = async () => {
      setErrorMsg(null);
      try {
        const res = await api.getPondList(flow);
        const list = res.data || [];
        setPonds(list);
        if (list.length > 0) {
          setSelectedPondId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch ponds:', err);
        setErrorMsg('Failed to load pond registry.');
      }
    };
    fetchPonds();
  }, [flow]);

  // Load device details
  useEffect(() => {
    if (!selectedPondId) return;
    
    const fetchPondDetails = async () => {
      setLoadingData(true);
      setErrorMsg(null);
      try {
        const res = await api.getPondData(selectedPondId, undefined, flow);
        const device = res.data?.device || null;
        setDeviceData(device);
      } catch (err) {
        console.error('Failed to load telemetry:', err);
        setErrorMsg('Failed to sync hardware pairing state.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPondDetails();
  }, [selectedPondId, flow]);

  // Trigger feeding cycle
  const handleTriggerFeed = (feederId: string) => {
    setFeedingStates((prev) => ({ ...prev, [feederId]: true }));
    
    // Simulate feeder operating for 5 seconds
    setTimeout(() => {
      setFeedingStates((prev) => ({ ...prev, [feederId]: false }));
      
      // Update last fed time
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDemoFeeders((prevFeeders) =>
        prevFeeders.map((f) =>
          f.id === feederId ? { ...f, lastFed: `Today, ${timeStr}` } : f
        )
      );
      alert('Feeding cycle finished! Dispatched ' + newAmount + 'kg fish feed successfully.');
    }, 5000);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime || !newAmount) return;
    
    const newSched: FeedSchedule = {
      id: Math.random().toString(),
      time: newTime,
      amountKg: parseFloat(newAmount) || 1.0,
      isEnabled: true,
    };
    
    setSchedules([...schedules, newSched]);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) =>
        s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
      )
    );
  };

  // Check if we have hardware or if user overrides with demo
  const hasHardware = deviceData?.raw?.feeders && deviceData.raw.feeders.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">{t('auto_feeder_connection')}</h4>
            <p className="text-[11px] font-black text-font-light uppercase">Automatic Dispenser Registry & Timers</p>
          </div>
        </div>

        {/* Pond selection */}
        {ponds.length > 0 && (
          <select
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
            className="px-4 py-2 bg-white border border-cyan-100 rounded-xl text-sm font-bold text-font-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          >
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>{p.asset_name}</option>
            ))}
          </select>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loadingData && !deviceData ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : !hasHardware && !showDemo ? (
        /* Fallback Empty State */
        <div className="bg-gradient-to-br from-cyan-50 to-sky-100/40 border border-cyan-200 rounded-3xl p-10 text-center shadow-md space-y-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-cyan-200 flex items-center justify-center text-primary shadow-sm">
            <Radio className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="font-black text-font-dark text-xl">{t('no_data')}</h3>
            <p className="text-sm text-font-light max-w-md font-semibold leading-relaxed">
              {t('no_feeder_device')} Pair or connect an Auto Feeder hardware unit to manage scheduling and automated feeding cycles.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setShowDemo(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Simulate Demo Feeder
            </button>
            <button
              onClick={() => alert('Contact DMA Technologies sales for Auto Feeder hardware units: +8801898938355')}
              className="px-6 py-3 bg-white hover:bg-cyan-50/50 border border-cyan-100 text-font-dark font-black text-sm rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Purchase Hardware
            </button>
          </div>
        </div>
      ) : (
        /* Feeder Dashboard (Active or Simulated) */
        <div className="space-y-6">
          {/* Status Indicator Banner */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 font-semibold text-xs leading-normal">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>
                <strong>Feeder Module Active:</strong> {showDemo ? 'Demo/Simulation Mode Active' : 'Gateway Connected'}
              </span>
            </div>
            {showDemo && (
              <button
                onClick={() => setShowDemo(false)}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded-lg transition-colors cursor-pointer font-bold"
              >
                Disconnect Demo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feeders Grid */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100/40 border border-indigo-200 rounded-3xl p-6 shadow-md space-y-6">
              <h4 className="font-black text-lg text-font-dark border-b border-indigo-100 pb-3">
                {t('feeder_status')}
              </h4>

              <div className="space-y-4">
                {demoFeeders.map((feeder) => {
                  const isFeeding = feedingStates[feeder.id];
                  return (
                    <div
                      key={feeder.id}
                      className="bg-white border border-indigo-100 rounded-2xl p-5 flex flex-col justify-between h-44 space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-lg text-font-dark">{feeder.name}</h5>
                          <span className="text-[11px] text-font-light font-bold block mt-1">
                            Last Feeding: {feeder.lastFed}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {t('feeder_online')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-cyan-50 pt-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-font-light font-bold">
                          {isFeeding ? (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          )}
                          <span>{isFeeding ? 'Dispensing...' : 'Standby Mode'}</span>
                        </div>

                        <button
                          onClick={() => handleTriggerFeed(feeder.id)}
                          disabled={isFeeding}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-200 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          {isFeeding ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span>{t('manual_feed_trigger')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduler Panel */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/40 border border-emerald-200 rounded-3xl p-6 shadow-md space-y-6">
              <h4 className="font-black text-lg text-font-dark border-b border-emerald-100 pb-3">
                {t('feeder_schedule')}
              </h4>

              {/* Add Schedule Form */}
              <form onSubmit={handleAddSchedule} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[11px] font-black text-font-light uppercase">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-100 rounded-xl text-sm font-semibold text-font-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-[11px] font-black text-font-light uppercase">Amount (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-100 rounded-xl text-sm font-semibold text-font-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </form>

              {/* Schedules List */}
              <div className="space-y-3 pt-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border border-emerald-100 bg-white rounded-2xl shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-font-dark">{schedule.time}</p>
                        <p className="text-[11px] text-font-light font-bold">Release: {schedule.amountKg} kg</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={schedule.isEnabled}
                        onChange={() => handleToggleSchedule(schedule.id)}
                        className="w-4 h-4 rounded border-cyan-200 text-primary focus:ring-primary cursor-pointer"
                      />
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {schedules.length === 0 && (
                  <p className="text-center py-6 text-[11px] font-black text-font-light uppercase">
                    No Scheduled Timers Configured.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
