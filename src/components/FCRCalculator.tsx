// H:\DMA Hamim\DMA-Web-App\src\components\FCRCalculator.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import { Calculator, AlertCircle, Info, RefreshCw, Fish } from 'lucide-react';

type FeedStage = 'fry' | 'medium' | 'market';

const FEED_STAGE_RATES: Record<FeedStage, number> = {
  fry: 8,
  medium: 4,
  market: 2.5,
};

import type { AquacultureFlow } from '../types/aquaculture';

interface FCRCalculatorProps {
  flow?: AquacultureFlow;
}

export const FCRCalculator: React.FC<FCRCalculatorProps> = ({ flow = 'fish' }) => {
  const { tokens } = useAuth();
  const { t } = useLang();

  const [ponds, setPonds] = useState<any[]>([]);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const [pondsLoading, setPondsLoading] = useState(false);

  const [feedAmount, setFeedAmount] = useState('');
  const [weightGain, setWeightGain] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  const [bodyWeight, setBodyWeight] = useState('');
  const [feedStage, setFeedStage] = useState<FeedStage>('fry');
  const [feedRequirement, setFeedRequirement] = useState<number | null>(null);
  const [feedReqError, setFeedReqError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens[flow]) return;
    setPondsLoading(true);
    api.getPondList(flow)
      .then((response) => {
        const list = response.data || [];
        setPonds(list);
        setSelectedPond((current: any) => current || list[0] || null);
      })
      .catch((err) => {
        console.error('[FCRCalculator] Pond list failed.', err);
        setError(t('no_assets_found'));
      })
      .finally(() => setPondsLoading(false));
  }, [tokens[flow], flow, t]);

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
      setError(t('values_greater_than_zero'));
      return;
    }

    if (!selectedPond?.id) {
      setError(t('asset_not_available'));
      return;
    }

    if (!tokens[flow]) {
      setError(t('missing_auth_token'));
      return;
    }

    setCalculating(true);
    try {
      const response = await api.calculateFcr(selectedPond.id, feed, weight, '', flow);
      const payload = response?.data ?? response ?? {};
      const fcrValue = payload?.fcr ?? payload?.data?.fcr ?? null;

      if (fcrValue === null || fcrValue === undefined || Number.isNaN(Number(fcrValue))) {
        setError(t('fcr_value_missing'));
        return;
      }

      setResult(parseFloat(Number(fcrValue).toFixed(2)));
    } catch (err: any) {
      console.error('[FCRCalculator] Calculate failed.', err);
      setError(err?.message || t('fcr_calc_failed'));
    } finally {
      setCalculating(false);
    }
  };

  const handleClear = () => {
    setFeedAmount('');
    setWeightGain('');
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

  if (!tokens[flow]) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-linear-to-tr from-bg-light to-cyan-50">
        <Calculator className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 rounded-3xl border border-cyan-100/40 bg-white/80 p-5 shadow-sm">
        <label className="shrink-0 text-sm font-bold text-font-dark">{t('select_device')}:</label>
        <select
          value={selectedPond?.id || ''}
          onChange={(event) =>
            setSelectedPond(ponds.find((pond) => String(pond.id) === event.target.value) || null)
          }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 p-8 rounded-3xl border border-cyan-100/40 shadow-sm animate-in fade-in zoom-in-95 duration-200">
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
              placeholder="e.g. 1500"
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
              placeholder="e.g. 1000"
              value={weightGain}
              onChange={(e) => handleNumericInput(e.target.value, setWeightGain)}
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
                <h2 className="text-5xl font-black text-primary mt-2">{result.toFixed(2)}</h2>
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

      <div className="bg-white/80 p-8 rounded-3xl border border-cyan-100/40 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
          <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Fish className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-font-dark">{t('feed_requirement_calculator')}</h4>
            <p className="text-[10px] font-bold text-font-light uppercase">{t('daily_feed_estimate')}</p>
          </div>
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
  );
};
