export const BASE_URL = import.meta.env.VITE_API_URL || ''; // Use Vite proxy in development if unset.

const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (res: Response) => {
  const text = await res.text();
  let payload: any = text;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw text if JSON parsing fails.
  }

  if (!res.ok) {
    const message =
      payload?.message ||
      payload?.detail ||
      payload?.error ||
      payload?.errors ||
      payload ||
      `Request failed with status ${res.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return payload;
};

export const normalizeGraphResponse = (payload: any) => {
  const parseValue = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) return value.length === 1 ? parseValue(value[0]) : null;
    if (typeof value === 'object') {
      return parseValue(
        value.value ?? value.val ?? value.v ?? value.sensor_val ??
        value.sensor_value ?? value.reading ?? value.value_raw
      );
    }
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseTime = (value: any, index: number) => {
    if (value && typeof value === 'object') {
      return value.data_time ?? value.timestamp ?? value.time ?? value.label ?? value.date ?? String(index + 1);
    }
    return value ?? String(index + 1);
  };

  const extractDataArray = (input: any): any[] => {
    if (Array.isArray(input)) {
      return input.flatMap((item: any) => {
        if (!item || typeof item !== 'object') return [item];
        const values = item.sensor_val ?? item.sensor_values ?? item.values;
        const times = item.time ?? item.times ?? item.timestamps ?? item.data_time;
        if (!Array.isArray(values) || !Array.isArray(times)) return [item];
        return values.map((value: any, index: number) => ({
          sensor_val: value,
          time: times[index] ?? String(index + 1),
          sensor_name: item.sensor_name,
        }));
      });
    }
    if (!input || typeof input !== 'object') return [];

    const sensorValues = input.sensor_val ?? input.sensor_values ?? input.values;
    const times = input.time ?? input.times ?? input.timestamps ?? input.data_time;
    if (Array.isArray(sensorValues) && Array.isArray(times)) {
      return sensorValues.map((value: any, index: number) => ({
        sensor_val: value,
        time: times[index] ?? String(index + 1),
      }));
    }

    if (Array.isArray(input.data)) return input.data;
    if (Array.isArray(input.data?.data)) return input.data.data;
    if (Array.isArray(input.data?.graph)) return input.data.graph;
    if (Array.isArray(input.data?.sensor_values)) return input.data.sensor_values;
    if (input.data && typeof input.data === 'object') return extractDataArray(input.data);
    if (input.graph && typeof input.graph === 'object') return extractDataArray(input.graph);
    if (Array.isArray(input.value)) return input.value;
    if (Array.isArray(input.values)) return input.values;
    if (Array.isArray(input.sensor_val)) return input.sensor_val;
    if (Array.isArray(input.sensorValues)) return input.sensorValues;
    if (Array.isArray(input.result)) return input.result;

    const arrayKeys = Object.keys(input).filter((k) => Array.isArray(input[k]));
    if (arrayKeys.length >= 2) {
      const keyA = arrayKeys[0];
      const keyB = arrayKeys[1];
      const a = input[keyA] || [];
      const b = input[keyB] || [];
      const len = Math.max(a.length, b.length);
      return Array.from({ length: len }, (_, i) => ({ [keyA]: a[i], [keyB]: b[i] }));
    }

    return [];
  };

  const data = extractDataArray(payload?.data ?? payload);
  const normalized: any[] = [];

  if (Array.isArray(data) && data.length > 0) {
    normalized.push(
      ...data
        .map((p: any, index: number) => ({
          data_time: parseTime(p.data_time ?? p.timestamp ?? p.time ?? p.label ?? p.date ?? p.datetime, index),
          value: parseValue(p.value ?? p.val ?? p.v ?? p.sensor_val ?? p.value_raw ?? p.sensorValue ?? p.reading),
          raw: p,
        }))
        .filter((point: any) => typeof point.value === 'number' && Number.isFinite(point.value))
    );
  }

  return normalized;
};

export const normalizeAeratorAutomation = (payload: any) => {
  const raw = payload?.data ?? payload ?? {};
  const data = Array.isArray(raw) ? raw[0] || {} : raw?.settings ?? raw?.automation ?? raw;
  return {
    is_enabled: data?.is_enabled === true || String(data?.is_enabled).toLowerCase() === 'true',
    do_min: Number.isFinite(Number(data?.do_min)) ? Number(data.do_min) : 4,
    do_max: Number.isFinite(Number(data?.do_max)) ? Number(data.do_max) : 8,
  };
};

const parseLoginResponse = (payload: any) => {
  // Normalize various possible login shapes into a stable object
  const token = payload?.data?.token || payload?.token || payload?.access || payload?.data?.access;
  const userId = payload?.data?.user_id || payload?.data?.id || payload?.user_id || payload?.id || '';
  const userData = payload?.data?.user_data || payload?.data || payload?.user_data || null;
  return { token, userId, userData };
};

const normalizeProfile = (payload: any) => {
  const d = payload?.data || payload || {};
  const usrEmail = d?.usr_email || d?.usrEmail || d?.email || d?.usrEmailAddress || null;
  // phone may be a string or an object { phn_cell: '...' }
  let phone: string | null = null;
  if (typeof d?.user_phone === 'string') phone = d.user_phone;
  else if (d?.user_phone?.phn_cell) phone = d.user_phone.phn_cell;
  else if (d?.user_phone) phone = String(d.user_phone);
  else if (d?.user_data?.user_phone?.phn_cell) phone = d.user_data.user_phone.phn_cell;

  const profile = {
    email: usrEmail || null,
    phone,
    address: d?.user_address || d?.address || null,
    first_name: d?.user_data?.first_name || d?.first_name || d?.usr_first_name || null,
    last_name: d?.user_data?.last_name || d?.last_name || d?.usr_last_name || null,
    raw: d,
  };

  return profile;
};

const mapSensorsToMetrics = (sensors: any[] = []) => {
  const metrics: Record<string, any> = {};
  sensors.forEach((s: any) => {
    const name = (s.sensor_name || s.name || '').toString().toLowerCase();
    const value = s.last_value ?? s.value ?? s.last ?? null;
    if (!name) return;

    if (name.includes('temp') || name.includes('temperature')) metrics.temperature = value;
    else if (name.includes('dissolved oxygen') || name.includes('do') || name.includes('dissolved_oxygen')) metrics.do_level = value;
    else if (name.includes('ph')) metrics.ph_level = value;
    else if (name.includes('ammonia') || name.includes('nh3') || name.includes('nitrite')) metrics.ammonia = value;
    else if (name.includes('salinity') || name.includes('tds')) metrics.salinity = value;
    else if (name.includes('co2')) metrics.co2 = value;
    else if (name.includes('pm') || name.includes('pm2')) metrics.pm2_5 = value;
    else {
      // fallback: use sensor id key
      metrics[`sensor_${s.id || s.sensor_id || s.sensorId}`] = value;
    }
  });
  return metrics;
};

import type { AquacultureFlow } from '../types/aquaculture';

type ApiFlow = AquacultureFlow | 'cattle' | 'poultry';

const getAquacultureToken = (flow: AquacultureFlow = 'fish', tokenOverride?: string) => {
  if (tokenOverride) return tokenOverride;
  if (flow === 'pharma') return localStorage.getItem(STORAGE_KEYS.PHARMA_TOKEN) || '';
  return localStorage.getItem(STORAGE_KEYS.MORE_FISH_TOKEN) || '';
};

const getTokenForFlow = (flow: ApiFlow, tokenOverride?: string) => {
  if (tokenOverride) return tokenOverride;
  if (flow === 'fish') return localStorage.getItem(STORAGE_KEYS.MORE_FISH_TOKEN) || '';
  if (flow === 'pharma') return localStorage.getItem(STORAGE_KEYS.PHARMA_TOKEN) || '';
  if (flow === 'cattle') return localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN) || '';
  return localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN) || '';
};

const getUserIdForFlow = (flow: ApiFlow) => {
  if (flow === 'fish') return localStorage.getItem(STORAGE_KEYS.MORE_FISH_USER_ID) || '';
  if (flow === 'pharma') return localStorage.getItem(STORAGE_KEYS.PHARMA_USER_ID) || '';
  if (flow === 'cattle') return localStorage.getItem(STORAGE_KEYS.CATTLE_USER_ID) || '';
  return localStorage.getItem(STORAGE_KEYS.POULTRY_USER_ID) || '';
};

export const STORAGE_KEYS = {
  MORE_FISH_TOKEN: 'more_fish_token',
  MORE_FISH_USER_ID: 'more_fish_user_id',
  PHARMA_TOKEN: 'pharma_token',
  PHARMA_USER_ID: 'pharma_user_id',
  CATTLE_TOKEN: 'cattle_token',
  CATTLE_USER_ID: 'cattle_user_id',
  POULTRY_TOKEN: 'poultry_token',
  POULTRY_USER_ID: 'poultry_user_id',
  FCM_TOKEN: 'fcm_token',
  LANG: 'app_lang',
};

export interface NormalizedNotification {
  id: number | string;
  title: string;
  message: string;
  timestamp: string | null;
  pond?: string;
  urgency?: string;
  color?: string;
  raw: any;
}

const extractNotificationList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
};

const normalizeAquacultureNotification = (item: any): NormalizedNotification => {
  const titleParts = [item.not_pond, item.not_warning_msg, item.not_warning, item.not_value].filter(Boolean);
  const title = titleParts.length > 0 ? titleParts.join(' ') : item.not_urgency || 'Sensor Alert';
  const message = item.not_final || item.not_message_body || '';
  const timestamp = item.not_time || item.not_date || null;

  return {
    id: item.id ?? `${timestamp ?? 'unknown'}-${item.dev_id ?? item.not_sensor_id ?? Math.random()}`,
    title,
    message,
    timestamp,
    pond: item.not_pond,
    urgency: item.not_urgency,
    color: item.not_color,
    raw: item,
  };
};

const normalizeLivestockNotification = (item: any): NormalizedNotification => {
  const title = [item.sensor_name, item.urgency].filter(Boolean).join(' · ') || 'Sensor Alert';
  return {
    id: item.id ?? `${item.notified_at ?? 'unknown'}-${item.sensor ?? Math.random()}`,
    title,
    message: item.message || '',
    timestamp: item.notified_at || null,
    urgency: item.urgency,
    raw: item,
  };
};

export const normalizeNotifications = (payload: any, flow: ApiFlow): NormalizedNotification[] => {
  const list = extractNotificationList(payload);
  const normalizeItem =
    flow === 'cattle' || flow === 'poultry'
      ? normalizeLivestockNotification
      : normalizeAquacultureNotification;

  return list.map(normalizeItem);
};

export const formatNotificationTimestamp = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const api = {
  // --- AUTH FLOWS ---
  async login(email: string, password: string, flow: ApiFlow) {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ usr_email: email, password }),
    });

    const payload = await parseResponse(res);
    const { token, userId, userData } = parseLoginResponse(payload);

    if (!token) throw new Error('Login response did not include an auth token.');

    if (flow === 'fish') {
      localStorage.setItem(STORAGE_KEYS.MORE_FISH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.MORE_FISH_USER_ID, String(userId));
    } else if (flow === 'pharma') {
      localStorage.setItem(STORAGE_KEYS.PHARMA_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.PHARMA_USER_ID, String(userId));
    } else if (flow === 'cattle') {
      localStorage.setItem(STORAGE_KEYS.CATTLE_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.CATTLE_USER_ID, String(userId));
    } else {
      localStorage.setItem(STORAGE_KEYS.POULTRY_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.POULTRY_USER_ID, String(userId));
    }

    // Return a normalized login result for the UI
    return { token, userId, userData, raw: payload };
  },

  async register(registrationData: any) {
    const res = await fetch(`${BASE_URL}/auth/registration/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(registrationData),
    });
    return parseResponse(res);
  },

  async getProfile(flow: ApiFlow) {
    const token = getTokenForFlow(flow);
    const id = getUserIdForFlow(flow);

    if (!id) {
      throw new Error('Missing user id for profile request.');
    }

    const res = await fetch(`${BASE_URL}/auth/user/details/${id}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const profile = normalizeProfile(payload);
    return profile;
  },

  async changePassword(oldPassword: string, newPassword: string, flow: ApiFlow) {
    const token = getTokenForFlow(flow);
    const res = await fetch(`${BASE_URL}/auth/user/password/change/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
    return parseResponse(res);
  },

  async forgotPassword(email: string, phone: string) {
    const res = await fetch(`${BASE_URL}/auth/user/forgot/password/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, phone }),
    });
    return parseResponse(res);
  },

  async verifyOtp(code: string) {
    const res = await fetch(`${BASE_URL}/auth/user/otp/verify/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    return parseResponse(res);
  },

  async resetPassword(userId: string, newPass: string) {
    const res = await fetch(`${BASE_URL}/auth/user/reset/password/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId, password: newPass }),
    });
    return parseResponse(res);
  },

  // --- AQUACULTURE (MORE FISH) ---
  async getPondList(flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/data/pond/list`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const rawPayload = payload?.data ?? payload ?? {};
    const rawList = Array.isArray(rawPayload)
      ? rawPayload
      : Array.isArray(rawPayload.ponds)
      ? rawPayload.ponds
      : Array.isArray(rawPayload.data)
      ? rawPayload.data
      : Array.isArray(rawPayload.assets)
      ? rawPayload.assets
      : [];

    const list = rawList.map((it: any) => ({
      id: it.id || it.asset_id || it.asset || String(it?.asset_id || it?.id || ''),
      asset_name: it.asset_name || it.name || it.asset || `Pond ${it.id || it.asset_id || ''}`,
      device: it.device || (Array.isArray(it.devices) ? it.devices[0] : undefined) || undefined,
      raw: it,
    }));

    return { data: list, raw: payload };
  },

  async getPondData(assetId: string, signal?: AbortSignal, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/data/pond/data?asset_id=${assetId}`, {
      method: 'GET',
      headers: getHeaders(token),
      signal,
    });
    const payload = await parseResponse(res);
    const devices = payload?.data?.devices || payload?.devices || [];
    const device = devices && devices.length > 0 ? devices[0] : payload?.data?.device || null;

    const normalizedDevice = device
      ? {
          id: device.device_id || device.id || device._id || null,
          device_status: String(device.device_status || '').toLowerCase(),
          is_online: String(device.device_status || '').toLowerCase() === 'online',
          aerators: (device.aerators || device.relays || device.switches || device.relay || device.relay_list || []).map((it: any) => {
            const id = it.aerator_id || it.relay_id || it.switch_id || it.id || it.relay || '';
            return {
              ...it,
              id: String(id),
              aerator_id: String(id),
              aerator_name: it.aerator_name || it.name || it.relay_name || `Aerator ${id}`,
              command: typeof it.command === 'number' ? it.command : (it.status === 1 || it.state === 1 || it.switch_status === 1 || String(it.status).toLowerCase() === 'on' || it.on === true ? 1 : 0),
              is_online: it.is_online === true || it.status_online === true || String(it.status).toLowerCase() === 'online' || it.online === true || String(it.device_status).toLowerCase() === 'online',
            };
          }),
          sensors: device.sensors || [],
          last_reading_time:
            device.last_reading_time ||
            device.last_synced ||
            device.last_seen ||
            device.lastUpdate ||
            null,
          raw: device,
        }
      : null;

    // If sensors not present in expected key, try common alternate keys in the raw payload
    if (normalizedDevice && (!Array.isArray(normalizedDevice.sensors) || normalizedDevice.sensors.length === 0)) {
      const raw = device || {};
      const altKeys = ['sensors', 'sensors_list', 'sensor_list', 'device_sensors', 'sensors_data', 'sensorsList', 'devices_sensors'];
      for (const k of altKeys) {
        if (Array.isArray(raw[k]) && raw[k].length > 0) {
          normalizedDevice.sensors = raw[k];
          break;
        }
      }
    }

    // Derive top-level metrics from sensors for UI convenience
    if (normalizedDevice && Array.isArray(normalizedDevice.sensors) && normalizedDevice.sensors.length > 0) {
      const derived = mapSensorsToMetrics(normalizedDevice.sensors);
      Object.assign(normalizedDevice, derived);
    }

    return { data: { device: normalizedDevice, devices, asset: payload?.data || null }, raw: payload };
  },

  async getSensorList(deviceId: string, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/sensor/list?device_id=${deviceId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const rawPayload = payload?.data ?? payload ?? {};
    const rawSensors = Array.isArray(rawPayload)
      ? rawPayload
      : Array.isArray(rawPayload.sensors)
      ? rawPayload.sensors
      : Array.isArray(rawPayload.sensor_list)
      ? rawPayload.sensor_list
      : Array.isArray(rawPayload.sensors_list)
      ? rawPayload.sensors_list
      : [];
    const sensors = Array.isArray(rawSensors)
      ? rawSensors.map((s: any) => ({
          id: s.id || s.sensor_id || s.sensorId || s.sensor_uuid || s.uuid || null,
          name: s.sensor_name || s.name || s.type || `Sensor ${s.id || s.sensor_id || ''}`,
          last_value: s.last_value ?? s.value ?? s.last ?? null,
          unit: s.sensor_unit || s.unit || null,
          danger_status: String(s.danger_status || '').toLowerCase(),
          raw: s,
        }))
      : [];
    return { data: sensors, raw: payload };
  },

  async getGraphData(
    assetId: string,
    sensorId: string | number,
    type: 'daily' | 'weekly' | 'monthly',
    signal?: AbortSignal,
    flow: AquacultureFlow = 'fish',
    tokenOverride?: string
  ) {
    const token = getAquacultureToken(flow, tokenOverride);
    const params = new URLSearchParams({
      assst_id: String(assetId),
      sensor_id: String(sensorId),
      type,
    });

    const url = `${BASE_URL}/devices/data/graph?${params.toString()}`;
    const timeoutController = new AbortController();
    const timeoutId = window.setTimeout(() => timeoutController.abort('Graph request timed out'), 60000);
    const abortFromCaller = () => timeoutController.abort(signal?.reason);
    signal?.addEventListener('abort', abortFromCaller, { once: true });

    console.debug('[MoreFish graph] Request', { url, assetId, sensorId, type });
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(token),
        signal: timeoutController.signal,
      });
      const payload = await parseResponse(res);
      const normalized = normalizeGraphResponse(payload);
      console.debug('[MoreFish graph] Response', { status: res.status, points: normalized.length, payload });
      return { data: normalized, raw: payload };
    } catch (error) {
      console.error('[MoreFish graph] Request failed', { url, assetId, sensorId, type, error });
      if (timeoutController.signal.aborted && !signal?.aborted) {
        throw new Error('Graph request timed out after 60 seconds.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener('abort', abortFromCaller);
    }
  },

  async controlAerator(aeratorId: string, command: 1 | 0, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/aerators/command/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ aerator_id: aeratorId, command }),
    });
    return parseResponse(res);
  },

  async getAeratorAutomation(deviceId: string, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/aerator-automation/?device_id=${deviceId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async saveAeratorAutomation(deviceId: string, isEnabled: boolean, doMin: number, doMax: number, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/aerator-automation/?device_id=${encodeURIComponent(deviceId)}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        device_id: deviceId,
        is_enabled: isEnabled,
        do_min: doMin,
        do_max: doMax,
      }),
    });
    return parseResponse(res);
  },

  async getCleanerStatus(assetId: string, flow: AquacultureFlow = 'fish') {
    const token = getAquacultureToken(flow);
    const res = await fetch(`${BASE_URL}/devices/cleaner/status/?asset_id=${assetId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async calculateFcr(
    assetId: number | string,
    feedWeightKg: number,
    weightGainedKg: number,
    notes?: string,
    flow: AquacultureFlow = 'fish',
    tokenOverride?: string
  ) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/fcr/calculate/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        asset_id: Number(assetId),
        feed_weight_kg: feedWeightKg,
        weight_gained_kg: weightGainedKg,
        notes: notes || 'FCR Record',
      }),
    });
    return parseResponse(res);
  },

  async getFcrHistory(assetId: number | string, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const res = await fetch(`${BASE_URL}/devices/fcr/history/?asset_id=${Number(assetId)}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async detectFishDisease(imageFile: File, flow: AquacultureFlow = 'fish', tokenOverride?: string) {
    const token = getAquacultureToken(flow, tokenOverride);
    const formData = new FormData();
    formData.append('file', imageFile);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/devices/fish-disease/detect/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return parseResponse(res);
  },

  // --- CATTLE CARE ---
  async getCattleFarms(tokenOverride?: string) {
    const token = tokenOverride || localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const res = await fetch(`${BASE_URL}/cattle_care/farms/list/`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async getCattleDashboard(farmId: string, tokenOverride?: string) {
    const token = tokenOverride || localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const res = await fetch(`${BASE_URL}/cattle_care/farms/dashboard/?farm_id=${farmId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async controlCattleSwitch(switchId: string, turnOn: boolean) {
    const token = localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const res = await fetch(`${BASE_URL}/cattle_care/switches/command/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ switch_id: switchId, command: turnOn ? 1 : 0 }),
    });
    return parseResponse(res);
  },

  async getCattleAutomation(farmId: number) {
    const token = localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const res = await fetch(`${BASE_URL}/cattle_care/automation/?farm_id=${farmId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async saveCattleAutomation(farmId: number, isEnabled: boolean, fanTempMin?: number, fanTempMax?: number, foggerHumidityMin?: number) {
    const token = localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const body: Record<string, unknown> = {
      farm_id: farmId,
      is_enabled: isEnabled,
    };

    if (fanTempMin !== undefined) body.fan_temp_min = fanTempMin;
    if (fanTempMax !== undefined) body.fan_temp_max = fanTempMax;
    if (foggerHumidityMin !== undefined) body.fogger_humidity_min = foggerHumidityMin;

    const res = await fetch(`${BASE_URL}/cattle_care/automation/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  async addCattleLightSchedule(farmId: number, startTime: string, endTime: string) {
    const token = localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const res = await fetch(`${BASE_URL}/cattle_care/automation/light-schedule/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ farm_id: farmId, start_time: startTime, end_time: endTime }),
    });
    return parseResponse(res);
  },

  async deleteCattleLightSchedule(scheduleId: number) {
    const token = localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN);
    const res = await fetch(`${BASE_URL}/cattle_care/automation/light-schedule/${scheduleId}/`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  // --- POULTRY CARE ---
  async getPoultryFarms(tokenOverride?: string) {
    const token = tokenOverride || localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN);
    const res = await fetch(`${BASE_URL}/poultry_care/farms/list/`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async getPoultryDashboard(farmId: string, tokenOverride?: string) {
    const token = tokenOverride || localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN);
    const res = await fetch(`${BASE_URL}/poultry_care/farms/dashboard/?farm_id=${farmId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async controlPoultrySwitch(switchId: string, turnOn: boolean) {
    const token = localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN);
    const res = await fetch(`${BASE_URL}/poultry_care/switches/command/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ switch_id: switchId, command: turnOn ? 1 : 0 }),
    });
    return parseResponse(res);
  },

  async getPoultryAutomation(farmId: number) {
    const token = localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN);
    const res = await fetch(`${BASE_URL}/poultry_care/automation/?farm_id=${farmId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return parseResponse(res);
  },

  async savePoultryAutomation(farmId: number, isEnabled: boolean, fanTempMin?: number, fanTempMax?: number, foggerHumidityMin?: number) {
    const token = localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN);
    const body: Record<string, unknown> = {
      farm_id: farmId,
      is_enabled: isEnabled,
    };

    if (fanTempMin !== undefined) body.fan_temp_min = fanTempMin;
    if (fanTempMax !== undefined) body.fan_temp_max = fanTempMax;
    if (foggerHumidityMin !== undefined) body.fogger_humidity_min = foggerHumidityMin;

    const res = await fetch(`${BASE_URL}/poultry_care/automation/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  // --- FCM TOKEN UPDATE ---
  async updateFcmToken(fcmToken: string, flow?: ApiFlow) {
    const token = flow
      ? getTokenForFlow(flow)
      : localStorage.getItem(STORAGE_KEYS.MORE_FISH_TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.PHARMA_TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN) ||
        '';
    const res = await fetch(`${BASE_URL}/auth/user/fcm/token/update/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ fcm_token: fcmToken }),
    });
    return parseResponse(res);
  },

  // --- PRODUCT CATALOG (STORE) ---
  async getProductCategories(flow: AquacultureFlow = 'fish') {
    const token = getAquacultureToken(flow);
    const res = await fetch(`${BASE_URL}/product/category/list/`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const raw = payload?.data ?? payload ?? {};
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.categories)
      ? raw.categories
      : Array.isArray(raw.result)
      ? raw.result
      : [];
    const categories = items.map((item: any) => ({
      guid: item.guid || item.category_guid || item.id || item.category_id || String(item.id ?? item.category_id ?? item.guid ?? ''),
      categoryName: item.categoryName || item.name || item.title || item.category_name || item.category || 'Untitled Category',
      raw: item,
    }));
    return { data: categories, raw: payload };
  },

  async getCompaniesByCategory(categoryGuid: string, flow: AquacultureFlow = 'fish') {
    const token = getAquacultureToken(flow);
    const params = new URLSearchParams({
      category_guid: String(categoryGuid),
      category_id: String(categoryGuid),
    });
    const res = await fetch(`${BASE_URL}/product/product-companies?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const raw = payload?.data ?? payload ?? {};
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.companies)
      ? raw.companies
      : Array.isArray(raw.results)
      ? raw.results
      : Array.isArray(raw.product_companies)
      ? raw.product_companies
      : [];
    const companies = items.map((item: any) => ({
      guid: item.guid || item.company_guid || item.id || item.company_id || String(item.id ?? item.company_id ?? item.guid ?? ''),
      company_name: item.company_name || item.name || item.title || item.brand_name || 'Supplier',
      logo: item.logo ? `http://66.29.151.40:8004/${item.logo}` : '',
      raw: item,
    }));
    return { data: companies, raw: payload };
  },

  async getProductsByCompany(companyGuid: string, page = 1, size = 10, flow: AquacultureFlow = 'fish') {
    const token = getAquacultureToken(flow);
    const params = new URLSearchParams({
      product_company_guid: String(companyGuid),
      company_guid: String(companyGuid),
      product_company_id: String(companyGuid),
      company_id: String(companyGuid),
      page_number: String(page),
      size: String(size),
    });
    const res = await fetch(`${BASE_URL}/product/search-product-by-company?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const raw = payload?.data ?? payload ?? {};
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.data?.data)
      ? payload.data.data
      : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.products)
      ? raw.products
      : Array.isArray(raw.result)
      ? raw.result
      : Array.isArray(raw.product_list)
      ? raw.product_list
      : [];
    const products = items.map((item: any) => {
      let imagePath = '';
      if (item.productimage_set && item.productimage_set.length > 0) {
        imagePath = `http://66.29.151.40:8004/${item.productimage_set[0].image}`;
      } else {
        const rawImg = item.image || item.thumbnail || item.product_image || item.photo || '';
        imagePath = rawImg ? (rawImg.startsWith('http') ? rawImg : `http://66.29.151.40:8004/${rawImg}`) : '';
      }
      return {
        guid: item.guid || item.product_guid || item.id || item.product_id || String(item.id ?? item.product_id ?? item.guid ?? ''),
        name: item.name || item.product_name || item.title || 'Untitled Product',
        company_name: item.company_name || item.brand_name || item.company || '',
        price: item.price || item.product_price || item.sale_price || item.cost || 'Contact Supplier',
        image: imagePath,
        description: item.description || item.details || item.summary || item.product_description || '',
        raw: item,
      };
    });
    return { data: products, raw: payload };
  },

  async getProductDetails(productGuid: string, flow: AquacultureFlow = 'fish') {
    const token = getAquacultureToken(flow);
    const params = new URLSearchParams({
      product_guid: String(productGuid),
      product_id: String(productGuid),
      guid: String(productGuid),
    });
    const res = await fetch(`${BASE_URL}/product/details?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    const raw = payload?.data ?? payload ?? {};
    const item = raw.product || raw.data || raw || {};
    let imagePath = '';
    if (item.productimage_set && item.productimage_set.length > 0) {
      imagePath = `http://66.29.151.40:8004/${item.productimage_set[0].image}`;
    } else {
      const rawImg = item.image || item.thumbnail || item.product_image || item.photo || '';
      imagePath = rawImg ? (rawImg.startsWith('http') ? rawImg : `http://66.29.151.40:8004/${rawImg}`) : '';
    }
    return {
      data: {
        guid: item.guid || item.product_guid || item.id || item.product_id || String(item.id ?? item.product_id ?? item.guid ?? ''),
        name: item.name || item.product_name || item.title || 'Untitled Product',
        company_name: item.company_name || item.brand_name || item.company || '',
        price: item.price || item.product_price || item.sale_price || item.cost || 'Contact Supplier',
        image: imagePath,
        description: item.description || item.details || item.summary || item.product_description || '',
        raw: item,
      },
      raw: payload,
    };
  },

  // --- UTILITIES / NOTIFICATIONS ---
  async getNotifications(userId: string, flow: ApiFlow) {
    const token = getTokenForFlow(flow);
    const res = await fetch(`${BASE_URL}/notification/all/list/${userId}/`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const payload = await parseResponse(res);
    return { data: normalizeNotifications(payload, flow), raw: payload };
  },

  async getWeather(city = 'Dhaka') {
    const apiKey = '1fe3d8310812392fbac14b02b9b3dcf1';
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},BD&appid=${apiKey}&units=metric`, {
      method: 'GET',
    });
    return parseResponse(res);
  },

  async getWeatherForecast(city = 'Dhaka') {
    const apiKey = '1fe3d8310812392fbac14b02b9b3dcf1';
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},BD&appid=${apiKey}&units=metric`, {
      method: 'GET',
    });
    return parseResponse(res);
  },
};
