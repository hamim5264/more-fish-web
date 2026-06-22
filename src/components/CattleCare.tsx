// H:\DMA Hamim\DMA-Web-App\src\components\CattleCare.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import { Auth } from './Auth';
import { 
  Thermometer, Droplets, Sun, Volume2, 
  Trash2, Plus, RefreshCw, Power, Settings, Clock, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export const CattleCare: React.FC = () => {
  const { tokens, loadProfile } = useAuth();
  const { t } = useLang();

  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Automation settings
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [fanTempMin, setFanTempMin] = useState(25.0);
  const [fanTempMax, setFanTempMax] = useState(32.0);
  const [foggerHumidMin, setFoggerHumidMin] = useState(70.0);
  const [savingAuto, setSavingAuto] = useState(false);
  const [autoSuccess, setAutoSuccess] = useState(false);

  // Schedules
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('06:00');
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  const loadFarms = async () => {
    if (!tokens.cattle) return;
    setLoading(true);
    try {
      const res = await api.getCattleFarms();
      const list = res.data || [];
      setFarms(list);
      if (list.length > 0) {
        setSelectedFarm(list[0]);
      }
    } catch (err) {
      console.error('Failed to load cattle farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, [tokens.cattle]);

  // Load Dashboard Data & Automation Settings
  const loadFarmDashboard = async (farmId: string) => {
    try {
      const res = await api.getCattleDashboard(farmId);
      setDashboard(res.data || null);
      
      const autoEnabledState = res.data?.automation_enabled || false;
      setAutoEnabled(autoEnabledState);
      
      // Load schedules
      const lightSchedules = res.data?.light_schedules || [];
      setSchedules(lightSchedules);

      // Load automation details
      const autoRes = await api.getCattleAutomation(parseInt(farmId));
      const autoData = autoRes.data || autoRes;
      if (autoData) {
        setFanTempMin(autoData.fan_temp_min || 25.0);
        setFanTempMax(autoData.fan_temp_max || 32.0);
        setFoggerHumidMin(autoData.fogger_humidity_min || 70.0);
      }
    } catch (err) {
      console.error('Failed to load cattle farm details:', err);
    }
  };

  useEffect(() => {
    if (selectedFarm?.id) {
      loadFarmDashboard(selectedFarm.id);
      
      // Interval poll dashboard every 30s
      const timer = setInterval(() => {
        loadFarmDashboard(selectedFarm.id);
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [selectedFarm]);

  // Switch Toggle Command
  const handleToggleSwitch = async (switchId: string, currentState: number) => {
    setControlLoading(switchId);
    const turnOn = currentState === 0;
    try {
      await api.controlCattleSwitch(switchId, turnOn);
      if (selectedFarm) {
        await loadFarmDashboard(selectedFarm.id);
      }
    } catch (err) {
      alert('Failed to update switch state.');
    } finally {
      setControlLoading(null);
    }
  };

  // Save Automation Settings
  const handleSaveAutomation = async () => {
    if (!selectedFarm?.id) return;
    setSavingAuto(true);
    setAutoSuccess(false);
    try {
      await api.saveCattleAutomation(
        parseInt(selectedFarm.id),
        autoEnabled,
        fanTempMin,
        fanTempMax,
        foggerHumidMin
      );
      setAutoSuccess(true);
      setTimeout(() => setAutoSuccess(false), 2000);
    } catch (err) {
      alert('Failed to save cattle automation.');
    } finally {
      setSavingAuto(false);
    }
  };

  // Add Schedule
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm?.id) return;
    setAddingSchedule(true);
    try {
      await api.addCattleLightSchedule(parseInt(selectedFarm.id), newStart, newEnd);
      await loadFarmDashboard(selectedFarm.id);
    } catch (err) {
      alert('Failed to add schedule.');
    } finally {
      setAddingSchedule(false);
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id: number) => {
    try {
      await api.deleteCattleLightSchedule(id);
      if (selectedFarm) {
        await loadFarmDashboard(selectedFarm.id);
      }
    } catch (err) {
      alert('Failed to delete schedule.');
    }
  };

  if (!tokens.cattle) {
    return <Auth flow="cattle" onSuccess={() => loadProfile('cattle')} />;
  }

  const device = dashboard?.device || null;
  const isOnline = device?.is_online || false;
  const sensors = device?.sensors || [];
  const switches = device?.switches || [];

  // Parse sensor values
  const getSensorVal = (name: string) => {
    const s = sensors.find((x: any) => x.name.toLowerCase().trim() === name.toLowerCase());
    return s?.last_value ? `${s.last_value} ${s.unit || ''}` : '--';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* Farm Selector & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-amber-50 to-orange-100/40 p-6 rounded-3xl border border-amber-200 shadow-md">
        <div className="flex items-center gap-3">
          <label className="text-base font-black text-font-dark shrink-0">{t('select_farm')}:</label>
          {loading ? (
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <select
              value={selectedFarm?.id || ''}
              onChange={(e) => {
                const found = farms.find(f => f.id.toString() === e.target.value);
                setSelectedFarm(found || null);
              }}
              className="bg-white border border-amber-200 rounded-xl px-4 py-2 font-black text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name || `Farm ${f.id}`}</option>
              ))}
            </select>
          )}
        </div>

        {selectedFarm && (
          <div className="flex items-center gap-4">
            <span className={`text-xs font-black uppercase px-3.5 py-1.5 rounded-full flex items-center gap-1.5 ${
              isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
      </div>

      {selectedFarm && (
        <div className="space-y-6">
          {/* Environment Parameters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-100/40 p-5 rounded-3xl border border-red-200 flex flex-col justify-between h-28 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <Thermometer className="absolute right-4 top-4 w-10 h-10 text-orange-500/10 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-font-light uppercase tracking-wider">{t('air_temp')}</span>
              <span className="text-3xl font-black text-font-dark mt-2">{getSensorVal('temperature')}</span>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100/40 p-5 rounded-3xl border border-blue-200 flex flex-col justify-between h-28 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <Droplets className="absolute right-4 top-4 w-10 h-10 text-cyan-500/10 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-font-light uppercase tracking-wider">{t('humidity')}</span>
              <span className="text-3xl font-black text-font-dark mt-2">{getSensorVal('humidity')}</span>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-100/40 p-5 rounded-3xl border border-yellow-200 flex flex-col justify-between h-28 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <Sun className="absolute right-4 top-4 w-10 h-10 text-amber-500/10 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-font-light uppercase tracking-wider">{t('sunlight')}</span>
              <span className="text-3xl font-black text-font-dark mt-2">{getSensorVal('light_intensity')}</span>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-100/40 p-5 rounded-3xl border border-purple-200 flex flex-col justify-between h-28 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <Volume2 className="absolute right-4 top-4 w-10 h-10 text-purple-500/10 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-font-light uppercase tracking-wider">Decibel (Noise)</span>
              <span className="text-3xl font-black text-font-dark mt-2">{getSensorVal('sound_db')}</span>
            </div>
          </div>

          {/* Switch controls & schedules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Switch Controls Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100/40 p-6 rounded-3xl border border-indigo-200 shadow-md space-y-4">
                <h4 className="font-black text-lg text-font-dark border-b border-indigo-100 pb-3">{t('switch_controls')}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {switches.map((sw: any) => {
                    const isOn = sw.command === 1;
                    const isPending = controlLoading === sw.id;
                    return (
                      <div key={sw.id} className="p-4 bg-white border border-indigo-100 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isOn ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'}`}>
                            <Power className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-black text-base text-font-dark">{sw.switch_name || `Switch ${sw.id}`}</h5>
                          </div>
                        </div>
                        <button
                          disabled={isPending}
                          onClick={() => handleToggleSwitch(sw.id, sw.command)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                            isOn ? 'bg-primary text-white shadow-xs' : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                          }`}
                        >
                          {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automation settings */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-100/40 p-6 rounded-3xl border border-pink-200 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <h4 className="font-black text-lg text-font-dark">Cattle Environment Automation</h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoEnabled}
                    onChange={(e) => setAutoEnabled(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-font-dark mb-1">Fan Temp Min Limit</label>
                      <input
                        type="number"
                        disabled={!autoEnabled}
                        value={fanTempMin}
                        onChange={(e) => setFanTempMin(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-pink-200 bg-white rounded-xl text-sm font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-font-dark mb-1">Fan Temp Max Limit</label>
                      <input
                        type="number"
                        disabled={!autoEnabled}
                        value={fanTempMax}
                        onChange={(e) => setFanTempMax(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-pink-200 bg-white rounded-xl text-sm font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-font-dark mb-1">Fogger Humidity Min Threshold (%)</label>
                    <input
                      type="number"
                      disabled={!autoEnabled}
                      value={foggerHumidMin}
                      onChange={(e) => setFoggerHumidMin(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-pink-200 bg-white rounded-xl text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {autoEnabled && (
                  <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-semibold leading-normal">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Switches will control automatically based on thresholds. Manual bypass is locked.</span>
                  </div>
                )}

                <button
                  onClick={handleSaveAutomation}
                  disabled={savingAuto}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingAuto ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : autoSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Automation Saved</span>
                    </>
                  ) : (
                    <span>Save Thresholds</span>
                  )}
                </button>
              </div>
            </div>

            {/* Light Schedules Column */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/40 p-6 rounded-3xl border border-emerald-200 shadow-md flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                <h4 className="font-black text-lg text-font-dark border-b border-emerald-100 pb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Light Timers</span>
                </h4>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {schedules.map((s: any) => (
                    <div key={s.id} className="p-3 bg-white border border-emerald-100 rounded-xl flex items-center justify-between shadow-xs">
                      <div className="text-xs font-black text-font-dark">
                        <span>{s.start_time}</span>
                        <span className="mx-2 text-primary font-bold">to</span>
                        <span>{s.end_time}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {schedules.length === 0 && (
                    <p className="text-xs text-font-light text-center py-6 font-semibold">No timers added yet.</p>
                  )}
                </div>
              </div>

              {/* Add schedule form */}
              <form onSubmit={handleAddSchedule} className="border-t border-emerald-100 pt-4 mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-font-light uppercase mb-0.5">Start Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 18:00"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full px-2 py-1.5 border border-emerald-100 bg-white rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-font-light uppercase mb-0.5">End Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 06:00"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full px-2 py-1.5 border border-emerald-100 bg-white rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingSchedule}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Timer</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
