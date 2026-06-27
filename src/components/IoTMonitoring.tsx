// H:\DMA Hamim\DMA-Web-App\src\components\IoTMonitoring.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api, normalizeAeratorAutomation } from '../services/api.ts';
import {
  Activity, Droplets, Thermometer, Wind, AlertTriangle, 
  RefreshCw, Power, LineChart as ChartIcon, Zap 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';

import type { AquacultureFlow } from '../types/aquaculture';

const cachePrefix = (flow: AquacultureFlow) => `${flow}:`;

const readSessionCache = <T,>(key: string, maxAgeMs: number, flow: AquacultureFlow = 'fish'): T | null => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(`${cachePrefix(flow)}${key}`) || 'null');
    if (!cached || Date.now() - cached.savedAt > maxAgeMs) return null;
    return cached.value as T;
  } catch {
    return null;
  }
};

const writeSessionCache = (key: string, value: unknown, flow: AquacultureFlow = 'fish') => {
  try {
    sessionStorage.setItem(`${cachePrefix(flow)}${key}`, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Caching is an optimization; live requests remain the source of truth.
  }
};

interface IoTMonitoringProps {
  flow?: AquacultureFlow;
  token?: string;
  userId?: string;
}

export const IoTMonitoring: React.FC<IoTMonitoringProps> = ({ flow = 'fish', token }) => {
  const { tokens, profiles, allProfiles } = useAuth();
  const { t, lang } = useLang();
  
  const flowProfiles = allProfiles[flow] || [];
  const matchedProfile = token 
    ? (flowProfiles.find(p => p.token === token) || null)
    : null;

  const currentProfile = matchedProfile || profiles[flow] || profiles.fish || profiles.poultry || profiles.cattle || null;
  const userName =
    currentProfile?.full_name ||
    currentProfile?.fullName ||
    `${currentProfile?.first_name || currentProfile?.firstname || currentProfile?.name || ''} ${currentProfile?.last_name || currentProfile?.lastname || ''}`.trim() ||
    currentProfile?.username ||
    currentProfile?.email ||
    'Farmer';

  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [farmName, setFarmName] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);

  // Graph states
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [graphType, setGraphType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const graphRequestRef = useRef<{ id: number; controller: AbortController } | null>(null);
  const sensorCacheRef = useRef<Map<string, any[]>>(new Map());
  const pondRequestsRef = useRef<Set<string>>(new Set());
  const pondAbortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
  const [aeratorStates, setAeratorStates] = useState<Record<string, boolean>>({});
  const [busyAerators, setBusyAerators] = useState<Set<string>>(new Set());

  // Load Pond List
  const loadPonds = async () => {
    const activeToken = token || tokens[flow];
    if (!activeToken) return;
    const cached = readSessionCache<any[]>('pond-list', 10 * 60 * 1000, flow);
    if (cached?.length) {
      setPonds(cached);
      setSelectedPond((current: any) => current || cached[0]);
    }
    setLoading(!cached?.length);
    setError(null);
    try {
      const res = await api.getPondList(flow, token);
      console.debug('api.getPondList ->', res);
      const list = res.data || [];
      setPonds(list);
      writeSessionCache('pond-list', list, flow);
      if (list.length > 0) {
        setSelectedPond((current: any) => list.find((pond: any) => pond.id === current?.id) || list[0]);
      }
    } catch (err: any) {
      setError(err.message || t('failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPonds();
  }, [token, tokens[flow], flow]);

  const getDeviceId = (device: any) => {
    return device?.id || device?.device_id || device?.deviceId || null;
  };

  const activeDevice = liveData?.device || null;
  const isOnline = String(activeDevice?.device_status ?? activeDevice?.raw?.device_status ?? '').toLowerCase() === 'online';
  const aeratorsList = activeDevice?.aerators || activeDevice?.relays || activeDevice?.switches || [];

  const metrics = [
    { key: 'temperature', label: lang === 'bn' ? 'তাপমাত্রা' : 'Temperature', query: 'temp', unit: '°C', icon: Thermometer },
    { key: 'do_level', label: lang === 'bn' ? 'ডিও' : 'DO', query: 'do', unit: 'mg/L', icon: Wind },
    { key: 'ph_level', label: lang === 'bn' ? 'পিএইচ' : 'pH', query: 'ph', unit: '', icon: Droplets },
    { key: 'ammonia', label: lang === 'bn' ? 'অ্যামোনিয়া' : 'NH3', query: 'ammonia', unit: 'mg/L', icon: Activity },
    { key: 'tds', label: lang === 'bn' ? 'টিডিএস' : 'TDS', query: 'tds', unit: 'mg/L', icon: Droplets },
    { key: 'salinity', label: lang === 'bn' ? 'লবণাক্ততা' : 'Salinity', query: 'salinity', unit: 'ppt', icon: Droplets },
  ];

  const findSensorByQuery = (sensorList: any[], query: string) => {
    return sensorList.find((sensor) => {
      const name = (sensor.name || sensor.sensor_name || '').toString().toLowerCase();
      return name.includes(query.toLowerCase());
    });
  };

  const getStatusColor = (status: any) => {
    const normalized = typeof status === 'string' ? status.toLowerCase() : status;
    return normalized === 'online' || normalized === true ? 'bg-[#2fbf71]' : 'bg-[#e74c3c]';
  };

  const getStatusLabel = (status: any) => {
    const normalized = typeof status === 'string' ? status.toLowerCase() : status;
    return normalized === 'online' || normalized === true ? 'Online' : 'Offline';
  };

  const metricGraphIdMap: Record<string, string> = {
    ph_level: '1',
    temperature: '2',
    do_level: '3',
    tds: '4',
    ammonia: '5',
    salinity: '6',
  };

  const graphApiTypeMap = {
    weekly: 'daily',
    monthly: 'weekly',
    yearly: 'monthly',
  } as const;

  const getLastFetchFromSensors = (device: any) => {
    if (!device || !Array.isArray(device.sensors) || device.sensors.length === 0) return null;
    const first = device.sensors[0];
    const time = first.data_time ?? first.timestamp ?? first.time ?? first.last_reading_time ?? first.updated_at ?? null;
    return time != null ? String(time) : null;
  };

  const formatDateTime = (value: any) => {
    if (!value) return '--:--';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  };

  const mapGraphData = (apiResponse: any) => {
    const toPoint = (point: any, index: number) => {
      const parsed = typeof point?.value === 'number' ? point.value : Number.parseFloat(String(point?.value));
      if (!Number.isFinite(parsed)) return null;
      return {
        time: point.data_time || point.time || point.label || point.date || String(index + 1),
        value: parsed,
      };
    };
    const normalized = apiResponse?.data ?? [];
    if (Array.isArray(normalized) && normalized.length > 0) {
      return normalized.map(toPoint).filter(Boolean);
    }

    const payload = apiResponse?.raw ?? apiResponse;
    const data = payload?.data ?? payload;

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const sensorVals = data.sensor_val || data.sensor_values || data.values || data.value || data.val || data.reading || null;
      const times = data.time || data.times || data.timestamp || data.timestamps || data.data_time || data.date || null;
      if (Array.isArray(sensorVals) && Array.isArray(times)) {
        return sensorVals
          .map((value: any, index: number) => toPoint({ time: times[index], value }, index))
          .filter(Boolean);
      }
    }

    if (Array.isArray(data) && data.length > 0) {
      return data.map(toPoint).filter(Boolean);
    }

    return [];
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const logGraphDebug = (level: 'info' | 'error', message: string, details?: unknown) => {
    const payload = { level, message, details, timestamp: new Date().toISOString() };
    if (level === 'error') console.error(`[MoreFish graph] ${message}`, details);
    else console.info(`[MoreFish graph] ${message}`, details);

    if (import.meta.env.DEV) {
      fetch('/__client-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    }
  };

  const getAeratorOnline = (aerator: any) => {
    return aerator?.is_online === true;
  };

  const getAeratorPower = (aerator: any) => {
    const aeratorId = String(aerator?.aerator_id || aerator?.id || '');
    if (aeratorId && aeratorStates[aeratorId] !== undefined) {
      return aeratorStates[aeratorId];
    }
    const value = aerator?.command ?? aerator?.is_running ?? aerator?.isRunning ?? aerator?.state ?? aerator?.status ?? aerator?.power ?? aerator?.on;
    return value === 1 || value === true || String(value).toLowerCase() === 'on';
  };

  const getMetricValue = (metricKey: string) => {
    if (!liveData?.device) return null;

    const device = liveData.device;
    const rawDevice = device.raw || {};
    const direct = {
      temperature: device.temperature ?? device.temp ?? device.temp_c ?? device.temp_value ?? rawDevice.temperature ?? rawDevice.temp,
      do_level: device.do_level ?? device.do ?? device.dissolved_oxygen ?? device.do_value ?? rawDevice.do_level ?? rawDevice.do,
      ph_level: device.ph_level ?? device.ph ?? device.ph_value ?? rawDevice.ph_level ?? rawDevice.ph,
      ammonia: device.ammonia ?? device.nh3 ?? device.nh3_value ?? device.nh3_level ?? rawDevice.ammonia ?? rawDevice.nh3,
      tds: device.tds ?? device.tds_level ?? device.tds_value ?? rawDevice.tds ?? rawDevice.tds_level,
      salinity: device.salinity ?? device.salinity_level ?? device.salinity_value ?? rawDevice.salinity ?? rawDevice.salinity_level,
    } as Record<string, any>;

    const directValue = direct[metricKey];
    if (directValue !== null && directValue !== undefined) return directValue;

    const sensorMatch = sensors.find((sensor) => mapSensorToMetricKey(sensor) === metricKey);
    if (sensorMatch && sensorMatch.last_value !== null && sensorMatch.last_value !== undefined) {
      return sensorMatch.last_value;
    }

    const rawSensors = Array.isArray(device.sensors) ? device.sensors : [];
    const nestedSensors = Array.isArray(rawDevice.sensors) ? rawDevice.sensors : Array.isArray(rawDevice.sensor_list) ? rawDevice.sensor_list : [];
    const allSensors = [...rawSensors, ...nestedSensors];
    if (allSensors.length > 0) {
      const fallback = allSensors.find((sensor: any) => mapSensorToMetricKey(sensor) === metricKey);
      if (fallback) return fallback.last_value ?? fallback.value ?? fallback.sensor_val ?? fallback.value_raw ?? null;
    }

    if (device.metrics && typeof device.metrics === 'object') {
      const metricValue = device.metrics[metricKey] ?? device.metrics[metricKey.replace('_', '')];
      if (metricValue !== null && metricValue !== undefined) return metricValue;
    }

    return null;
  };

  const getMetricUnit = (metricKey: string) => {
    if (metricKey === 'temperature') return '°C';
    if (metricKey === 'do_level') return 'mg/L';
    if (metricKey === 'ph_level') return '';
    if (metricKey === 'ammonia') return 'mg/L';
    if (metricKey === 'tds') return 'mg/L';
    if (metricKey === 'salinity') return 'ppt';
    return '';
  };

  const mapSensorToMetricKey = (sensor: any) => {
    const name = (
      sensor.name || sensor.sensor_name || sensor.type || sensor.key ||
      sensor.raw?.name || sensor.raw?.sensor_name || sensor.raw?.type || ''
    ).toString().toLowerCase();
    if (name.includes('temp')) return 'temperature';
    if (name.includes('do') || name.includes('dissolved oxygen')) return 'do_level';
    if (name.includes('ph')) return 'ph_level';
    if (name.includes('ammonia') || name.includes('nh3') || name.includes('nitrite')) return 'ammonia';
    if (name.includes('salinity')) return 'salinity';
    if (name.includes('tds')) return 'tds';
    return null;
  };

  const getLiveSensorForMetric = (metricKey: string) => {
    const deviceSensors = Array.isArray(liveData?.device?.sensors) ? liveData.device.sensors : [];
    return (
      deviceSensors.find((sensor: any) => mapSensorToMetricKey(sensor) === metricKey) ||
      sensors.find((sensor: any) => mapSensorToMetricKey(sensor) === metricKey) ||
      null
    );
  };

  const getMetricDangerStatus = (metricKey: string) => {
    const sensor = getLiveSensorForMetric(metricKey);
    return String(sensor?.danger_status ?? sensor?.raw?.danger_status ?? '').toLowerCase();
  };

  const getSensorWarning = (metricKey: string, rawValue: any) => {
    const value = Number.parseFloat(String(rawValue));
    if (!Number.isFinite(value)) return null;
    if (metricKey === 'ph_level' && value < 7) return 'চুন প্রয়োগ করুন।';
    if (metricKey === 'ph_level' && value > 8.5) return 'টিএসপি, জিপসাম, ভিনেগার অথবা গভীর নলকূপের পানি যোগ করুন।';
    if (metricKey === 'do_level' && value < 3) return 'এরেটর চালান বা গভীর নলকূপের পানি যোগ করুন।';
    if (metricKey === 'tds' && value < 100) return 'চুন, জিপসাম অথবা লবণ যোগ করুন।';
    if (metricKey === 'tds' && value > 1000) return 'গভীর নলকূপের পানি যোগ করুন।';
    if (metricKey === 'temperature' && value > 34) return 'গভীর নলকূপের পানি যোগ করুন।';
    if (metricKey === 'ammonia' && value > 0.5) return 'হররা বা জাল টানুন।';
    return null;
  };

  const getSensorForMetric = (metricKey: string) => {
    const metric = metrics.find((m) => m.key === metricKey);
    if (!metric) return null;
    const candidate = findSensorByQuery(sensors, metric.query);
    if (candidate) return candidate;
    const fallback = sensors.find((sensor) => mapSensorToMetricKey(sensor) === metricKey);
    if (fallback) return fallback;
    return sensors[0] || null;
  };

  const getSensorId = (sensor: any) => {
    if (!sensor) return null;
    return (
      sensor.id ||
      sensor.sensor_id ||
      sensor.sensorId ||
      sensor.raw?.id ||
      sensor.raw?.sensor_id ||
      sensor.raw?.sensorId ||
      null
    );
  };

  const getGraphSensorId = (sensor: any, metricKey?: string) => {
    if (metricKey && metricGraphIdMap[metricKey]) return metricGraphIdMap[metricKey];
    return getSensorId(sensor);
  };

  const handleMetricCardClick = (metricKey: string) => {
    graphRequestRef.current?.controller.abort();
    graphRequestRef.current = null;
    setGraphLoading(false);
    const found = getSensorForMetric(metricKey);
    const targetSensor = found || (sensors[0] || null);

    setSelectedMetric(metricKey);
    setGraphType('daily');
    setSelectedSensor(targetSensor);
    setGraphData([]);

    if (!selectedPond?.id) {
      setGraphError('Select a pond and metric to load history.');
      return;
    }

    const graphSensorId = getGraphSensorId(targetSensor, metricKey);
    if (!graphSensorId) {
      setGraphError('No historical data available for this sensor.');
      return;
    }

    setGraphError('Data not found');
  };

  // Load Pond Live Data and Sensors
  const loadPondData = async (pondId: string) => {
    if (graphRequestRef.current) return;
    const requestKey = String(pondId);
    if (pondRequestsRef.current.has(requestKey)) return;
    pondRequestsRef.current.add(requestKey);
    const controller = new AbortController();
    pondAbortControllersRef.current.set(requestKey, controller);

    try {
      const res = await api.getPondData(pondId, controller.signal, flow, token);
      console.debug('api.getPondData ->', res);
      const responseData: any = res.data || res;
      const device = responseData?.device || (Array.isArray(responseData?.devices) ? responseData.devices[0] : null);
      setLiveData(responseData || null);
      
      const aerators = device?.aerators || device?.relays || device?.switches || [];
      aerators.forEach((aerator: any) => {
        const aeratorId = String(aerator.aerator_id || aerator.id || '');
        if (!busyAerators.has(aeratorId)) {
          const isRunning = aerator.command === 1 || aerator.is_running === true || aerator.isRunning === true || aerator.status === 1 || String(aerator.status).toLowerCase() === 'on' || aerator.on === true;
          setAeratorStates(prev => ({
            ...prev,
            [aeratorId]: isRunning
          }));
        }
      });
      setFarmName(
        responseData?.asset?.asset_name ||
        responseData?.asset_name ||
        responseData?.asset?.name ||
        responseData?.name ||
        responseData?.asset ||
        selectedPond?.asset_name ||
        selectedPond?.name ||
        selectedPond?.asset ||
        ''
      );
      setLastFetchTime(getLastFetchFromSensors(device) ?? device?.last_reading_time ?? device?.last_synced ?? device?.last_seen ?? device?.lastUpdate ?? null);

      const deviceId = getDeviceId(device);
      if (deviceId) {
        try {
          const autoRes = await api.getAeratorAutomation(deviceId, flow, token);
          const settings = normalizeAeratorAutomation(autoRes);
          setIsAutomationEnabled(settings.is_enabled);
        } catch (autoErr) {
          console.error('Failed to load aerator automation status:', autoErr);
        }
      }
      let sensorList = deviceId ? sensorCacheRef.current.get(String(deviceId)) || [] : [];
      if (deviceId) {
        if (sensorList.length === 0) {
          const sensorRes = await api.getSensorList(deviceId, flow, token);
          console.debug('api.getSensorList ->', sensorRes);
          sensorList = sensorRes.data || [];
        }
        // Fallback: if API returns empty sensor list, try sensors embedded in device payload
        if ((!sensorList || sensorList.length === 0) && Array.isArray(device?.sensors) && device.sensors.length > 0) {
          console.debug('Falling back to device.sensors from pond payload', device.sensors);
          sensorList = device.sensors.map((s: any) => ({
            id: s.id || s.sensor_id || s.sensorId || s.sensor_uuid || s.uuid || null,
            name: s.sensor_name || s.name || s.type || s.key || `Sensor ${s.id || s.sensor_id || ''}`,
            last_value: s.last_value ?? s.value ?? s.last ?? s.sensor_val ?? s.value_raw ?? null,
            unit: s.sensor_unit || s.unit || null,
            danger_status: String(s.danger_status || '').toLowerCase(),
            raw: s,
          }));
        }

        if ((!sensorList || sensorList.length === 0) && Array.isArray(device?.sensor_list) && device.sensor_list.length > 0) {
          sensorList = device.sensor_list.map((s: any) => ({
            id: s.id || s.sensor_id || s.sensorId || s.sensor_uuid || s.uuid || null,
            name: s.sensor_name || s.name || s.type || s.key || `Sensor ${s.id || s.sensor_id || ''}`,
            last_value: s.last_value ?? s.value ?? s.last ?? s.sensor_val ?? s.value_raw ?? null,
            unit: s.sensor_unit || s.unit || null,
            danger_status: String(s.danger_status || '').toLowerCase(),
            raw: s,
          }));
        }

        sensorCacheRef.current.set(String(deviceId), sensorList);
        setSensors(sensorList);
      } else {
        setSensors([]);
        setSelectedSensor(null);
      }

      writeSessionCache(`pond-data:${pondId}`, {
        liveData: responseData || null,
        sensors: sensorList,
        farmName:
          responseData?.asset?.asset_name || responseData?.asset_name || responseData?.asset?.name ||
          responseData?.name || responseData?.asset || selectedPond?.asset_name || selectedPond?.name || '',
        lastFetchTime: getLastFetchFromSensors(device) ?? device?.last_reading_time ?? device?.last_synced ?? device?.last_seen ?? null,
        deviceId,
      }, flow);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('Failed to load pond details:', err);
    } finally {
      pondRequestsRef.current.delete(requestKey);
      pondAbortControllersRef.current.delete(requestKey);
    }
  };

  useEffect(() => {
    if (!selectedPond?.id) return;

    const cached = readSessionCache<any>(`pond-data:${selectedPond.id}`, 10 * 60 * 1000, flow);
    if (cached) {
      setLiveData(cached.liveData);
      setSensors(cached.sensors || []);
      setFarmName(cached.farmName || '');
      setLastFetchTime(cached.lastFetchTime || null);
      if (cached.deviceId && cached.sensors?.length) {
        sensorCacheRef.current.set(String(cached.deviceId), cached.sensors);
      }
    }

    loadPondData(selectedPond.id);
    const timer = setInterval(() => {
      loadPondData(selectedPond.id);
    }, 2000);

    const handleAutoChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const device = liveData?.device || (liveData?.devices && liveData.devices[0]);
        const deviceId = getDeviceId(device);
        if (deviceId && String(customEvent.detail.deviceId) === String(deviceId)) {
          setIsAutomationEnabled(customEvent.detail.isEnabled);
        }
      }
    };
    window.addEventListener(`${flow}:automation-changed`, handleAutoChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener(`${flow}:automation-changed`, handleAutoChange);
    };
  }, [selectedPond?.id, flow, liveData]);

  // Fetch Graph Data
  const loadGraphFor = async (assetId: string, sensorId: number | string, type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (!assetId || !sensorId) return;
    if (type === 'daily') {
      setGraphLoading(false);
      setGraphData([]);
      setGraphError('Data not found');
      return;
    }
    const apiType = graphApiTypeMap[type];
    pondAbortControllersRef.current.forEach((controller) => controller.abort());
    const graphCacheKey = `graph:${assetId}:${sensorId}:${apiType}`;
    const cachedGraph = readSessionCache<any[]>(graphCacheKey, 2 * 60 * 1000, flow);
    graphRequestRef.current?.controller.abort();
    const request = {
      id: (graphRequestRef.current?.id ?? 0) + 1,
      controller: new AbortController(),
    };
    graphRequestRef.current = request;
    if (cachedGraph?.length) {
      setGraphData(cachedGraph);
      setGraphError(null);
    }
    setGraphLoading(!cachedGraph?.length);
    setGraphError(null);
    const startedAt = Date.now();
    logGraphDebug('info', 'Fetching graph data', { assetId, sensorId, period: type, apiType });
    try {
      const res = await api.getGraphData(
        assetId,
        sensorId,
        apiType,
        request.controller.signal,
        flow,
        token
      );
      if (graphRequestRef.current !== request) return;
      console.debug('api.getGraphData ->', res);
      const formatted = mapGraphData(res);
      if (!Array.isArray(formatted) || formatted.length === 0) {
        logGraphDebug('error', 'Graph API returned no usable points', { assetId, sensorId, period: type, apiType, response: res.raw });
        setGraphError('No historical data available for this sensor.');
        setGraphData([]);
        return;
      }

      writeSessionCache(graphCacheKey, formatted, flow);
      logGraphDebug('info', 'Graph data loaded', {
        assetId,
        sensorId,
        period: type,
        apiType,
        points: formatted.length,
        elapsedMs: Date.now() - startedAt,
        sample: formatted.slice(0, 3),
      });
      setGraphData(formatted);
      setGraphError(null);
    } catch (err: any) {
      if (request.controller.signal.aborted || graphRequestRef.current !== request) return;
      logGraphDebug('error', 'Failed to load graph data', {
        assetId,
        sensorId,
        period: type,
        apiType,
        elapsedMs: Date.now() - startedAt,
        error: err instanceof Error ? err.message : String(err),
      });
      setGraphError(err.message || 'Failed to load historical graph data.');
      setGraphData([]);
    } finally {
      if (graphRequestRef.current === request) {
        graphRequestRef.current = null;
        setGraphLoading(false);
      }
    }
  };

  useEffect(() => {
    if (graphType === 'daily') {
      graphRequestRef.current?.controller.abort();
      graphRequestRef.current = null;
      setGraphLoading(false);
      if (selectedMetric) {
        setGraphData([]);
        setGraphError('Data not found');
      }
      return;
    }

    if (!selectedPond?.id || !selectedMetric) return;
    const graphSensorId = selectedSensor ? getGraphSensorId(selectedSensor, selectedMetric) : metricGraphIdMap[selectedMetric];
    if (!graphSensorId) {
      setGraphLoading(false);
      setGraphError('No sensor is mapped to this metric.');
      logGraphDebug('error', 'No sensor ID mapped for selected metric', { selectedMetric });
      return;
    }
    loadGraphFor(selectedPond.id, graphSensorId, graphType);

    return () => graphRequestRef.current?.controller.abort();
  }, [graphType, selectedMetric, selectedPond?.id, selectedSensor?.id]);

  // Toggle Aerator command
  const handleToggleAerator = async (aerator: any, aeratorOnline: boolean) => {
    const aeratorId = String(aerator.aerator_id || aerator.id || '');
    console.log('[handleToggleAerator] Clicked aerator:', aeratorId, 'online:', aeratorOnline);
    console.log('[handleToggleAerator] isAutomationEnabled:', isAutomationEnabled, 'busyAerators:', Array.from(busyAerators));

    // 1. Check Guard
    if (isAutomationEnabled) {
      console.warn('[handleToggleAerator] Blocked: Automation is enabled');
      showToast(t('manual_control_disabled') || 'Manual control is disabled while Automation is ON.');
      return;
    }
    if (!aeratorOnline) {
      console.warn('[handleToggleAerator] Blocked: Aerator is offline');
      showToast('This aerator is offline');
      return;
    }
    if (busyAerators.has(aeratorId)) {
      console.warn('[handleToggleAerator] Blocked: Aerator is busy (debouncing)');
      return;
    }

    const currentStatus = getAeratorPower(aerator);
    const nextStatus = !currentStatus;

    // 1. Enter Busy Mode (prevents double clicks)
    setBusyAerators(prev => {
      const next = new Set(prev);
      next.add(aeratorId);
      return next;
    });

    // 2. Optimistic UI Update (Update UI instantly)
    setAeratorStates(prev => ({
      ...prev,
      [aeratorId]: nextStatus
    }));

    // Network Request
    const requestPayload = {
      aerator_id: aeratorId,
      command: nextStatus ? 1 : 0
    };
    console.log('--- SENDING COMMAND TO API ---');
    console.log('Endpoint: POST /devices/aerators/command/');
    console.log('Payload:', JSON.stringify(requestPayload, null, 2));

    try {
      const res = await api.controlAerator(aeratorId, nextStatus ? 1 : 0, flow, token);
      console.log('--- API RESPONSE RECEIVED (SUCCESS) ---');
      console.log('Response:', JSON.stringify(res, null, 2));

      // Success: Keep the optimistic state, but wait for next poll to unlock
      if (selectedPond) {
        await loadPondData(selectedPond.id);
      }
    } catch (err: any) {
      console.error('--- API RESPONSE RECEIVED (ERROR) ---');
      console.error('Error Details:', err);
      // 3. Rollback on Failure
      setAeratorStates(prev => ({
        ...prev,
        [aeratorId]: currentStatus
      }));
      showToast('Failed to send command');
    } finally {
      // 4. Unlock after a short delay (Crucial!)
      // We wait 5 seconds to give hardware time to update before polling resumes for this ID
      setTimeout(() => {
        setBusyAerators(prev => {
          const next = new Set(prev);
          next.delete(aeratorId);
          return next;
        });
      }, 5000);
    }
  };

  if (!(token || tokens[flow])) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-linear-to-tr from-bg-light to-cyan-50">
        <Activity className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
        <p className="text-sm text-font-light max-w-sm mt-2">Authentication is required to view live IoT sensors and control hardware.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 select-none max-w-7xl mx-auto w-full">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-font-dark px-5 py-3 text-sm font-bold text-white shadow-lg">
          {toastMessage}
        </div>
      )}
      {/* Top Pond Select & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4 bg-gradient-to-r from-teal-50 to-emerald-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-teal-100 shadow-md">
        <div className="flex items-center gap-3">
          <label className="text-xs lg:text-sm font-bold text-font-dark shrink-0">{t('select_device')}:</label>
          {loading ? (
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <select
              value={selectedPond?.id || ''}
              onChange={(e) => {
                const found = ponds.find(p => p.id.toString() === e.target.value);
                setSelectedPond(found || null);
                setSelectedMetric(null);
                setSelectedSensor(null);
                setGraphData([]);
                setGraphError(null);
              }}
              className="bg-white border border-cyan-100 rounded-xl px-3 py-1.5 lg:px-4 lg:py-2 font-bold text-xs lg:text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {ponds.map((p) => (
                <option key={p.id} value={p.id}>{p.asset_name || `Pond ${p.id}`}</option>
              ))}
            </select>
          )}
        </div>

        {selectedPond && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
            <div className="flex flex-col gap-1 lg:gap-2">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-xs lg:text-sm font-bold text-font-dark">{userName}</span>
                <span className={`inline-flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs font-bold px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full ${
                  isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'
                }`}>
                  <span className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${isOnline ? 'bg-[#00cc00]' : 'bg-red-500'}`}></span>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <span className="text-[10px] lg:text-xs text-font-light">Farm: {farmName || selectedPond.asset_name || selectedPond.name || selectedPond.asset || 'Farm'}</span>
            </div>
            <div className="flex flex-col text-[10px] lg:text-xs font-semibold text-font-light">
              <span>
                Last updated: {formatDateTime(lastFetchTime ?? liveData?.device?.last_reading_time ?? liveData?.device?.last_synced ?? liveData?.device?.last_seen)}
              </span>
              {aeratorsList.length > 0 && (
                <span>
                  Aerator status: {aeratorsList.some((a: any) => getAeratorPower(a)) ? 'On' : 'Off'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 font-semibold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sensor Metric Cards */}
      {selectedPond && (() => {
        const visibleMetrics = metrics.filter((m) => {
          const val = getMetricValue(m.key);
          return val !== null && val !== undefined;
        });

        if (visibleMetrics.length === 0) {
          return (
            <div className="p-8 text-center bg-cyan-50/20 border border-cyan-100 rounded-3xl">
              <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-bold text-font-light">{t('waiting_for_live_data') || 'Waiting for live data...'}</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {visibleMetrics.map((metric) => {
              const Icon = metric.icon;
              const value = getMetricValue(metric.key);
              const active = selectedMetric === metric.key;
              const dangerStatus = getMetricDangerStatus(metric.key);
              const isPerfect = dangerStatus === 'perfect';
              const isInvalid = dangerStatus === 'invalid';
              const warning = isInvalid ? null : getSensorWarning(metric.key, value);

              // Colorful card styling mapping
              const colorMap: Record<string, { bg: string, border: string, text: string, icon: string }> = {
                temperature: { bg: 'from-amber-100 to-orange-200/70', border: 'border-orange-300', text: 'text-orange-700', icon: 'text-orange-500/30' },
                do_level: { bg: 'from-cyan-100 to-sky-200/70', border: 'border-cyan-300', text: 'text-sky-700', icon: 'text-sky-500/30' },
                ph_level: { bg: 'from-teal-100 to-emerald-200/70', border: 'border-teal-300', text: 'text-emerald-700', icon: 'text-emerald-500/30' },
                ammonia: { bg: 'from-emerald-100 to-green-200/70', border: 'border-emerald-300', text: 'text-green-700', icon: 'text-green-500/30' },
                tds: { bg: 'from-blue-100 to-indigo-200/70', border: 'border-blue-300', text: 'text-indigo-700', icon: 'text-indigo-500/30' },
                salinity: { bg: 'from-purple-100 to-violet-200/70', border: 'border-purple-300', text: 'text-purple-700', icon: 'text-purple-500/30' },
              };
              const design = colorMap[metric.key] || colorMap.temperature;

               return (
                <button
                  key={metric.key}
                  type="button"
                  onClick={() => handleMetricCardClick(metric.key)}
                  className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 flex flex-col justify-between items-center min-h-44 lg:min-h-56 relative overflow-hidden group text-center transition-all hover:scale-[1.03] cursor-pointer ${
                    active 
                      ? 'border-primary bg-sky-100/60 shadow-[0_15px_30px_rgba(2,132,199,0.25)] scale-[1.03] ring-4 ring-primary/10' 
                      : isPerfect 
                        ? `bg-gradient-to-br ${design.bg} ${design.border} shadow-[0_15px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_25px_50px_-5px_rgba(0,0,0,0.22)]` 
                        : 'bg-gradient-to-br from-red-50 to-orange-100/50 border-red-300 shadow-[0_15px_30px_rgba(239,68,68,0.15)] hover:shadow-[0_25px_50px_-5px_rgba(239,68,68,0.25)]'
                  }`}
                >
                  <div className="w-full flex flex-col items-center">
                    <div className="mx-auto w-10 h-10 lg:w-14 lg:h-14 bg-white/70 backdrop-blur-xs rounded-xl lg:rounded-2xl flex items-center justify-center p-2 lg:p-2.5 shadow-sm border border-white/80 group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 lg:w-8 lg:h-8 ${isPerfect ? design.text : 'text-red-500'}`} />
                    </div>
                    <div className="text-xs lg:text-sm xl:text-base font-black tracking-wider text-font-dark/95 leading-tight block text-center mt-2 lg:mt-3">{metric.label}</div>
                  </div>
                  <div className="mt-3 lg:mt-4 text-center">
                    <div
                      className={`text-3xl lg:text-5xl xl:text-6xl font-black block tracking-tight ${
                        isPerfect ? design.text : 'text-red-600'
                      }`}
                    >
                      {isInvalid ? 'No Data' : value !== null && value !== undefined ? value : '--'}
                      {!isInvalid && value !== null && value !== undefined && (
                        <span className="text-lg lg:text-2xl xl:text-3xl font-black ml-1 text-inherit">{getMetricUnit(metric.key)}</span>
                      )}
                    </div>
                    {warning && (
                      <p className="mt-2 text-[10px] lg:text-xs font-black leading-relaxed text-red-600 bg-white/60 p-1.5 lg:p-2 rounded-lg lg:rounded-xl border border-red-200">{warning}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Aerator Switch Panels */}
      {selectedPond && aeratorsList.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-font-dark">{t('switch_controls')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aeratorsList.map((aerator: any) => {
              const isOn = getAeratorPower(aerator);
              const online = getAeratorOnline(aerator);
              const isPending = busyAerators.has(String(aerator.aerator_id || aerator.id || ''));
              return (
                <div
                  key={aerator.id}
                  className="bg-gradient-to-br from-indigo-50 to-sky-50/50 p-6 rounded-3xl border border-indigo-100 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${isOn ? 'bg-cyan-50 text-primary border-cyan-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-font-dark">{aerator.aerator_name || `Aerator ${aerator.id}`}</h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                        <span>Pond aerator</span>
                        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${getStatusColor(online)}`}></span>
                        <span>{getStatusLabel(online)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isPending}
                    aria-disabled={!online}
                    onClick={() => handleToggleAerator(aerator, online)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all ${
                      isOn
                        ? 'bg-[#2fbf71] hover:bg-[#259b5c] text-white shadow-md shadow-emerald-100 border border-[#2fbf71]'
                        : 'bg-[#e74c3c] hover:bg-[#c0392b] text-white shadow-md shadow-red-100 border border-[#e74c3c]'
                    } ${!online ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPending ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Power className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Graph Viewer */}
      {selectedPond && selectedMetric && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-100 p-6 rounded-3xl shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-bold text-font-dark">{metrics.find((m) => m.key === selectedMetric)?.label || 'Historical Analysis'}</h4>
                <span className="text-xs text-font-light">{selectedSensor?.name ? `Sensor: ${selectedSensor.name}` : `Sensor ID: ${metricGraphIdMap[selectedMetric]}`}</span>
              </div>
            </div>

            {/* Config Selectors */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Day/Week/Month selectors */}
              <div className="flex border border-cyan-100 rounded-xl overflow-hidden bg-white">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGraphType(t)}
                    className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                      graphType === t ? 'bg-primary text-white' : 'text-primary hover:bg-cyan-50/50'
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
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
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
                <ChartIcon className="w-10 h-10 text-cyan-400 mb-3" />
                <h4 className="font-bold text-font-dark">No recorded sensor history yet</h4>
                <p className="text-xs text-font-light mt-2">Once your selected sensor reports data, the chart will populate here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0370c3" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0370c3" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf8fa"/>
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
                    domain={['dataMin', 'dataMax']}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #cffafe', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0370c3" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
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
