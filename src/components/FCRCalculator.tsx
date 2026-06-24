// H:\DMA Hamim\DMA-Web-App\src\components\FCRCalculator.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import {
  Calculator,
  AlertCircle,
  Info,
  RefreshCw,
  Fish,
  TrendingUp,
  History
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import type { AquacultureFlow } from '../types/aquaculture';

interface FCRCalculatorProps {
  flow?: AquacultureFlow;
  token?: string;
  userId?: string;
}

interface FcrRecord {
  id: number;
  asset_id: number;
  feed_weight_kg: string;
  weight_gained_kg: string;
  fcr: number;
  calculated_at: string;
  notes: string;
}

type FeedStage = 'fry' | 'medium' | 'market';

const FEED_STAGE_RATES: Record<FeedStage, number> = {
  fry: 8,
  medium: 4,
  market: 2.5,
};

export const FCRCalculator: React.FC<FCRCalculatorProps> = ({ flow = 'fish', token }) => {
  const { tokens, logout } = useAuth();
  const { t } = useLang();

  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const [pondsLoading, setPondsLoading] = useState(false);

  const [feedAmount, setFeedAmount] = useState('');
  const [weightGain, setWeightGain] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  // History State
  const [history, setHistory] = useState<FcrRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Feed Requirement States
  const [bodyWeight, setBodyWeight] = useState('');
  const [feedStage, setFeedStage] = useState<FeedStage>('fry');
  const [feedRequirement, setFeedRequirement] = useState<number | null>(null);
  const [feedReqError, setFeedReqError] = useState<string | null>(null);

  const fetchHistory = async (assetId: number | string) => {
    const activeToken = token || tokens[flow];
    if (!activeToken) return;
    setHistoryLoading(true);
    try {
      const response = await api.getFcrHistory(assetId, flow, token);
      const data = response?.data || [];
      setHistory(data);
    } catch (err: any) {
      console.error('[FCRCalculator] Fetch history failed.', err);
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthor') || msg.toLowerCase().includes('not logged')) {
        logout(flow);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const activeToken = token || tokens[flow];
    if (!activeToken) return;
    setPondsLoading(true);
    api.getPondList(flow, token)
      .then((response) => {
        const list = response.data || [];
        setPonds(list);
        const initialPond = list[0] || null;
        setSelectedPond(initialPond);
        if (initialPond?.id) {
          fetchHistory(initialPond.id);
        }
      })
      .catch((err) => {
        console.error('[FCRCalculator] Pond list failed.', err);
        setError(t('no_assets_found'));
      })
      .finally(() => setPondsLoading(false));
  }, [token, tokens[flow], flow, t]);

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!feedAmount.trim() || !weightGain.trim()) {
      setError(t('enter_numeric_values'));
      return;
    }

    const feed = parseFloat(feedAmount);
    const weight = parseFloat(weightGain);

    if (isNaN(feed) || isNaN(weight)) {
      setError(t('enter_numeric_values'));
      return;
    }

    if (feed <= 0 || weight <= 0) {
      setError("Values must be greater than zero");
      return;
    }

    if (!selectedPond?.id) {
      setError(t('asset_not_available'));
      return;
    }

    const activeToken = token || tokens[flow];
    if (!activeToken) {
      setError(t('missing_auth_token'));
      return;
    }

    setCalculating(true);
    try {
      const response = await api.calculateFcr(
        selectedPond.id,
        feed,
        weight,
        notes.trim() || 'FCR Calculation',
        flow,
        token
      );

      const payload = response?.data ?? response ?? {};
      const fcrValue = payload?.fcr ?? payload?.data?.fcr ?? null;

      if (fcrValue === null || fcrValue === undefined || Number.isNaN(Number(fcrValue))) {
        setError(t('fcr_value_missing'));
        return;
      }

      setResult(Number(fcrValue));
      setNotes('');
      // Refresh history list and trend visualization
      fetchHistory(selectedPond.id);
    } catch (err: any) {
      console.error('[FCRCalculator] Calculate failed.', err);
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthor') || msg.toLowerCase().includes('not logged')) {
        logout(flow);
      } else {
        // Handle 400 Bad Request by checking the errors object in the response
        try {
          const parsed = JSON.parse(msg);
          if (parsed && typeof parsed === 'object') {
            const errStr = Object.values(parsed).flat().join(', ');
            setError(errStr || 'FCR calculation failed');
          } else {
            setError(msg);
          }
        } catch {
          setError(msg);
        }
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleClear = () => {
    setFeedAmount('');
    setWeightGain('');
    setNotes('');
    setResult(null);
    setError(null);
  };

  const handleFeedRequirementCalculate = () => {
    setFeedReqError(null);
    setFeedRequirement(null);

    if (!bodyWeight.trim()) {
      setFeedReqError(t('enter_numeric_values'));
      return;
    }

    const weight = parseFloat(bodyWeight);
    if (isNaN(weight) || weight <= 0) {
      setFeedReqError(t('values_greater_than_zero'));
      return;
    }

    const rate = FEED_STAGE_RATES[feedStage];
    const requirement = (rate * weight) / 100;
    setFeedRequirement(parseFloat(requirement.toFixed(2)));
  };

  const handleFeedRequirementClear = () => {
    setBodyWeight('');
    setFeedRequirement(null);
    setFeedReqError(null);
    setFeedStage('fry');
  };

  const getFCREvaluation = (val: number) => {
    if (val < 1.2) {
      return {
        rating: 'Excellent (দারুণ)',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        desc: 'Highly efficient feeding program. The fish are converting feed into body mass exceptionally well.',
      };
    }
    if (val <= 1.8) {
      return {
        rating: 'Good / Normal (ভালো)',
        color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
        desc: 'Standard feed efficiency. Within the optimal range for most commercial aquaculture species.',
      };
    }
    return {
      rating: 'High / Wasteful (অতিরিক্ত)',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      desc: 'High feed wastage or poor conversion. Please check dissolved oxygen (DO) levels, water temperature, or feed quality.',
    };
  };

  const evaluation = result !== null ? getFCREvaluation(result) : null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatShortDate = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Sort history: Newest first (reverse array because backend returns oldest first)
  const sortedHistory = [...history].reverse();

  // Chart data: Needs to be oldest first (chronological order) so we map the original history array
  const chartData = history.map((record) => ({
    calculated_at: formatShortDate(record.calculated_at),
    fcr: Number(record.fcr),
    rawDate: formatDate(record.calculated_at)
  }));

  if (!(token || tokens[flow])) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-linear-to-tr from-bg-light to-cyan-50">
        <Calculator className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* Top Pond Selection */}
      <div className="flex items-center gap-3 rounded-3xl border border-sky-100/60 bg-gradient-to-r from-sky-50 to-blue-50/50 p-6 shadow-md">
        <label className="shrink-0 text-sm font-bold text-font-dark">{t('select_device')}:</label>
        <select
          value={selectedPond?.id || ''}
          onChange={(event) => {
            const pondId = event.target.value;
            const pond = ponds.find((p) => String(p.id) === pondId) || null;
            setSelectedPond(pond);
            if (pond?.id) {
              fetchHistory(pond.id);
            }
          }}
          disabled={pondsLoading || ponds.length === 0}
          className="cursor-pointer rounded-xl border border-cyan-100 bg-white px-4 py-2 text-sm font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
        >
          {ponds.length === 0 ? (
            <option value="">{t('no_assets_found')}</option>
          ) : (
            ponds.map((pond) => (
              <option key={pond.id} value={pond.id}>
                {pond.asset_name || `Pond ${pond.id}`}
              </option>
            ))
          )}
        </select>
        {pondsLoading && <RefreshCw className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Calculators (8 cols on lg, or stacked) */}
        <div className="lg:col-span-7 space-y-6">
          {/* FCR Calculation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-blue-50 to-indigo-100/30 p-8 rounded-3xl border border-blue-100 shadow-md">
            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
                <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-font-dark">{t('fcr_calculator')}</h4>
                  <p className="text-[10px] font-bold text-font-light uppercase">{t('feed_conversion_ratio')}</p>
                </div>
              </div>

              <div className="bg-white/80 border border-blue-100 p-4 rounded-2xl text-xs space-y-1.5 shadow-xs">
                <h5 className="font-bold text-font-dark">FCR (Feed Conversion Ratio):</h5>
                <p className="text-font-light leading-relaxed">FCR refers to the amount of feed required to increase 1 kg of fish body weight.</p>
                <p className="font-bold text-emerald-600">Lower FCR = Better feed efficiency, better feed performance, and higher profitability.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">
                  {t('total_feed_amount')}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 150.5"
                  value={feedAmount}
                  onChange={(e) => handleNumericInput(e.target.value, setFeedAmount)}
                  className="w-full px-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">
                  {t('total_weight_gain')}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 75.2"
                  value={weightGain}
                  onChange={(e) => handleNumericInput(e.target.value, setWeightGain)}
                  className="w-full px-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">
                  Notes (নোট)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly feed check"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={calculating}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-font-dark font-bold text-sm rounded-2xl border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {t('clear')}
                </button>
                <button
                  type="submit"
                  disabled={calculating || !selectedPond?.id}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-2xl shadow-md shadow-cyan-100 transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {calculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('calculating')}</span>
                    </>
                  ) : (
                    t('calculate')
                  )}
                </button>
              </div>
            </form>

            <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-cyan-100/50 pt-6 md:pt-0 md:pl-8 min-h-[200px]">
              {result === null ? (
                <div className="text-center space-y-3 py-6">
                  <Calculator className="w-12 h-12 text-cyan-200 mx-auto" />
                  <h5 className="font-bold text-font-dark">Awaiting Calculation</h5>
                  <p className="text-xs text-font-light max-w-xs mx-auto leading-relaxed">
                    Feed Conversion Ratio is a critical index in aquaculture. It indicates how many kilograms of food is required to produce 1 kg of fish mass.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="text-center pb-4 border-b border-cyan-50">
                    <span className="text-xs font-bold text-font-light uppercase tracking-wide">{t('result')}</span>
                    {/* Display FCR formatted to 3 decimal places */}
                    <h2 className="text-5xl font-black text-primary mt-2">{result.toFixed(3)}</h2>
                  </div>

                  {evaluation && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-2xl border text-center font-bold text-sm ${evaluation.color}`}>
                        Evaluation: {evaluation.rating}
                      </div>
                      <div className="flex gap-2 p-4 bg-white border border-cyan-100/50 rounded-2xl text-xs leading-relaxed font-semibold text-font-light shadow-sm">
                        <Info className="w-5 h-5 text-primary shrink-0" />
                        <span>{evaluation.desc}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feed Requirement Calculator */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100/30 p-8 rounded-3xl border border-emerald-100 shadow-md space-y-6">
            <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
              <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-font-dark">{t('feed_requirement_calculator')}</h4>
                <p className="text-[10px] font-bold text-font-light uppercase">{t('daily_feed_estimate')}</p>
              </div>
            </div>

            <div className="bg-white/80 border border-emerald-100 p-4 rounded-2xl text-xs space-y-1 shadow-xs">
              <h5 className="font-bold text-font-dark">Feed Requirements Calculation:</h5>
              <p className="text-font-light leading-relaxed">The process of calculating the amount of feed required per day based on the total fish biomass and the feeding rate.</p>
            </div>

            {feedReqError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedReqError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">
                {t('total_body_weight')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 500"
                value={bodyWeight}
                onChange={(e) => handleNumericInput(e.target.value, setBodyWeight)}
                className="w-full max-w-sm px-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { id: 'fry' as FeedStage, label: t('fry_fingerlings'), rate: 8 },
                { id: 'medium' as FeedStage, label: t('medium_size'), rate: 4 },
                { id: 'market' as FeedStage, label: t('market_size'), rate: 2.5 },
              ]).map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setFeedStage(stage.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    feedStage === stage.id
                      ? 'border-primary bg-cyan-50 text-primary'
                      : 'border-cyan-100 bg-white hover:bg-cyan-50/30 text-font-dark'
                  }`}
                >
                  <span className="text-xs font-bold block">{stage.label}</span>
                  <span className="text-[10px] font-semibold text-font-light">{stage.rate}% {t('of_body_weight')}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleFeedRequirementClear}
                className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-font-dark font-bold text-sm rounded-2xl border border-gray-200 transition-colors cursor-pointer"
              >
                {t('clear')}
              </button>
              <button
                type="button"
                onClick={handleFeedRequirementCalculate}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
              >
                {t('calculate')}
              </button>
            </div>

            {feedRequirement !== null && (
              <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-bold text-sm">
                {t('result')}: {feedRequirement} kg
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chart & History (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trend Visualization Chart */}
          <div className="bg-gradient-to-br from-cyan-50 to-sky-100/30 p-6 rounded-3xl border border-cyan-100 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-3">
              <div className="p-1.5 bg-cyan-50 text-primary rounded-lg border border-cyan-100">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-sm text-font-dark">FCR Trend (FCR ট্রেন্ড)</h5>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center h-48">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-xs font-semibold text-font-light">
                No FCR calculations recorded yet.
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFcr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0370c3" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0370c3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="calculated_at"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        fontWeight: '600'
                      }}
                      labelFormatter={(label, items) => {
                        const payloadItem = items[0]?.payload;
                        return payloadItem ? payloadItem.rawDate : label;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="fcr"
                      stroke="#0370c3"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFcr)"
                      activeDot={{ r: 5, stroke: '#0370c3', strokeWidth: 1 }}
                      dot={{ r: 3, stroke: '#0370c3', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* History List */}
          <div className="bg-gradient-to-br from-slate-50 to-zinc-100/50 p-6 rounded-3xl border border-zinc-200 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-3">
              <div className="p-1.5 bg-cyan-50 text-primary rounded-lg border border-cyan-100">
                <History className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-sm text-font-dark">History (ইতিহাস)</h5>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : sortedHistory.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-font-light">
                No history records.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {sortedHistory.map((record) => (
                  <div
                    key={record.id}
                    className="flex justify-between items-center bg-white/50 border border-cyan-100/40 p-4 rounded-2xl hover:shadow-sm transition-all"
                  >
                    {/* Left side: Date & Details */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-font-light block">
                        {formatDate(record.calculated_at)}
                      </span>
                      <div className="text-xs font-semibold text-font-dark space-y-0.5">
                        <p>Feed (খাদ্য): <span className="font-bold text-primary">{parseFloat(record.feed_weight_kg)} kg</span></p>
                        <p>Gain (বৃদ্ধি): <span className="font-bold text-primary">{parseFloat(record.weight_gained_kg)} kg</span></p>
                      </div>
                      {record.notes && (
                        <span className="text-[9px] font-bold bg-cyan-50 text-primary px-2 py-0.5 rounded border border-cyan-100/40 inline-block mt-1">
                          Note: {record.notes}
                        </span>
                      )}
                    </div>

                    {/* Right side: Bold Blue FCR Badge */}
                    <div className="bg-primary/5 text-primary border border-primary/10 rounded-2xl px-4 py-2.5 text-center min-w-[70px]">
                      <span className="text-[9px] font-bold text-font-light block uppercase tracking-wide">FCR</span>
                      <span className="text-sm font-black">{Number(record.fcr).toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
