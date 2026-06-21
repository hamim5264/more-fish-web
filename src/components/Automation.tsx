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
}

export const Automation: React.FC<AutomationProps> = ({ flow = 'fish' }) => {
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
    if (!tokens[flow]) return;
    api.getPondList(flow)
      .then((response) => {
        const list = response.data || [];
        setPonds(list);
        setSelectedPond((current: any) => current || list[0] || null);
      })
      .catch((error) => console.error('[MoreFish automation] Pond list failed.', error));
  }, [tokens[flow], flow]);

  const loadPondAutomation = async (pond: any) => {
    if (!pond?.id) return;
    setLoading(true);
    setMessage(null);
    setInitialSettings(null);
    try {
      const pondResponse = await api.getPondData(pond.id, undefined, flow);
      const resolvedDeviceId = pondResponse?.data?.device?.id || pondResponse?.raw?.data?.devices?.[0]?.device_id;
      if (!resolvedDeviceId) throw new Error('No device is connected to this pond.');
      const id = String(resolvedDeviceId);
      setDeviceId(id);

      const [automationResponse, cleanerResponse] = await Promise.all([
        api.getAeratorAutomation(id, flow),
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
      await api.saveAeratorAutomation(deviceId, autoEnabled, doMin, doMax, flow);
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

  if (!tokens[flow]) {
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

      <div className="flex items-center gap-3 rounded-3xl border border-cyan-100/40 bg-white/80 p-5 shadow-sm">
        <label className="shrink-0 text-sm font-bold text-font-dark">{t('select_device')}:</label>
        <select
          value={selectedPond?.id || ''}
          onChange={(event) => setSelectedPond(ponds.find((pond) => String(pond.id) === event.target.value) || null)}
          className="cursor-pointer rounded-xl border border-cyan-100 bg-white px-4 py-2 text-sm font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {ponds.map((pond) => <option key={pond.id} value={pond.id}>{pond.asset_name || `Pond ${pond.id}`}</option>)}
        </select>
        {loading && <RefreshCw className="h-5 w-5 animate-spin text-primary" />}

        <div className="ml-auto">
          {message && (
            <div className={`inline-flex items-center max-w-[360px] whitespace-nowrap overflow-hidden text-ellipsis rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg ${message.includes('successfully') ? 'bg-emerald-600' : 'bg-red-500'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="flex flex-col justify-between space-y-6 rounded-3xl border border-cyan-100/40 bg-white/80 p-6 shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-2 text-primary"><Wind className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-bold text-font-dark">DO Automation</h4>
                  <p className="text-[10px] font-bold uppercase text-font-light">Automatic aerator safe zone</p>
                </div>
              </div>
              <button type="button" onClick={() => setAutoEnabled((enabled) => !enabled)} aria-label="Toggle DO automation">
                {autoEnabled ? <ToggleRight className="h-12 w-12 text-primary" /> : <ToggleLeft className="h-12 w-12 text-gray-300" />}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                <span className="text-xs font-bold text-font-dark">Min DO: Aerator ON</span>
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min="3" max="5" step="0.1" inputMode="decimal" value={doMinInput} onChange={(event) => setDoMinInput(event.target.value)} className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 font-black text-primary outline-none focus:ring-2 focus:ring-primary" />
                  <span className="text-xs font-bold text-font-light">mg/L</span>
                </div>
                <p className="mt-2 text-[10px] text-font-light">Valid range: 3.0–5.0</p>
              </label>
              <label className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <span className="text-xs font-bold text-font-dark">Max DO: Aerator OFF</span>
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min="7" max="12" step="0.1" inputMode="decimal" value={doMaxInput} onChange={(event) => setDoMaxInput(event.target.value)} className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 font-black text-primary outline-none focus:ring-2 focus:ring-primary" />
                  <span className="text-xs font-bold text-font-light">mg/L</span>
                </div>
                <p className="mt-2 text-[10px] text-font-light">Valid range: 7.0–12.0</p>
              </label>
            </div>

            {validationError && <div className="flex gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{validationError}</div>}
            {autoEnabled && <div className="flex gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-700"><AlertTriangle className="h-4 w-4 shrink-0" />Manual control is disabled because Automation is active.</div>}
          </div>

          {hasUnsavedChanges && (
            <button onClick={handleSaveAutomation} disabled={saving || !!validationError || !deviceId} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" />Save Settings</>}
            </button>
          )}
        </section>

        <section className="flex flex-col justify-between space-y-6 rounded-3xl border border-cyan-100/40 bg-white/80 p-6 shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-teal-100 bg-teal-50 p-2 text-teal-600"><ShieldCheck className="h-5 w-5" /></div>
                <div><h4 className="font-bold text-font-dark">{t('auto_cleaner')}</h4><p className="text-[10px] font-bold uppercase text-font-light">Backend scheduled sensor cleaning</p></div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${cleanerStatus?.cleaner_status === 1 ? 'border border-teal-100 bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400'}`}>{cleanerStatus?.cleaner_status === 1 ? t('on') : t('off')}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
              <span className="text-xs text-font-light">{t('last_run')}</span>
              <p className="mt-1 font-bold text-font-dark">{cleanerStatus?.last_run_at || cleanerStatus?.last_run || '--:--'}</p>
            </div>
            <div className="flex gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-xs font-medium text-primary"><Info className="h-5 w-5 shrink-0" />{t('cleaner_schedule_note')}</div>
          </div>
          <button onClick={() => selectedPond && loadPondAutomation(selectedPond)} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-3.5 font-bold text-font-dark hover:bg-gray-100 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Check Status</button>
        </section>
      </div>
    </div>
  );
};
