// H:\DMA Hamim\DMA-Web-App\src\components\PoultryCare.tsx
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

interface PoultryCareProps {
  token?: string;
  userId?: string;
}

export const PoultryCare: React.FC<PoultryCareProps> = ({ token }) => {
  const { tokens, profiles, allProfiles, loadProfile, viewMode } = useAuth();
  const { t, lang } = useLang();

  const flowProfiles = allProfiles.poultry || [];
  const matchedProfile = token 
    ? (flowProfiles.find(p => p.token === token) || null)
    : null;
  const currentProfile = matchedProfile || profiles.poultry || null;
  const userName =
    currentProfile?.full_name ||
    currentProfile?.fullName ||
    `${currentProfile?.first_name || currentProfile?.firstname || currentProfile?.name || ''} ${currentProfile?.last_name || currentProfile?.lastname || ''}`.trim() ||
    currentProfile?.username ||
    currentProfile?.email ||
    'Farmer';

  const isCompact = viewMode === 'multiple' || viewMode === 'grid';
  
  const getSensorIcon = (name: string) => {
    const lower = name.toLowerCase().trim();
    if (lower.includes('temp') || lower.includes('air_temp')) return Thermometer;
    if (lower.includes('humid')) return Droplets;
    if (lower.includes('nh3') || lower.includes('ammonia')) return Wind;
    if (lower.includes('sound') || lower.includes('noise')) return Volume2;
    if (lower.includes('co2') || lower.includes('carbon')) return Activity;
    if (lower.includes('dust') || lower.includes('pm') || lower.includes('aqi')) return Droplets;
    if (lower.includes('methane') || lower.includes('ch4') || lower.includes('gas')) return Wind;
    if (lower.includes('light')) return Sun;
    return Activity;
  };

  const getSensorColorDesign = (name: string) => {
    const lower = name.toLowerCase().trim();
    if (lower.includes('temp') || lower.includes('air_temp')) return { bg: 'from-amber-100 to-orange-200/70', border: 'border-orange-300', text: 'text-orange-700' };
    if (lower.includes('humid')) return { bg: 'from-cyan-100 to-sky-200/70', border: 'border-cyan-300', text: 'text-sky-700' };
    if (lower.includes('nh3') || lower.includes('ammonia')) return { bg: 'from-teal-100 to-emerald-200/70', border: 'border-teal-300', text: 'text-emerald-700' };
    if (lower.includes('sound') || lower.includes('noise')) return { bg: 'from-purple-100 to-violet-200/70', border: 'border-purple-300', text: 'text-purple-700' };
    if (lower.includes('co2') || lower.includes('carbon')) return { bg: 'from-rose-100 to-red-200/70', border: 'border-rose-300', text: 'text-red-700' };
    if (lower.includes('dust') || lower.includes('pm') || lower.includes('aqi')) return { bg: 'from-slate-100 to-gray-200/70', border: 'border-slate-300', text: 'text-slate-700' };
    if (lower.includes('methane') || lower.includes('ch4') || lower.includes('gas')) return { bg: 'from-emerald-100 to-green-200/70', border: 'border-emerald-300', text: 'text-green-700' };
    if (lower.includes('light')) return { bg: 'from-yellow-100 to-amber-200/70', border: 'border-yellow-300', text: 'text-amber-700' };
    return { bg: 'from-teal-100 to-emerald-200/70', border: 'border-teal-300', text: 'text-emerald-700' };
  };

  const formatSensorName = (name: string) => {
    const lower = name.toLowerCase().trim();
    const isBn = lang === 'bn';

    if (lower.includes('temp') || lower.includes('air_temp')) return t('air_temp') || 'Air Temp';
    if (lower.includes('humid')) return t('humidity') || 'Humidity';
    if (lower.includes('nh3') || lower.includes('ammonia')) return isBn ? 'অ্যামোনিয়া (NH3)' : 'Ammonia (NH3)';
    if (lower.includes('sound') || lower.includes('noise')) return isBn ? 'শব্দ' : 'Sound';
    if (lower.includes('co2') || lower.includes('carbon')) return isBn ? 'কার্বন ডাই অক্সাইড (CO2)' : 'Carbon Dioxide (CO2)';
    if (lower.includes('pm1_0')) return isBn ? 'পিএম ১.০' : 'PM 1.0';
    if (lower.includes('pm2_5') || lower.includes('pm 2.5')) return isBn ? 'পিএম ২.৫' : 'PM 2.5';
    if (lower.includes('pm10')) return isBn ? 'পিএম ১০' : 'PM 10';
    if (lower.includes('pm4_0') || lower.includes('pm 4.0')) return isBn ? 'পিএম ৪.০' : 'PM 4.0';
    if (lower.includes('voc')) return isBn ? 'ভিওসি' : 'VOC';
    if (lower.includes('aqi')) return isBn ? 'একিউআই' : 'AQI';
    if (lower.includes('methane') || lower.includes('ch4')) return isBn ? 'মিথেন (CH4)' : 'Methane (CH4)';
    if (lower.includes('light') || lower.includes('light_intensity')) return isBn ? 'আলোর তীব্রতা' : 'Light intensity';
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };



  // Responsive layout elements
  const containerClass = `flex-1 overflow-y-auto select-none max-w-7xl mx-auto w-full ${isCompact ? 'p-3 space-y-4' : 'p-6 space-y-6'}`;
  const bannerClass = `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#dbcc68] rounded-3xl border border-[#c4b55c] shadow-md ${isCompact ? 'p-3.5 text-xs' : 'p-6 text-base'}`;
  const gridClass = `grid gap-4 ${isCompact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'}`;
  
  const getCardIconContainer = () => {
    return `mx-auto bg-white/70 backdrop-blur-xs rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/80 group-hover:scale-110 transition-transform ${
      isCompact ? 'w-8 h-8 lg:w-10 lg:h-10 p-1.5' : 'w-10 h-10 lg:w-14 lg:h-14 p-2 lg:p-2.5'
    }`;
  };

  const cardTitleClass = `font-black text-font-dark/95 leading-tight block text-center tracking-wider mt-2 lg:mt-3 ${
    isCompact ? 'text-[9.5px]' : 'text-xs lg:text-sm'
  }`;

  const getCardUnitClass = () => {
    return `font-black ml-1 text-inherit ${
      isCompact ? 'text-[10px] lg:text-sm' : 'text-lg lg:text-2xl xl:text-3xl'
    }`;
  };

  const switchContainerClass = `bg-white rounded-3xl border border-[#c4c5a2]/40 shadow-md ${isCompact ? 'p-4 space-y-3' : 'p-6 space-y-4'}`;
  const switchTitleClass = `font-black text-font-dark border-b border-gray-100 pb-2 ${isCompact ? 'text-base' : 'text-lg'}`;
  const switchTileClass = `bg-white border border-[#c4c5a2]/30 rounded-2xl flex items-center justify-between shadow-xs ${isCompact ? 'p-2.5' : 'p-4'}`;
  const switchNameClass = `font-black text-[#1f6f3c] ${isCompact ? 'text-xs' : 'text-base'}`;
  const switchIconBgClass = `rounded-xl ${isCompact ? 'p-1.5' : 'p-2.5'}`;
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  // Graph states
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [graphType, setGraphType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);

  useEffect(() => {
    const device = dashboard?.device || null;
    const sensors = device?.sensors || [];
    const targetTime = sensors[0]?.data_time || sensors[0]?.timestamp || sensors[0]?.time || sensors[0]?.last_reading_time || sensors[0]?.updated_at;
    if (!targetTime) return;
    
    // Parse and add 6-hour offset (for Bangladesh Time / BST)
    const date = new Date(targetTime);
    if (!isNaN(date.getTime())) {
      date.setHours(date.getHours() + 6);
      
      const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      
      const formattedDate = date.toLocaleDateString('en-US', optionsDate);
      const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
      
      setLastFetchTime(`${formattedDate} ${formattedTime}`);
    }
  }, [dashboard]);

  const loadFarms = async () => {
    const activeToken = token || tokens.poultry;
    if (!activeToken) return;
    setLoading(true);
    try {
      const res = await api.getPoultryFarms(token);
      const list = res.data || [];
      setFarms(list);
      if (list.length > 0) {
        setSelectedFarm(list[0]);
        window.dispatchEvent(new CustomEvent('poultry:farm-changed', { detail: { farmId: list[0].id } }));
      }
    } catch (err) {
      console.error('Failed to load poultry farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, [token, tokens.poultry]);

  const loadFarmDashboard = async (farmId: string) => {
    try {
      const res = await api.getPoultryDashboard(farmId, token);
      const data = res.data || res;
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load poultry farm details:', err);
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
    const automationEnabled = dashboard?.automation_enabled || false;
    if (automationEnabled) {
      alert("Manual control is disabled while automation is ON. Turn off automation in Settings to control manually.");
      return;
    }

    if (!isOnline) {
      alert("Device is offline. Manual control commands cannot be sent.");
      return;
    }

    setControlLoading(switchId);
    const turnOn = currentState === 0;

    // Optimistic UI update
    const originalSwitches = dashboard?.device?.switches ? [...dashboard.device.switches] : [];
    if (dashboard?.device?.switches) {
      const updatedSwitches = dashboard.device.switches.map((sw: any) => {
        if (sw.switch_id === switchId || sw.id === switchId) {
          return { ...sw, command: turnOn ? 1 : 0, is_on: turnOn };
        }
        return sw;
      });
      setDashboard({
        ...dashboard,
        device: {
          ...dashboard.device,
          switches: updatedSwitches
        }
      });
    }

    try {
      await api.controlPoultrySwitch(switchId, turnOn);
      // Success: Wait 2 seconds and refresh dashboard data
      setTimeout(() => {
        if (selectedFarm?.id) {
          loadFarmDashboard(selectedFarm.id);
        }
      }, 2000);
    } catch (err) {
      // Revert UI on error
      if (dashboard?.device) {
        setDashboard({
          ...dashboard,
          device: {
            ...dashboard.device,
            switches: originalSwitches
          }
        });
      }
      alert('Failed to update switch state.');
    } finally {
      setControlLoading(null);
    }
  };

  const loadGraphData = async () => {
    const activeToken = token || tokens.poultry;
    if (!selectedFarm?.id || !selectedMetric || !activeToken) return;
    setGraphLoading(true);
    setGraphError(null);
    try {
      const res = await api.getPoultryGraph(selectedFarm.id, selectedMetric, graphType, activeToken);
      const payload = res?.data?.[0] || res?.[0] || null;
      if (payload && Array.isArray(payload.sensor_val) && Array.isArray(payload.time)) {
        const points = payload.sensor_val.map((val: any, idx: number) => {
          const parsed = parseFloat(String(val));
          return {
            time: payload.time[idx] || String(idx + 1),
            value: Number.isFinite(parsed) ? parsed : 0,
          };
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

  useEffect(() => {
    loadGraphData();
  }, [selectedMetric, graphType, selectedFarm?.id]);

  if (!(token || tokens.poultry)) {
    return <Auth flow="poultry" onSuccess={() => loadProfile('poultry')} />;
  }

  const device = dashboard?.device || null;
  const isOnline = device?.is_online || false;
  const sensors = device?.sensors || [];
  const switches = device?.switches || [];
  const displayDeviceId = device?.client_id || device?.device_name || selectedFarm?.name || "Unknown Device";

  return (
    <div className={containerClass}>
      {/* Farm Selector & Status Banner */}
      <div className={bannerClass}>
        <div className="flex items-center gap-3">
          <label className="text-base font-black text-font-dark shrink-0">{t('select_farm')}:</label>
          {loading ? (
            <RefreshCw className="w-5 h-5 text-font-dark animate-spin" />
          ) : (
            <select
              value={selectedFarm?.id || ''}
              onChange={(e) => {
                const found = farms.find(f => f.id.toString() === e.target.value);
                setSelectedFarm(found || null);
                if (found) {
                  window.dispatchEvent(new CustomEvent('poultry:farm-changed', { detail: { farmId: found.id } }));
                }
              }}
              className="bg-white border border-[#c4b55c]/40 rounded-xl px-4 py-2 font-black text-sm text-[#1f6f3c] focus:outline-none focus:ring-2 focus:ring-[#1f6f3c] cursor-pointer shadow-xs"
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
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              {displayDeviceId}
            </span>
          </div>
        )}
      </div>

      {selectedFarm && (
        <div className="space-y-6">
          {/* Farm Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#dbcc68]/20 pb-3 mt-4">
            <h3 className="text-xl font-bold text-[#1f6f3c]">Monitoring: {selectedFarm?.name || 'Poultry Farm'}</h3>
            {lastFetchTime && (
              <span className="text-xs text-font-light font-black">Last Updated: {lastFetchTime}</span>
            )}
          </div>

          {/* Environment Parameters Grid */}
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
                        ? 'border-[#1f6f3c] bg-[#eaf7ee] shadow-[0_15px_30px_rgba(31,111,60,0.25)] scale-[1.03] ring-4 ring-[#1f6f3c]/10' 
                        : isDanger
                          ? 'bg-gradient-to-br from-red-50 to-orange-100/50 border-red-300 shadow-[0_15px_30px_rgba(239,68,68,0.15)] hover:shadow-[0_25px_50px_-5px_rgba(239,68,68,0.25)] ring-4 ring-red-100/50'
                          : `${design.bg} ${design.border} shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_-5px_rgba(0,0,0,0.12)]`
                    } ${
                      isCompact ? 'min-h-32 lg:min-h-36 p-3' : 'min-h-44 lg:min-h-56'
                    }`}
                  >
                    <div className="w-full flex flex-col items-center">
                      <div className={getCardIconContainer()}>
                        <Icon className={`w-5 h-5 lg:w-8 lg:h-8 ${isDanger ? 'text-red-500 animate-pulse' : design.text}`} />
                      </div>
                      <span className={cardTitleClass}>{formattedName}</span>
                    </div>
                    <div className={`font-black block tracking-tight mt-3 lg:mt-4 ${isDanger ? 'text-red-600' : design.text} ${
                      isCompact ? 'text-xl lg:text-3xl' : 'text-3xl lg:text-5xl xl:text-6xl'
                    }`}>
                      {value}
                      {unit && <span className={getCardUnitClass()}>{unit}</span>}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Note Box */}
          <div className="bg-[#dbcc68] text-font-dark text-[13px] font-semibold text-center py-2.5 px-3 rounded-[10px] shadow-xs">
            {t('poultry_param_note')}
          </div>

          {/* Switch controls & schedules */}
          <div className="w-full">
            
            {/* Switch Controls Column */}
            <div className="w-full space-y-6">
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
                        className={`${switchTileClass} ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${switchIconBgClass} ${isOn ? 'bg-[#eaf7ee] text-[#1f6f3c]' : 'bg-gray-50 text-gray-400'}`}>
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
                                ? 'bg-[#1f6f3c] text-white shadow-xs cursor-pointer' 
                                : 'bg-[#eaf7ee] text-[#1f6f3c] hover:bg-[#d8eedf] border border-[#1f6f3c]/20 cursor-pointer'
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

          </div>
        </div>
      )}

      {/* Historical Graph Viewer */}
      {selectedFarm && selectedMetric && (
        <div className="bg-gradient-to-br from-white to-[#ebffff]/30 border border-[#dbcc68]/30 p-6 rounded-3xl shadow-md space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-[#1f6f3c]" />
              <div>
                <h4 className="font-bold text-font-dark">
                  {selectedMetric === 'temperature' ? t('air_temp') :
                   selectedMetric === 'humidity' ? t('humidity') :
                   selectedMetric === 'nh3_gas' ? 'Ammonia (NH3)' :
                   selectedMetric === 'sound_db' ? 'Sound Level' :
                   selectedMetric === 'co2' ? 'Carbon Dioxide (CO2)' :
                   selectedMetric === 'pm2_5' ? 'Dust Level (PM 2.5)' :
                   selectedMetric === 'methane_ppm' ? 'Methane (CH4)' :
                   'Light Intensity'}
                </h4>
                <span className="text-xs text-font-light">Historical Analysis</span>
              </div>
            </div>

            {/* Config Selectors */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex border border-[#dbcc68]/30 rounded-xl overflow-hidden bg-white">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGraphType(t)}
                    className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                      graphType === t ? 'bg-[#1f6f3c] text-white' : 'text-[#1f6f3c] hover:bg-[#eaf7ee]'
                    }`}
                  >
                    {t === 'daily' ? '24h' : t === 'weekly' ? '7d' : t === 'monthly' ? '30d' : '1y'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full">
            {graphLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#1f6f3c] animate-spin" />
              </div>
            ) : graphError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                <h4 className="font-bold text-font-dark">{graphError}</h4>
                {graphType !== 'daily' && (
                  <p className="text-xs text-font-light mt-2">Check device connectivity and try again.</p>
                )}
              </div>
            ) : graphData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                <ChartIcon className="w-10 h-10 text-[#dbcc68]/60 mb-3" />
                <h4 className="font-bold text-font-dark">No recorded sensor history yet</h4>
                <p className="text-xs text-font-light mt-2">Once your selected sensor reports data, the chart will populate here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPoultryValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dbcc68" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#dbcc68" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EACD" strokeOpacity={0.5}/>
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    fontWeight={500} 
                    tickLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    fontWeight={500} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #E9EACD', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#dbcc68" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPoultryValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
