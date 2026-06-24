import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, RefreshCw, ShieldCheck, ToggleLeft, ToggleRight, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api, normalizeAeratorAutomation } from '../services/api.ts';

interface AutomationSettings {
  isEnabled: boolean;
  doMin: number;
  doMax: number;
}

const getCleanerData = (response: any) => {
  const raw = response?.data ?? response ?? {};
  return Array.isArray(raw) ? raw[0] || {} : raw;
};

import type { AquacultureFlow } from '../types/aquaculture';

interface AutomationProps {
  flow?: AquacultureFlow;
  token?: string;
  userId?: string;
}

export const Automation: React.FC<AutomationProps> = ({ flow = 'fish', token }) => {
  const { tokens } = useAuth();
  const { t } = useLang();
  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [doMinInput, setDoMinInput] = useState('4.0');
  const [doMaxInput, setDoMaxInput] = useState('8.0');
  const [initialSettings, setInitialSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cleanerStatus, setCleanerStatus] = useState<any>(null);

  const doMin = Number(doMinInput);
  const doMax = Number(doMaxInput);
  const validationError = useMemo(() => {
    if (!Number.isFinite(doMin) || !Number.isFinite(doMax)) return 'Enter numeric DO values.';
    if (doMin < 3 || doMin > 5) return 'Minimum DO must be between 3.0 and 5.0 mg/L.';
    if (doMax < 7 || doMax > 12) return 'Maximum DO must be between 7.0 and 12.0 mg/L.';
    if (doMin >= doMax) return 'Minimum DO must be lower than maximum DO.';
    return null;
  }, [doMin, doMax]);

  const hasUnsavedChanges = initialSettings !== null && (
    initialSettings.isEnabled !== autoEnabled ||
    initialSettings.doMin !== doMin ||
    initialSettings.doMax !== doMax
  );

  useEffect(() => {
    const activeToken = token || tokens[flow];
    if (!activeToken) return;
    api.getPondList(flow, token)
      .then((response) => {
        const list = response.data || [];
        setPonds(list);
        setSelectedPond((current: any) => current || list[0] || null);
      })
      .catch((error) => console.error('[MoreFish automation] Pond list failed.', error));
  }, [token, tokens[flow], flow]);

  const loadPondAutomation = async (pond: any) => {
    if (!pond?.id) return;
    setLoading(true);
    setMessage(null);
    setInitialSettings(null);
    try {
      const pondResponse = await api.getPondData(pond.id, undefined, flow, token);
      const resolvedDeviceId = pondResponse?.data?.device?.id || pondResponse?.raw?.data?.devices?.[0]?.device_id;
      if (!resolvedDeviceId) throw new Error('No device is connected to this pond.');
      const id = String(resolvedDeviceId);
      setDeviceId(id);

      const [automationResponse, cleanerResponse] = await Promise.all([
        api.getAeratorAutomation(id, flow, token),
        api.getCleanerStatus(String(pond.id), flow),
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
      sessionStorage.setItem(`${flow}:automation:${id}`, JSON.stringify(baseline));
      window.dispatchEvent(new CustomEvent(`${flow}:automation-changed`, { detail: { deviceId: id, ...baseline } }));
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to load automation settings.';
      console.error('[MoreFish automation] Loading failed.', error);
      setMessage(text);
      setDeviceId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPond) loadPondAutomation(selectedPond);
  }, [selectedPond?.id]);

  const handleSaveAutomation = async () => {
    if (!deviceId || validationError || !hasUnsavedChanges) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.saveAeratorAutomation(deviceId, autoEnabled, doMin, doMax, flow, token);
      const baseline = { isEnabled: autoEnabled, doMin, doMax };
      setInitialSettings(baseline);
      sessionStorage.setItem(`${flow}:automation:${deviceId}`, JSON.stringify(baseline));
      window.dispatchEvent(new CustomEvent(`${flow}:automation-changed`, { detail: { deviceId, ...baseline } }));
      setMessage('Automation settings saved successfully.');
    } catch (error) {
      console.error('[MoreFish automation] Save failed.', error);
      setMessage('Failed to save automation settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!(token || tokens[flow])) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-linear-to-tr from-bg-light to-cyan-50 p-8 text-center">
        <Wind className="mb-4 h-16 w-16 animate-pulse text-cyan-400" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 overflow-y-auto p-6 select-none">
      {/* notification pill moved into the header area for better alignment */}

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
