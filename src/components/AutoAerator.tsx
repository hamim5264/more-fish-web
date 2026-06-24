import React, { useState, useEffect } from 'react';
import { api, normalizeAeratorAutomation } from '../services/api.ts';
import { Radio, RefreshCw, Power, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import type { AquacultureFlow } from '../types/aquaculture';

interface AutoAeratorProps {
  flow?: AquacultureFlow;
  token?: string;
  userId?: string;
}

export const AutoAerator: React.FC<AutoAeratorProps> = ({ flow = 'fish', token }) => {
  // State
  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('');
  const [deviceData, setDeviceData] = useState<any>(null);
  const [automationSettings, setAutomationSettings] = useState<any>(null);
  
  // Loaders
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load ponds on mount
  useEffect(() => {
    const fetchPonds = async () => {
      setErrorMsg(null);
      try {
        const res = await api.getPondList(flow, token);
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
  }, [flow, token]);

  // Load device details and automation state
  useEffect(() => {
    if (!selectedPondId) return;
    
    const fetchPondDetails = async () => {
      setLoadingData(true);
      setErrorMsg(null);
      try {
        // 1. Fetch live telemetry
        const res = await api.getPondData(selectedPondId, undefined, flow, token);
        const device = res.data?.device || null;
        setDeviceData(device);

        // 2. Fetch automation settings if device exists
        if (device?.id) {
          const autoRes = await api.getAeratorAutomation(device.id, flow, token);
          const normalizedAuto = normalizeAeratorAutomation(autoRes);
          setAutomationSettings(normalizedAuto);
        } else {
          setAutomationSettings(null);
        }
      } catch (err) {
        console.error('Failed to load telemetry or automation state:', err);
        setErrorMsg('Failed to sync hardware pairing state.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPondDetails();
  }, [selectedPondId, flow, token]);

  // Handle Control toggling
  const handleToggleControl = async (aeratorId: string, currentStatus: number) => {
    if (automationSettings?.is_enabled) {
      alert('Automation is active! Please disable Auto Mode in Automation Settings before issuing manual commands.');
      return;
    }

    setActionLoading(aeratorId);
    const targetCommand = currentStatus === 1 ? 0 : 1;
    try {
      await api.controlAerator(aeratorId, targetCommand, flow, token);
      // Refresh pond status
      const res = await api.getPondData(selectedPondId, undefined, flow, token);
      setDeviceData(res.data?.device || null);
    } catch (err) {
      console.error('Failed to dispatch aerator signal:', err);
      alert('Failed to execute command. Ensure hardware has active GSM/WiFi coverage.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">Auto Aerator Connection</h4>
            <p className="text-[11px] font-black text-font-light uppercase">Hardware Pairing & Control Registry</p>
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

      {/* Safety Banner */}
      {automationSettings?.is_enabled && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 font-semibold text-xs leading-normal">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Lock Active:</strong> Manual switches are disabled because **Auto Mode (Automation)** is currently running. Disable automation to enable manual controls.
          </span>
        </div>
      )}

      {/* Connection Grid */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100/30 border border-blue-200 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex justify-between items-center border-b border-cyan-50 pb-3">
          <h4 className="font-black text-lg text-font-dark">Paired Aerator Node Interfaces</h4>
          {deviceData && (
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
              deviceData.is_online 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {deviceData.is_online ? 'Gateway Online' : 'Gateway Offline'}
            </span>
          )}
        </div>

        {loadingData && !deviceData ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deviceData?.aerators?.map((aerator: any) => {
              const isDeviceOnline = deviceData.is_online;
              const isAutoEnabled = automationSettings?.is_enabled === true;
              const isActive = aerator.status === 1 || aerator.switch_status === 1 || aerator.command === 1;
              
              // Switch clickability: Online AND Automation is Disabled
              const isToggleable = isDeviceOnline && !isAutoEnabled;
              const isLoading = actionLoading === aerator.id;

              return (
                <div 
                  key={aerator.id}
                  className="bg-gradient-to-br from-cyan-50 to-sky-100/40 border border-cyan-200 rounded-3xl p-5 flex flex-col justify-between h-48 space-y-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 min-w-0">
                      <h5 className="font-black text-base text-font-dark truncate">
                        {aerator.name || `Aerator-${aerator.id}`}
                      </h5>
                      <span className="text-[10px] font-bold text-font-light block uppercase tracking-wider">
                        Hardware Serial
                      </span>
                      <p className="text-[10px] text-font-dark font-mono font-bold truncate">
                        {deviceData.id || 'MFADTU0390061005001'}
                      </p>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      isDeviceOnline 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {isDeviceOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {/* Remote Command Panel */}
                  <div className="flex items-center justify-between border-t border-cyan-50 pt-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-font-light font-bold">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>{isAutoEnabled ? 'Auto-Managed' : 'Manual Override'}</span>
                    </div>

                    <button
                      onClick={() => handleToggleControl(aerator.id, isActive ? 1 : 0)}
                      disabled={!isToggleable || isLoading}
                      className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                      <span>{isActive ? 'Stop' : 'Start'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {(!deviceData?.aerators || deviceData.aerators.length === 0) && (
              <div className="col-span-2 text-center py-10 text-font-light text-xs font-bold space-y-2">
                <Info className="w-8 h-8 text-cyan-200 mx-auto" />
                <p>No aerator equipment linked to this device node.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
