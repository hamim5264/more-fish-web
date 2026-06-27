import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, RefreshCw, ShieldCheck, ToggleLeft, ToggleRight, Wind, Plus, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api, normalizeAeratorAutomation } from '../services/api.ts';
import { ecosystemToAuthFlow } from '../types/navigation';

interface AutomationSettings {
  isEnabled: boolean;
  doMin?: number;
  doMax?: number;
  fanTempMin?: number;
  fanTempMax?: number;
  foggerHumidityMin?: number;
}

const getCleanerData = (response: any) => {
  const raw = response?.data ?? response ?? {};
  return Array.isArray(raw) ? raw[0] || {} : raw;
};

import type { Ecosystem } from '../types/navigation';

interface AutomationProps {
  flow?: Ecosystem;
  token?: string;
  userId?: string;
}

export const Automation: React.FC<AutomationProps> = ({ flow = 'fish', token }) => {
  const { tokens } = useAuth();
  const { t } = useLang();

  // Aquaculture states
  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [doMinInput, setDoMinInput] = useState('4.0');
  const [doMaxInput, setDoMaxInput] = useState('8.0');
  const [cleanerStatus, setCleanerStatus] = useState<any>(null);

  // Poultry & Cattle states
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [fanTempMinInput, setFanTempMinInput] = useState('25.0');
  const [fanTempMaxInput, setFanTempMaxInput] = useState('32.0');
  const [foggerHumidMinInput, setFoggerHumidMinInput] = useState('60.0');
  const [lightSchedules, setLightSchedules] = useState<any[]>([]);
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('22:00');

  // Shared states
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [initialSettings, setInitialSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isPoultry = flow === 'poultry';
  const isCattle = flow === 'cattle';
  const isPoultryOrCattle = isPoultry || isCattle;

  // Aquaculture validations
  const doMin = Number(doMinInput);
  const doMax = Number(doMaxInput);
  const validationError = useMemo(() => {
    if (isPoultryOrCattle) return null;
    if (!Number.isFinite(doMin) || !Number.isFinite(doMax)) return 'Enter numeric DO values.';
    if (doMin < 3 || doMin > 5) return 'Minimum DO must be between 3.0 and 5.0 mg/L.';
    if (doMax < 7 || doMax > 12) return 'Maximum DO must be between 7.0 and 12.0 mg/L.';
    if (doMin >= doMax) return 'Minimum DO must be lower than maximum DO.';
    return null;
  }, [doMin, doMax, isPoultryOrCattle]);

  // Unsaved changes calculation
  const hasUnsavedChanges = useMemo(() => {
    if (initialSettings === null) return false;
    if (isPoultryOrCattle) {
      const minT = parseFloat(fanTempMinInput);
      const maxT = parseFloat(fanTempMaxInput);
      const minH = parseFloat(foggerHumidMinInput);
      return (
        initialSettings.isEnabled !== autoEnabled ||
        initialSettings.fanTempMin !== minT ||
        initialSettings.fanTempMax !== maxT ||
        initialSettings.foggerHumidityMin !== minH
      );
    } else {
      return (
        initialSettings.isEnabled !== autoEnabled ||
        initialSettings.doMin !== doMin ||
        initialSettings.doMax !== doMax
      );
    }
  }, [initialSettings, autoEnabled, doMin, doMax, fanTempMinInput, fanTempMaxInput, foggerHumidMinInput, isPoultryOrCattle]);

  // Load selection list
  useEffect(() => {
    const authFlow = ecosystemToAuthFlow(flow);
    const activeToken = token || (authFlow ? tokens[authFlow] : null);
    if (!activeToken) return;

    if (isPoultry) {
      api.getPoultryFarms(activeToken)
        .then((response) => {
          const list = response.data || [];
          setFarms(list);
          const defaultFarm = list[0] || null;
          setSelectedFarm((current: any) => {
            const resolved = current || defaultFarm;
            if (resolved) {
              window.dispatchEvent(new CustomEvent('poultry:farm-changed', { detail: { farmId: resolved.id } }));
            }
            return resolved;
          });
        })
        .catch((error) => console.error('[Poultry automation] Farm list failed.', error));
    } else if (isCattle) {
      api.getCattleFarms(activeToken)
        .then((response) => {
          const list = response.data || [];
          setFarms(list);
          const defaultFarm = list[0] || null;
          setSelectedFarm((current: any) => {
            const resolved = current || defaultFarm;
            if (resolved) {
              window.dispatchEvent(new CustomEvent('cattle:farm-changed', { detail: { farmId: resolved.id } }));
            }
            return resolved;
          });
        })
        .catch((error) => console.error('[Cattle automation] Farm list failed.', error));
    } else {
      api.getPondList(flow as any, activeToken)
        .then((response) => {
          const list = response.data || [];
          setPonds(list);
          setSelectedPond((current: any) => current || list[0] || null);
        })
        .catch((error) => console.error('[MoreFish automation] Pond list failed.', error));
    }
  }, [token, tokens, flow, isPoultry, isCattle]);

  // Load settings details
  const loadPondAutomation = async (pond: any) => {
    if (!pond?.id) return;
    setLoading(true);
    setMessage(null);
    setInitialSettings(null);
    try {
      const pondResponse = await api.getPondData(pond.id, undefined, flow as any, token);
      const resolvedDeviceId = pondResponse?.data?.device?.id || pondResponse?.raw?.data?.devices?.[0]?.device_id;
      if (!resolvedDeviceId) throw new Error('No device is connected to this pond.');
      const id = String(resolvedDeviceId);
      setDeviceId(id);

      const [automationResponse, cleanerResponse] = await Promise.all([
        api.getAeratorAutomation(id, flow as any, token),
        api.getCleanerStatus(String(pond.id), flow as any),
      ]);
      const settings = normalizeAeratorAutomation(automationResponse);
      const baseline = {
        isEnabled: settings.is_enabled,
        doMin: settings.do_min,
        doMax: settings.do_max,
      };
      setAutoEnabled(baseline.isEnabled);
      setDoMinInput(baseline.doMin.toFixed(1));
      setDoMaxInput(baseline.doMax.toFixed(1));
      setInitialSettings(baseline);
      setCleanerStatus(getCleanerData(cleanerResponse));
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to load automation settings.';
      console.error('[MoreFish automation] Loading failed.', error);
      setMessage(text);
      setDeviceId(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPoultryOrCattleAutomation = async (farm: any) => {
    if (!farm?.id) return;
    setLoading(true);
    setMessage(null);
    setInitialSettings(null);
    try {
      const res = isCattle
        ? await api.getCattleAutomation(farm.id)
        : await api.getPoultryAutomation(farm.id);
      const settings = res.data || res || {};
      setAutoEnabled(settings.is_enabled || false);
      setFanTempMinInput(String(settings.fan_temp_min ?? '25.0'));
      setFanTempMaxInput(String(settings.fan_temp_max ?? '32.0'));
      setFoggerHumidMinInput(String(settings.fogger_humidity_min ?? '60.0'));
      setLightSchedules(settings.light_schedules || []);

      const baseline = {
        isEnabled: settings.is_enabled || false,
        fanTempMin: Number(settings.fan_temp_min ?? 25.0),
        fanTempMax: Number(settings.fan_temp_max ?? 32.0),
        foggerHumidityMin: Number(settings.fogger_humidity_min ?? 60.0),
      };
      setInitialSettings(baseline);
    } catch (error) {
      console.error(`[${flow} automation] Loading failed.`, error);
      setMessage(`Failed to load ${flow} automation settings.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPoultryOrCattle) {
      if (selectedFarm) loadPoultryOrCattleAutomation(selectedFarm);
    } else {
      if (selectedPond) loadPondAutomation(selectedPond);
    }
  }, [selectedFarm?.id, selectedPond?.id, flow, isPoultryOrCattle]);

  const handleSaveAutomation = async () => {
    if (isPoultryOrCattle) {
      if (!selectedFarm?.id || saving) return;
      const minT = parseFloat(fanTempMinInput);
      const maxT = parseFloat(fanTempMaxInput);
      const minH = parseFloat(foggerHumidMinInput);

      if (isNaN(minT) || isNaN(maxT) || isNaN(minH)) {
        setMessage('Please enter valid numeric thresholds.');
        return;
      }
      if (maxT <= minT) {
        setMessage('Max Temperature must be greater than Min Temperature.');
        return;
      }

      setSaving(true);
      setMessage(null);
      try {
        if (isCattle) {
          await api.saveCattleAutomation(selectedFarm.id, autoEnabled, minT, maxT, minH);
        } else {
          await api.savePoultryAutomation(selectedFarm.id, autoEnabled, minT, maxT, minH);
        }
        setInitialSettings({
          isEnabled: autoEnabled,
          fanTempMin: minT,
          fanTempMax: maxT,
          foggerHumidityMin: minH,
        });
        setMessage('Automation settings saved successfully.');
      } catch (error) {
        console.error(`[${flow} automation] Save failed.`, error);
        setMessage('Failed to save automation settings.');
      } finally {
        setSaving(false);
      }
    } else {
      if (!deviceId || validationError || !hasUnsavedChanges) return;
      setSaving(true);
      setMessage(null);
      try {
        await api.saveAeratorAutomation(deviceId, autoEnabled, doMin, doMax, flow as any, token);
        const baseline = { isEnabled: autoEnabled, doMin, doMax };
        setInitialSettings(baseline);
        setMessage('Automation settings saved successfully.');
      } catch (error) {
        console.error('[MoreFish automation] Save failed.', error);
        setMessage('Failed to save automation settings.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAddLightSchedule = async () => {
    if (!selectedFarm?.id) return;
    try {
      setSaving(true);
      if (isCattle) {
        await api.addCattleLightSchedule(selectedFarm.id, newStart, newEnd);
      } else {
        await api.addPoultryLightSchedule(selectedFarm.id, newStart, newEnd);
      }
      await loadPoultryOrCattleAutomation(selectedFarm);
      setMessage('Light schedule added successfully.');
    } catch (error) {
      setMessage('Failed to add light schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLightSchedule = async (scheduleId: number) => {
    if (!selectedFarm?.id) return;
    try {
      setSaving(true);
      if (isCattle) {
        await api.deleteCattleLightSchedule(scheduleId);
      } else {
        await api.deletePoultryLightSchedule(scheduleId);
      }
      await loadPoultryOrCattleAutomation(selectedFarm);
      setMessage('Light schedule deleted successfully.');
    } catch (error) {
      setMessage('Failed to delete light schedule.');
    } finally {
      setSaving(false);
    }
  };

  const authFlowForAuthCheck = ecosystemToAuthFlow(flow);
  if (!(token || (authFlowForAuthCheck ? tokens[authFlowForAuthCheck] : null))) {
    return (
      <div className={`flex flex-1 flex-col items-center justify-center p-8 text-center ${isPoultry ? 'bg-[#ebffff]' : isCattle ? 'bg-slate-50' : 'bg-linear-to-tr from-bg-light to-cyan-50'}`}>
        <Wind className="mb-4 h-16 w-16 animate-pulse text-cyan-400" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
      </div>
    );
  }

  // --- Poultry & Cattle UI Screen ---
  if (isPoultryOrCattle) {
    const mainBg = isPoultry ? 'bg-[#ebffff]' : 'bg-slate-50 border border-slate-200';
    const accentBorder = isPoultry ? 'border-[#c4b55c]/40' : 'border-slate-200';
    const accentBg = isPoultry ? 'bg-[#dbcc68]/20' : 'bg-white';
    const selectColor = isPoultry ? 'text-[#1f6f3c]' : 'text-slate-700';
    const activeRing = isPoultry ? 'focus:ring-[#1f6f3c]' : 'focus:ring-slate-400';
    const msgBg = isPoultry ? 'bg-[#1f6f3c]' : 'bg-slate-700';
    const secBorder = isPoultry ? 'border-[#c4b55c]/30' : 'border-slate-200';
    const iconColor = isPoultry ? 'text-[#1f6f3c]' : 'text-slate-600';
    const iconBg = isPoultry ? 'bg-[#eaf7ee]' : 'bg-slate-100';
    const iconBorder = isPoultry ? 'border-[#c4b55c]/20' : 'border-slate-200';
    const toggleColor = isPoultry ? 'text-[#1f6f3c]' : 'text-slate-600';
    const saveBtnBg = isPoultry ? 'bg-[#1f6f3c] hover:bg-[#154d29]' : 'bg-slate-700 hover:bg-slate-800';

    return (
      <div className={`mx-auto w-full max-w-7xl flex-1 space-y-6 overflow-y-auto p-6 select-none rounded-3xl min-h-screen ${mainBg}`}>
        <div className={`flex items-center gap-4 rounded-3xl border p-6 shadow-md ${accentBorder} ${accentBg}`}>
          <label className="shrink-0 text-base font-black text-font-dark">Select Farm:</label>
          <select
            value={selectedFarm?.id || ''}
            onChange={(event) => {
              const found = farms.find((f) => String(f.id) === event.target.value) || null;
              setSelectedFarm(found);
              if (found) {
                window.dispatchEvent(new CustomEvent(isCattle ? 'cattle:farm-changed' : 'poultry:farm-changed', { detail: { farmId: found.id } }));
              }
            }}
            className={`cursor-pointer rounded-xl border bg-white px-4 py-2 text-sm font-black focus:ring-2 focus:outline-none shadow-xs ${accentBorder} ${selectColor} ${activeRing}`}
          >
            {farms.map((f) => <option key={f.id} value={f.id}>{f.name || `Farm ${f.id}`}</option>)}
          </select>
          {loading && <RefreshCw className={`h-6 w-6 animate-spin ${selectColor}`} />}

          <div className="ml-auto">
            {message && (
              <div className={`inline-flex items-center max-w-[360px] whitespace-nowrap overflow-hidden text-ellipsis rounded-full px-5 py-2.5 text-sm font-black text-white shadow-lg ${message.includes('successfully') || message.includes('added') || message.includes('deleted') ? msgBg : 'bg-red-500'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Settings Section */}
          <section className={`flex flex-col justify-between space-y-6 rounded-3xl border bg-white p-6 shadow-md ${secBorder}`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl border p-2.5 shadow-xs ${iconBorder} ${iconBg} ${iconColor}`}><ShieldCheck className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-black text-xl text-font-dark">{isCattle ? 'Cattle' : 'Poultry'} Automation</h4>
                    <p className="text-[11px] font-black uppercase text-font-light">Manage climate thresholds</p>
                  </div>
                </div>
                <button type="button" onClick={() => setAutoEnabled((enabled) => !enabled)} aria-label="Toggle automation" className="cursor-pointer">
                  {autoEnabled ? <ToggleRight className={`h-14 w-14 ${toggleColor}`} /> : <ToggleLeft className="h-14 w-14 text-gray-300" />}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-xs block">
                  <span className="text-sm font-black text-font-dark">Min Temp: Fan OFF</span>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" step="0.1" value={fanTempMinInput} onChange={(event) => setFanTempMinInput(event.target.value)} className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-black text-base outline-none focus:ring-2 ${selectColor} ${activeRing}`} />
                    <span className="text-sm font-black text-font-light">°C</span>
                  </div>
                </label>
                <label className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-xs block">
                  <span className="text-sm font-black text-font-dark">Max Temp: Fan ON</span>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" step="0.1" value={fanTempMaxInput} onChange={(event) => setFanTempMaxInput(event.target.value)} className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-black text-base outline-none focus:ring-2 ${selectColor} ${activeRing}`} />
                    <span className="text-sm font-black text-font-light">°C</span>
                  </div>
                </label>
                <label className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-xs block sm:col-span-2">
                  <span className="text-sm font-black text-font-dark">Min Humidity: Fogger ON</span>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" step="0.1" value={foggerHumidMinInput} onChange={(event) => setFoggerHumidMinInput(event.target.value)} className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-black text-base outline-none focus:ring-2 ${selectColor} ${activeRing}`} />
                    <span className="text-sm font-black text-font-light">%</span>
                  </div>
                </label>
              </div>

              {autoEnabled && <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-black text-amber-700 shadow-xs"><AlertTriangle className="h-5 w-5 shrink-0" />Manual switches will be locked on the dashboard.</div>}
            </div>

            {hasUnsavedChanges && (
              <button onClick={handleSaveAutomation} disabled={saving} className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black text-sm text-white shadow-md transition-all disabled:opacity-50 ${saveBtnBg}`}>
                {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" />Save Settings</>}
              </button>
            )}
          </section>

          {/* Light Schedules Section */}
          <section className={`flex flex-col justify-between space-y-6 rounded-3xl border bg-white p-6 shadow-md ${secBorder}`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl border p-2.5 shadow-xs ${iconBorder} ${iconBg} ${iconColor}`}><Clock className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-black text-xl text-font-dark">Light Schedules</h4>
                    <p className="text-[11px] font-black uppercase text-font-light">Manage light periods</p>
                  </div>
                </div>
              </div>

              {/* Add schedule form */}
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <span className="text-xs font-black text-font-dark uppercase">Add Period</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-font-light mb-1">Start Time</label>
                    <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className={`w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 ${activeRing}`} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-font-light mb-1">End Time</label>
                    <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className={`w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 ${activeRing}`} />
                  </div>
                  <button onClick={handleAddLightSchedule} disabled={saving} className={`self-end p-3 text-white rounded-xl transition-all shadow-xs cursor-pointer ${saveBtnBg}`}><Plus className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Schedules List */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {lightSchedules.length === 0 ? (
                  <p className="text-xs text-font-light text-center py-6">No light schedules set. Add one above.</p>
                ) : (
                  lightSchedules.map((sch) => (
                    <div key={sch.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${iconColor}`} />
                        <span className="text-xs font-black text-font-dark">{sch.start_time} - {sch.end_time}</span>
                      </div>
                      <button onClick={() => handleDeleteLightSchedule(sch.id)} disabled={saving} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --- Aquaculture UI Screen ---
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 overflow-y-auto p-6 select-none">
      <div className="flex items-center gap-4 rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-100/40 p-6 shadow-md">
        <label className="shrink-0 text-base font-black text-font-dark">{t('select_device')}:</label>
        <select
          value={selectedPond?.id || ''}
          onChange={(event) => setSelectedPond(ponds.find((pond) => String(pond.id) === event.target.value) || null)}
          className="cursor-pointer rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-primary focus:ring-2 focus:ring-primary focus:outline-none shadow-xs"
        >
          {ponds.map((pond) => <option key={pond.id} value={pond.id}>{pond.asset_name || `Pond ${pond.id}`}</option>)}
        </select>
        {loading && <RefreshCw className="h-6 w-6 animate-spin text-primary" />}

        <div className="ml-auto">
          {message && (
            <div className={`inline-flex items-center max-w-[360px] whitespace-nowrap overflow-hidden text-ellipsis rounded-full px-5 py-2.5 text-sm font-black text-white shadow-lg ${message.includes('successfully') ? 'bg-emerald-600' : 'bg-red-500'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="flex flex-col justify-between space-y-6 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100/40 p-6 shadow-md">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-orange-200 bg-white p-2.5 text-primary shadow-xs"><Wind className="h-6 w-6" /></div>
                <div>
                  <h4 className="font-black text-xl text-font-dark">DO Automation</h4>
                  <p className="text-[11px] font-black uppercase text-font-light">Automatic aerator safe zone</p>
                </div>
              </div>
              <button type="button" onClick={() => setAutoEnabled((enabled) => !enabled)} aria-label="Toggle DO automation" className="cursor-pointer">
                {autoEnabled ? <ToggleRight className="h-14 w-14 text-primary" /> : <ToggleLeft className="h-14 w-14 text-gray-300" />}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="rounded-2xl border border-orange-200 bg-white p-4 shadow-xs block">
                <span className="text-sm font-black text-font-dark">Min DO: Aerator ON</span>
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min="3" max="5" step="0.1" inputMode="decimal" value={doMinInput} onChange={(event) => setDoMinInput(event.target.value)} className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 font-black text-primary text-base outline-none focus:ring-2 focus:ring-primary" />
                  <span className="text-sm font-black text-font-light">mg/L</span>
                </div>
                <p className="mt-2 text-[10px] font-bold text-font-light uppercase">Valid range: 3.0–5.0</p>
              </label>
              <label className="rounded-2xl border border-orange-200 bg-white p-4 shadow-xs block">
                <span className="text-sm font-black text-font-dark">Max DO: Aerator OFF</span>
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min="7" max="12" step="0.1" inputMode="decimal" value={doMaxInput} onChange={(event) => setDoMaxInput(event.target.value)} className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 font-black text-primary text-base outline-none focus:ring-2 focus:ring-primary" />
                  <span className="text-sm font-black text-font-light">mg/L</span>
                </div>
                <p className="mt-2 text-[10px] font-bold text-font-light uppercase">Valid range: 7.0–12.0</p>
              </label>
            </div>

            {validationError && <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-black text-red-600 shadow-xs"><AlertTriangle className="h-5 w-5 shrink-0" />{validationError}</div>}
            {autoEnabled && <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-black text-amber-700 shadow-xs"><AlertTriangle className="h-5 w-5 shrink-0" />Manual control is disabled because Automation is active.</div>}
          </div>

          {hasUnsavedChanges && (
            <button onClick={handleSaveAutomation} disabled={saving || !!validationError || !deviceId} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-sm text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" />Save Settings</>}
            </button>
          )}
        </section>

        <section className="flex flex-col justify-between space-y-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100/40 p-6 shadow-md">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-200 bg-white p-2.5 text-teal-600 shadow-xs"><ShieldCheck className="h-6 w-6" /></div>
                <div><h4 className="font-black text-xl text-font-dark">{t('auto_cleaner')}</h4><p className="text-[11px] font-black uppercase text-font-light">Backend scheduled sensor cleaning</p></div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase border ${cleanerStatus?.cleaner_status === 1 ? 'border-teal-200 bg-white text-teal-600' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{cleanerStatus?.cleaner_status === 1 ? t('on') : t('off')}</span>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
              <span className="text-xs font-black text-font-light uppercase">{t('last_run')}</span>
              <p className="mt-1 font-black text-base text-font-dark">{cleanerStatus?.last_run_at || cleanerStatus?.last_run || '--:--'}</p>
            </div>
            <div className="flex gap-2 rounded-2xl border border-teal-200 bg-white p-4 text-xs font-bold text-primary shadow-xs"><Info className="h-5 w-5 shrink-0" />{t('cleaner_schedule_note')}</div>
          </div>
          <button onClick={() => selectedPond && loadPondAutomation(selectedPond)} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white py-4 font-black text-sm text-font-dark hover:bg-emerald-50 transition-colors shadow-xs"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Check Status</button>
        </section>
      </div>
    </div>
  );
};
