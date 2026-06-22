import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Waves, RefreshCw, Power, AlertCircle, Info, Database } from 'lucide-react';
import type { AquacultureFlow } from '../types/aquaculture';

interface NanoBubbleProps {
  flow?: AquacultureFlow;
}

export const NanoBubble: React.FC<NanoBubbleProps> = ({ flow = 'fish' }) => {
  // State
  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('');
  const [deviceData, setDeviceData] = useState<any>(null);
  
  // Loaders
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Load device details when selectedPondId changes
  useEffect(() => {
    if (!selectedPondId) return;
    
    const fetchPondDetails = async () => {
      setLoadingData(true);
      setErrorMsg(null);
      try {
        const res = await api.getPondData(selectedPondId, undefined, flow);
        setDeviceData(res.data?.device || null);
      } catch (err) {
        console.error('Failed to load pond telemetry:', err);
        setErrorMsg('Failed to load live hardware data.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPondDetails();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchPondDetails, 10000);
    return () => clearInterval(interval);
  }, [selectedPondId, flow]);

  // Handle Aerator Control Trigger
  const handleToggleAerator = async (aeratorId: string, currentStatus: number) => {
    setActionLoading(aeratorId);
    const targetCommand = currentStatus === 1 ? 0 : 1;
    try {
      await api.controlAerator(aeratorId, targetCommand, flow);
      // Refresh data immediately
      const res = await api.getPondData(selectedPondId, undefined, flow);
      setDeviceData(res.data?.device || null);
    } catch (err) {
      console.error('Failed to control aerator:', err);
      alert('Failed to transmit control signal. Verify hardware is online.');
    } finally {
      setActionLoading(null);
    }
  };

  // Find DO Sensor
  const doSensor = deviceData?.sensors?.find((s: any) => 
    String(s.sensor_name || s.name || '').toUpperCase().includes('DO') ||
    String(s.sensor_name || s.name || '').toUpperCase().includes('DISSOLVED OXYGEN')
  );

  const doValue = doSensor ? parseFloat(doSensor.last_value || doSensor.value || '0') : null;
  const isDoPerfect = doSensor?.danger_status === 'perfect' || doSensor?.danger_status === 'normal' || (doValue !== null && doValue >= 5.0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">Nano Bubble Aeration System</h4>
            <p className="text-[11px] font-black text-font-light uppercase">High-Precision Hardware Control Node</p>
          </div>
        </div>

        {/* Pond Selector */}
        {ponds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-font-light uppercase">Active Pond:</span>
            <select
              value={selectedPondId}
              onChange={(e) => setSelectedPondId(e.target.value)}
              className="px-4 py-2 bg-white border border-cyan-150 rounded-xl text-sm font-bold text-font-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              {ponds.map((p) => (
                <option key={p.id} value={p.id}>{p.asset_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DO Level Telemetry Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100/40 border border-indigo-200 rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[320px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
              <h4 className="font-black text-base text-font-dark flex items-center gap-2">
                <Database className="w-5 h-5 text-primary animate-pulse" />
                Live DO (Dissolved Oxygen) Index
              </h4>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                isDoPerfect 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {isDoPerfect ? 'Perfect' : 'Danger / Action Required'}
              </span>
            </div>
            
            <p className="text-sm text-font-light font-bold leading-relaxed">
              Dissolved Oxygen (DO) is vital to fish respiration. Levels below 3.0 ppm trigger severe stress, and below 2.0 ppm causes mass mortality. Nano bubble systems maintain stable aeration levels.
            </p>
          </div>

          {/* DO Gauge Value */}
          <div className="py-6 flex flex-col items-center justify-center">
            {loadingData ? (
              <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            ) : doValue !== null ? (
              <div className="text-center space-y-1">
                <div className={`text-6xl font-black ${isDoPerfect ? 'text-emerald-600' : 'text-red-500'}`}>
                  {doValue.toFixed(2)}
                </div>
                <div className="text-xs font-black text-font-light uppercase">ppm / mg/L</div>
              </div>
            ) : (
              <div className="text-center py-6 text-font-light text-xs font-bold">
                No active DO sensor readings detected.
              </div>
            )}
          </div>

          <div className="flex gap-2.5 p-4 bg-white border border-indigo-150 rounded-2xl text-xs text-primary leading-relaxed font-bold shadow-xs">
            <Info className="w-4.5 h-4.5 text-primary shrink-0" />
            <span>Reading auto-refreshes every 10 seconds. Keep aerators active during low DO alerts.</span>
          </div>
        </div>

        {/* Aerators Control List Card */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-100/40 border border-cyan-200 rounded-3xl p-6 shadow-md space-y-4">
          <div className="border-b border-cyan-100 pb-3">
            <h4 className="font-black text-base text-font-dark">Hardware Switches (Aerators)</h4>
            <p className="text-[10px] text-font-light font-bold mt-0.5 uppercase">Remote controller command center</p>
          </div>

          {loadingData && !deviceData ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {deviceData?.aerators?.map((aerator: any) => {
                const isOnline = deviceData.is_online;
                const isActive = aerator.status === 1 || aerator.switch_status === 1 || aerator.command === 1;
                const isLoading = actionLoading === aerator.id;

                return (
                  <div 
                    key={aerator.id} 
                    className="p-4 border border-cyan-150 bg-white rounded-2xl flex items-center justify-between shadow-xs"
                  >
                    <div className="space-y-1">
                      <h5 className="font-black text-sm text-font-dark">{aerator.name || `Aerator Unit-${aerator.id}`}</h5>
                      <span className="text-[10px] font-bold text-font-light font-mono block">ID: {aerator.id}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Status indicator */}
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                        isOnline 
                          ? (isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200') 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {isOnline ? (isActive ? 'Running' : 'Stopped') : 'Offline'}
                      </span>

                      {/* Control Button */}
                      <button
                        onClick={() => handleToggleAerator(aerator.id, isActive ? 1 : 0)}
                        disabled={!isOnline || isLoading}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          isActive 
                            ? 'bg-red-50 hover:bg-red-100 text-red-500 border-red-100' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                        title={isActive ? "Stop Aerator" : "Start Aerator"}
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <Power className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!deviceData?.aerators || deviceData.aerators.length === 0) && (
                <div className="text-center py-10 text-font-light text-xs font-bold">
                  No aerators configured under this device node.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
