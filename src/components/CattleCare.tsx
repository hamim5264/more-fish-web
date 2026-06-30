// H:\DMA Hamim\DMA-Web-App\src\components\CattleCare.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import { Auth } from './Auth';
import {
  Activity, Thermometer, Droplets, Sun, Wind, Volume2,
  RefreshCw, Power, AlertTriangle,
  LineChart as ChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';

interface CattleCareProps {
  token?: string;
  userId?: string;
}

export const CattleCare: React.FC<CattleCareProps> = ({ token }) => {
  const { tokens, profiles, allProfiles, loadProfile, viewMode } = useAuth();
  const { t, lang } = useLang();

  const flowProfiles = allProfiles.cattle || [];
  const matchedProfile = token
    ? (flowProfiles.find(p => p.token === token) || null)
    : null;
  const currentProfile = matchedProfile || profiles.cattle || null;
  const userName =
    currentProfile?.full_name ||
    currentProfile?.fullName ||
    `${currentProfile?.first_name || currentProfile?.firstname || currentProfile?.name || ''} ${currentProfile?.last_name || currentProfile?.lastname || ''}`.trim() ||
    currentProfile?.username ||
    currentProfile?.email ||
    'Farmer';

  const isCompact = viewMode === 'multiple' || viewMode === 'grid';

  // --- Sensor helpers (same as PoultryCare) ---
  const getSensorIcon = (name: string) => {
    const lower = name.toLowerCase().trim();
    if (lower.includes('temp')) return Thermometer;
    if (lower.includes('humid')) return Droplets;
    if (lower.includes('nh3') || lower.includes('ammonia')) return Wind;
    if (lower.includes('sound') || lower.includes('noise')) return Volume2;
    if (lower.includes('co2') || lower.includes('carbon')) return Activity;
    if (lower.includes('dust') || lower.includes('pm') || lower.includes('aqi')) return Droplets;
    if (lower.includes('methane') || lower.includes('ch4') || lower.includes('gas') || lower.includes('tvoc') || lower.includes('voc')) return Wind;
    if (lower.includes('light')) return Sun;
    return Activity;
  };

  const getSensorColorDesign = (name: string) => {
    const lower = name.toLowerCase().trim();
    if (lower.includes('temp')) return { bg: 'from-amber-50 to-orange-100/70', border: 'border-orange-200', text: 'text-orange-600' };
    if (lower.includes('humid')) return { bg: 'from-cyan-50 to-sky-100/70', border: 'border-cyan-200', text: 'text-sky-600' };
    if (lower.includes('nh3') || lower.includes('ammonia')) return { bg: 'from-teal-50 to-emerald-100/70', border: 'border-teal-200', text: 'text-emerald-600' };
    if (lower.includes('sound') || lower.includes('noise')) return { bg: 'from-purple-50 to-violet-100/70', border: 'border-purple-200', text: 'text-purple-600' };
    if (lower.includes('co2') || lower.includes('carbon')) return { bg: 'from-rose-50 to-red-100/70', border: 'border-rose-200', text: 'text-red-600' };
    if (lower.includes('dust') || lower.includes('pm')) return { bg: 'from-slate-50 to-gray-100/70', border: 'border-slate-200', text: 'text-slate-600' };
    if (lower.includes('methane') || lower.includes('ch4') || lower.includes('tvoc') || lower.includes('voc')) return { bg: 'from-emerald-50 to-green-100/70', border: 'border-emerald-200', text: 'text-green-600' };
    if (lower.includes('light')) return { bg: 'from-yellow-50 to-amber-100/70', border: 'border-yellow-200', text: 'text-amber-600' };
    return { bg: 'from-blue-50 to-indigo-100/70', border: 'border-blue-200', text: 'text-blue-600' };
  };

  const formatSensorName = (name: string) => {
    const lower = name.toLowerCase().trim();
    const isBn = lang === 'bn';
    if (lower.includes('temp')) return t('air_temp') || 'Air Temp';
    if (lower.includes('humid')) return t('humidity') || 'Humidity';
    if (lower.includes('nh3') || lower.includes('ammonia')) return isBn ? 'অ্যামোনিয়া (NH3)' : 'Ammonia (NH3)';
    if (lower.includes('sound') || lower.includes('noise')) return isBn ? 'শব্দ' : 'Sound';
    if (lower.includes('co2') || lower.includes('carbon')) return isBn ? 'কার্বন ডাই অক্সাইড (CO2)' : 'Carbon Dioxide (CO2)';
    if (lower.includes('pm1_0')) return isBn ? 'পিএম ১.০' : 'PM 1.0';
    if (lower.includes('pm2_5') || lower.includes('pm 2.5')) return isBn ? 'পিএম ২.৫' : 'PM 2.5';
    if (lower.includes('pm10')) return isBn ? 'পিএম ১০' : 'PM 10';
    if (lower.includes('methane') || lower.includes('ch4')) return isBn ? 'মিথেন (CH4)' : 'Methane (CH4)';
    if (lower.includes('tvoc') || lower.includes('voc')) return isBn ? 'টিভিওসি' : 'TVOC';
    if (lower.includes('aqi')) return isBn ? 'একিউআই' : 'AQI';
    if (lower.includes('light')) return isBn ? 'আলোর তীব্রতা' : 'Light Intensity';
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // --- Layout classes ---
  const containerClass = `flex-1 overflow-y-auto select-none max-w-7xl mx-auto w-full ${isCompact ? 'p-3 space-y-4' : 'p-6 space-y-6'}`;
  const bannerClass = `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200 shadow-md ${isCompact ? 'p-3.5 text-xs' : 'p-6 text-base'}`;
  const gridClass = `grid gap-4 ${isCompact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'}`;

  const getCardIconContainer = () =>
    `mx-auto bg-white/70 backdrop-blur-xs rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/80 group-hover:scale-110 transition-transform ${isCompact ? 'w-8 h-8 lg:w-10 lg:h-10 p-1.5' : 'w-10 h-10 lg:w-14 lg:h-14 p-2 lg:p-2.5'}`;

  const cardTitleClass = `font-black text-font-dark/95 leading-tight block text-center tracking-wider mt-2 lg:mt-3 text-base lg:text-lg xl:text-xl`;
  const getCardUnitClass = () => `font-black ml-1 text-inherit ${isCompact ? 'text-[9px] lg:text-xs' : 'text-base lg:text-xl xl:text-2xl'}`;

  const switchContainerClass = `bg-white rounded-3xl border border-slate-200 shadow-md ${isCompact ? 'p-4 space-y-3' : 'p-6 space-y-4'}`;
  const switchTitleClass = `font-black text-font-dark border-b border-slate-100 pb-2 ${isCompact ? 'text-base' : 'text-lg'}`;
  const switchTileClass = `bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs ${isCompact ? 'p-2.5' : 'p-4'}`;
  const switchNameClass = `font-black text-slate-700 ${isCompact ? 'text-xs' : 'text-base'}`;
  const switchIconBgClass = `rounded-xl ${isCompact ? 'p-1.5' : 'p-2.5'}`;

  // --- State ---
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [graphType, setGraphType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);

  useEffect(() => {
    const device = dashboard?.device || null;
    const sensors = device?.sensors || [];
    const targetTime = sensors[0]?.data_time || sensors[0]?.timestamp || sensors[0]?.time || sensors[0]?.updated_at;
    if (!targetTime) return;
    const date = new Date(targetTime);
    if (!isNaN(date.getTime())) {
      date.setHours(date.getHours() + 6);
      const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setLastFetchTime(`${formattedDate} ${formattedTime}`);
    }
  }, [dashboard]);

  const loadFarms = async () => {
    const activeToken = token || tokens.cattle;
    if (!activeToken) return;
    setLoading(true);
    try {
      const res = await api.getCattleFarms(token);
      const list = res.data || [];
      setFarms(list);
      if (list.length > 0) {
        setSelectedFarm(list[0]);
        window.dispatchEvent(new CustomEvent('cattle:farm-changed', { detail: { farmId: list[0].id } }));
      }
    } catch (err) {
      console.error('Failed to load cattle farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, [token, tokens.cattle]);

  const loadFarmDashboard = async (farmId: string) => {
    try {
      const res = await api.getCattleDashboard(farmId, token);
      const data = res.data || res;
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load cattle farm dashboard:', err);
    }
  };

  useEffect(() => {
    if (selectedFarm?.id) {
      loadFarmDashboard(selectedFarm.id);
      // 15-second poll (faster than poultry per spec)
      const timer = setInterval(() => {
        loadFarmDashboard(selectedFarm.id);
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [selectedFarm]);

  const handleToggleSwitch = async (switchId: string, currentState: number) => {
    const automationEnabled = dashboard?.automation_enabled || false;
    if (automationEnabled) {
      alert('Manual control is disabled while automation is ON. Turn off automation in Settings to control manually.');
      return;
    }
    if (!isOnline) {
      alert('Device is offline. Manual control commands cannot be sent.');
      return;
    }
    setControlLoading(switchId);
    const turnOn = currentState === 0;
    const originalSwitches = dashboard?.device?.switches ? [...dashboard.device.switches] : [];
    if (dashboard?.device?.switches) {
      setDashboard({
        ...dashboard,
        device: {
          ...dashboard.device,
          switches: dashboard.device.switches.map((sw: any) =>
            (sw.switch_id === switchId || sw.id === switchId)
              ? { ...sw, command: turnOn ? 1 : 0, is_on: turnOn }
              : sw
          ),
        },
      });
    }
    try {
      await api.controlCattleSwitch(switchId, turnOn);
      setTimeout(() => { if (selectedFarm?.id) loadFarmDashboard(selectedFarm.id); }, 2000);
    } catch {
      if (dashboard?.device) {
        setDashboard({ ...dashboard, device: { ...dashboard.device, switches: originalSwitches } });
      }
      alert('Failed to update switch state.');
    } finally {
      setControlLoading(null);
    }
  };

  const loadGraphData = async () => {
    const activeToken = token || tokens.cattle;
    if (!selectedFarm?.id || !selectedMetric || !activeToken) return;
    setGraphLoading(true);
    setGraphError(null);
    try {
      const res = await api.getCattleGraph(selectedFarm.id, selectedMetric, graphType, activeToken);
      const payload = res?.data?.[0] || res?.[0] || null;
      if (payload && Array.isArray(payload.sensor_val) && Array.isArray(payload.time)) {
        const points = payload.sensor_val.map((val: any, idx: number) => {
          const parsed = parseFloat(String(val));
          return { time: payload.time[idx] || String(idx + 1), value: Number.isFinite(parsed) ? parsed : 0 };
        });
        setGraphData(points);
      } else {
        setGraphData([]);
        setGraphError('No historical data available for this sensor.');
      }
    } catch (err: any) {
      setGraphError(err.message || 'Failed to load graph data.');
      setGraphData([]);
    } finally {
      setGraphLoading(false);
    }
  };

  useEffect(() => { loadGraphData(); }, [selectedMetric, graphType, selectedFarm?.id]);

  if (!(token || tokens.cattle)) {
    return <Auth flow="cattle" onSuccess={() => loadProfile('cattle')} />;
  }

  const device = dashboard?.device || null;
  const isOnline = device?.is_online || false;
  const sensors = device?.sensors || [];
  const switches = device?.switches || [];
  const displayDeviceId = device?.client_id || device?.device_name || selectedFarm?.name || 'Unknown Device';

  return (
    <div className={containerClass}>
      {/* Farm Selector & Status Banner */}
      <div className={bannerClass}>
        <div className="flex items-center gap-3">
          <label className="text-base font-black text-font-dark shrink-0">{t('select_farm')}:</label>
          {loading ? (
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <select
              value={selectedFarm?.id || ''}
              onChange={(e) => {
                const found = farms.find(f => f.id.toString() === e.target.value);
                setSelectedFarm(found || null);
                if (found) window.dispatchEvent(new CustomEvent('cattle:farm-changed', { detail: { farmId: found.id } }));
              }}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer shadow-xs"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name || `Farm ${f.id}`}</option>
              ))}
            </select>
          )}
        </div>

        {selectedFarm && (
          <div className="flex flex-col items-end text-right gap-1.5 self-end sm:self-auto">
            <span className="text-sm font-black text-font-dark">Welcome, {userName}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full ${
              isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {displayDeviceId}
            </span>
          </div>
        )}
      </div>

      {selectedFarm && (
        <div className="space-y-6">
          {/* Farm Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mt-4">
            <h3 className="text-xl font-bold text-slate-700">
              {lang === 'bn' ? 'মনিটরিং:' : 'Monitoring:'} {selectedFarm?.name || 'Cattle Farm'}
            </h3>
            {lastFetchTime && (
              <span className="text-xs text-font-light font-black">
                {lang === 'bn' ? 'সর্বশেষ আপডেট:' : 'Last Updated:'} {lastFetchTime}
              </span>
            )}
          </div>

          {/* Sensor Grid */}
          <div className={gridClass}>
            {sensors
              .filter((sensor: any) => sensor && sensor.name)
              .map((sensor: any) => {
                const name = sensor.name || 'Sensor';
                const formattedName = formatSensorName(name);
                const rawValue = sensor.last_value;
                const value = (rawValue !== null && rawValue !== undefined && String(rawValue).trim() !== '' && String(rawValue).toLowerCase().trim() !== 'no data') ? rawValue : 0;
                const unit = sensor.unit || '';
                const dangerStatus = sensor.danger_status || 'perfect';
                const isDanger = dangerStatus.trim().toLowerCase() !== 'perfect';
                const Icon = getSensorIcon(name);
                const design = getSensorColorDesign(name);
                const sensorKey = sensor.sensor_key || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const active = selectedMetric === sensorKey;

                return (
                  <button
                    key={sensor.id || name}
                    type="button"
                    onClick={() => setSelectedMetric(selectedMetric === sensorKey ? null : sensorKey)}
                    className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 flex flex-col justify-between items-center relative overflow-hidden group text-center transition-all hover:scale-[1.03] cursor-pointer bg-gradient-to-br ${
                      active
                        ? 'border-slate-600 bg-slate-50 shadow-[0_15px_30px_rgba(71,85,105,0.25)] scale-[1.03] ring-4 ring-slate-400/10'
                        : isDanger
                        ? 'bg-gradient-to-br from-red-50 to-orange-100/50 border-red-300 shadow-[0_15px_30px_rgba(239,68,68,0.15)] ring-4 ring-red-100/50'
                        : `${design.bg} ${design.border} shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_-5px_rgba(0,0,0,0.12)]`
                    } ${isCompact ? 'min-h-32 lg:min-h-36 p-3' : 'min-h-44 lg:min-h-56'}`}
                  >
                    <div className="w-full flex flex-col items-center">
                      <div className={getCardIconContainer()}>
                        <Icon className={`w-5 h-5 lg:w-8 lg:h-8 ${isDanger ? 'text-red-500 animate-pulse' : design.text}`} />
                      </div>
                      <span className={cardTitleClass}>{formattedName}</span>
                    </div>
                    <div className={`font-black block tracking-tight mt-3 lg:mt-4 ${isDanger ? 'text-red-600' : design.text} ${
                      isCompact ? 'text-lg lg:text-2xl' : 'text-2xl lg:text-4xl xl:text-5xl'
                    }`}>
                      {value}
                      {unit && <span className={getCardUnitClass()}>{unit}</span>}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Note Box */}
          <div className="bg-slate-100 border border-slate-200 text-slate-700 text-[13px] font-semibold text-center py-2.5 px-3 rounded-[10px] shadow-xs">
            {lang === 'bn'
              ? 'দ্রষ্টব্য: ডিভাইসের ইনস্টলেশন অনুযায়ী প্যারামিটারগুলি পরিবর্তনযোগ্য।'
              : 'Note: The parameters are changeable according to installation of device.'}
          </div>

          {/* Switch Controls */}
          <div className={switchContainerClass}>
            <h4 className={switchTitleClass}>{t('switch_controls')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {switches.map((sw: any) => {
                const isOn = sw.command === 1 || sw.is_on;
                const isPending = controlLoading === sw.switch_id || controlLoading === sw.id;
                const automationEnabled = dashboard?.automation_enabled || false;
                const isDisabled = !isOnline || automationEnabled;
                return (
                  <div
                    key={sw.id || sw.switch_id}
                    className={`${switchTileClass} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${switchIconBgClass} ${isOn ? 'bg-slate-100 text-slate-700' : 'bg-gray-50 text-gray-400'}`}>
                        <Power className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={switchNameClass}>{sw.switch_name || `Switch ${sw.id}`}</h5>
                        {automationEnabled && isOnline && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-md">Auto Mode</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isDisabled || isPending}
                      onClick={() => handleToggleSwitch(sw.switch_id || sw.id, sw.command)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : isOn
                          ? 'bg-slate-700 text-white shadow-xs cursor-pointer'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer'
                      }`}
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Historical Graph Viewer */}
      {selectedFarm && selectedMetric && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-slate-600" />
              <div>
                <h4 className="font-bold text-font-dark">
                  {selectedMetric === 'temperature' ? t('air_temp') :
                   selectedMetric === 'humidity' ? t('humidity') :
                   selectedMetric === 'nh3_gas' ? 'Ammonia (NH3)' :
                   selectedMetric === 'co2' ? 'Carbon Dioxide (CO2)' :
                   selectedMetric === 'pm2_5' ? 'Dust Level (PM 2.5)' :
                   selectedMetric === 'methane_ppm' ? 'Methane (CH4)' :
                   selectedMetric === 'tvoc' ? 'TVOC' :
                   'Sensor'}
                </h4>
                <span className="text-xs text-font-light">Historical Analysis</span>
              </div>
            </div>
            <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setGraphType(period)}
                  className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                    graphType === period ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {period === 'daily' ? '24h' : period === 'weekly' ? '7d' : period === 'monthly' ? '30d' : '1y'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {graphLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
              </div>
            ) : graphError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                <h4 className="font-bold text-font-dark">{graphError}</h4>
              </div>
            ) : graphData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                <ChartIcon className="w-10 h-10 text-slate-300 mb-3" />
                <h4 className="font-bold text-font-dark">No recorded sensor history yet</h4>
                <p className="text-xs text-font-light mt-2">Once your sensor reports data, the chart will populate here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCattleValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#475569" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} fontWeight={500} tickLine={false} minTickGap={30} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight={500} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} padding={{ top: 20, bottom: 20 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.97)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#475569" strokeWidth={3} fillOpacity={1} fill="url(#colorCattleValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
