"use client";

import { useState, useEffect } from "react";
import { Calculator, TrendingUp, DollarSign, Calendar, Target, Activity, ArrowRight, PieChart, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Reusable Preset Input Component
function PresetInput({
  label,
  value,
  onChange,
  options,
  formatDisplay,
  accentColor = "#00D1D1"
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  options: { label: string; value: number }[];
  formatDisplay?: (val: number) => string;
  accentColor?: string;
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  // If value doesn't match any option, force custom mode
  useEffect(() => {
    if (!options.find((opt) => opt.value === value)) {
      setIsCustomMode(true);
    }
  }, [value, options]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        {formatDisplay && (
          <span style={{ color: accentColor }} className="font-bold font-mono text-sm">
            {formatDisplay(value)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <select
          value={isCustomMode && !options.find((opt) => opt.value === value) ? "custom" : value}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setIsCustomMode(true);
            } else {
              setIsCustomMode(false);
              onChange(Number(e.target.value));
            }
          }}
          className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          <option value="custom">Custom...</option>
        </select>

        {isCustomMode && (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]"
            placeholder="Enter custom value"
          />
        )}
      </div>
    </div>
  );
}

export default function ROICalculatorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'investor' && user.role !== 'admin') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, isLoading, router]);

  // Inputs State
  const [investmentAmount, setInvestmentAmount] = useState<number>(500000);
  const [durationYears, setDurationYears] = useState<number>(5);
  const [initialRevenue, setInitialRevenue] = useState<number>(1000000);
  const [growthRate, setGrowthRate] = useState<number>(35); // 35% Annual
  const [exitMultiple, setExitMultiple] = useState<number>(8); // 8x Revenue

  // --- Calculations ---
  // Determine implied entry valuation based on current revenue and exit multiple
  const entryValuation = initialRevenue * exitMultiple;
  // Determine equity purchased (simplified)
  const equityPercentage = entryValuation > 0 ? Math.min((investmentAmount / entryValuation) * 100, 100) : 0;
  
  // Future Revenue Calculation: P * (1 + r)^t
  const futureRevenue = initialRevenue * Math.pow(1 + (growthRate / 100), durationYears);
  
  // Exit Valuation
  const exitValuation = futureRevenue * exitMultiple;
  
  // Investor's Share of Exit
  const exitValue = (equityPercentage / 100) * exitValuation;
  const netProfit = exitValue - investmentAmount;
  const roiPercentage = investmentAmount > 0 ? (netProfit / investmentAmount) * 100 : 0;
  
  // Annualized Return (IRR approx)
  const annualizedROI = investmentAmount > 0 && exitValue > 0 ? (Math.pow(exitValue / investmentAmount, 1 / durationYears) - 1) * 100 : 0;

  // Format helpers
  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  // Generate chart path (SVG)
  const generateChartPath = () => {
    if (durationYears === 0) return "";
    const points = [];
    const maxVal = exitValue;
    const minVal = investmentAmount;
    const range = maxVal - minVal || 1;
    
    for (let i = 0; i <= durationYears; i++) {
      const currentRev = initialRevenue * Math.pow(1 + (growthRate / 100), i);
      const currentVal = currentRev * exitMultiple;
      const currentInvVal = (equityPercentage / 100) * currentVal;
      
      const x = (i / durationYears) * 100;
      const y = 100 - ((currentInvVal - minVal) / range) * 80 - 10; // 10% padding
      points.push(`${x},${y}`);
    }
    return `M ${points.join(" L ")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1D1]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#0F0F12] text-slate-300 min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Calculator className="h-7 w-7 text-[#00D1D1]" />
            <span>ROI Calculator</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Simulate investment scenarios based on company revenue, growth trajectories, and valuation multiples. Forecast expected returns and exit valuations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D1D1]/5 rounded-full blur-3xl"></div>
            
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
              <Target className="h-5 w-5 text-[#8B5CF6]" />
              <span>Investment Parameters</span>
            </h2>

            <div className="space-y-6 relative z-10">
              
              <PresetInput
                label="Investment Amount"
                value={investmentAmount}
                onChange={setInvestmentAmount}
                formatDisplay={formatCurrency}
                accentColor="#00D1D1"
                options={[
                  { label: "$50,000", value: 50000 },
                  { label: "$100,000", value: 100000 },
                  { label: "$250,000", value: 250000 },
                  { label: "$500,000", value: 500000 },
                  { label: "$1,000,000", value: 1000000 },
                  { label: "$5,000,000", value: 5000000 },
                ]}
              />

              <PresetInput
                label="Time Horizon (Years)"
                value={durationYears}
                onChange={setDurationYears}
                formatDisplay={(v) => `${v} Years`}
                accentColor="#FFFFFF"
                options={[
                  { label: "1 Year", value: 1 },
                  { label: "3 Years", value: 3 },
                  { label: "5 Years", value: 5 },
                  { label: "7 Years", value: 7 },
                  { label: "10 Years", value: 10 },
                ]}
              />

              <div className="h-px bg-[#222222] w-full my-4"></div>

              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 pt-2">
                <Activity className="h-5 w-5 text-[#F59E0B]" />
                <span>Company Projections</span>
              </h2>

              <PresetInput
                label="Current Revenue (TTM)"
                value={initialRevenue}
                onChange={setInitialRevenue}
                formatDisplay={formatCurrency}
                accentColor="#F59E0B"
                options={[
                  { label: "$100,000 (Pre-Seed / Seed)", value: 100000 },
                  { label: "$500,000 (Seed)", value: 500000 },
                  { label: "$1,000,000 (Series A)", value: 1000000 },
                  { label: "$5,000,000 (Series B)", value: 5000000 },
                  { label: "$10,000,000 (Series C)", value: 10000000 },
                ]}
              />

              <PresetInput
                label="Expected Annual Growth"
                value={growthRate}
                onChange={setGrowthRate}
                formatDisplay={(v) => `${v}%`}
                accentColor="#10B981"
                options={[
                  { label: "Conservative (15%)", value: 15 },
                  { label: "Moderate (35%)", value: 35 },
                  { label: "Aggressive (75%)", value: 75 },
                  { label: "Hyper-Growth (150%)", value: 150 },
                ]}
              />

              <PresetInput
                label="Revenue Multiple (Exit)"
                value={exitMultiple}
                onChange={setExitMultiple}
                formatDisplay={(v) => `${v}x`}
                accentColor="#FFFFFF"
                options={[
                  { label: "3x (Traditional)", value: 3 },
                  { label: "5x (Healthy SaaS)", value: 5 },
                  { label: "8x (High Growth SaaS)", value: 8 },
                  { label: "12x (Premium / AI)", value: 12 },
                  { label: "20x (Unicorn Trajectory)", value: 20 },
                ]}
              />

            </div>
          </div>
        </div>

        {/* Right Column: Output & Visualization */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 relative overflow-hidden group hover:border-[#00D1D1]/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-16 h-16 text-[#00D1D1]" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expected Exit Value</p>
                <p className="text-3xl font-bold text-white font-mono">{formatCurrency(exitValue)}</p>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <span className="text-[#00D1D1] mr-1">+{formatCurrency(netProfit)}</span> Net Profit
                </p>
              </div>
            </div>

            <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total ROI</p>
                <p className="text-3xl font-bold text-emerald-400 font-mono">
                  {roiPercentage > 1000 ? (roiPercentage/100).toFixed(1) + 'x' : roiPercentage.toFixed(0) + '%'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="text-emerald-500 mr-1">{annualizedROI.toFixed(1)}%</span> Annualized (IRR)
                </p>
              </div>
            </div>

            <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PieChart className="w-16 h-16 text-[#8B5CF6]" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Implied Equity</p>
                <p className="text-3xl font-bold text-white font-mono">{equityPercentage.toFixed(2)}%</p>
                <p className="text-xs text-slate-500 mt-2">
                  Valuation: <span className="text-white">{formatCurrency(entryValuation)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Visualization Graph */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 h-80 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <BarChart className="h-4 w-4 text-[#F59E0B]" />
                <span>Investment Value Trajectory</span>
              </h3>
              <div className="text-xs text-slate-400 bg-[#0F0F12] px-3 py-1 rounded border border-[#222222]">
                Year 0 to Year {durationYears}
              </div>
            </div>
            
            {/* Simple SVG Line Chart */}
            <div className="flex-1 w-full relative">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#222222" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#222222" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#222222" strokeWidth="0.5" />
                
                {/* Data Line */}
                {durationYears > 0 && (
                  <>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00D1D1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00D1D1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`${generateChartPath()} L 100,100 L 0,100 Z`}
                      fill="url(#gradient)"
                    />
                    <path
                      d={generateChartPath()}
                      fill="none"
                      stroke="#00D1D1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-lg"
                    />
                    {/* End Point Dot */}
                    <circle 
                      cx="100" 
                      cy={100 - ((exitValue - investmentAmount) / (exitValue - investmentAmount || 1)) * 80 - 10} 
                      r="2" 
                      fill="#00D1D1" 
                    />
                  </>
                )}
              </svg>
              
              {/* X Axis Labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Y0</span>
                <span>Y{Math.ceil(durationYears/2)}</span>
                <span>Y{durationYears}</span>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222222] bg-[#18181B]/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Projection Summary</h3>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-[#0F0F12]">
                    <th className="py-3 px-6 font-semibold">Metric</th>
                    <th className="py-3 px-6 font-semibold text-right">Entry (Year 0)</th>
                    <th className="py-3 px-6 font-semibold text-right">Exit (Year {durationYears})</th>
                    <th className="py-3 px-6 font-semibold text-right text-emerald-500">Growth</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#222222]">
                  <tr className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="py-3 px-6 text-slate-300 font-medium">Company Revenue</td>
                    <td className="py-3 px-6 text-right font-mono text-slate-400">{formatCurrency(initialRevenue)}</td>
                    <td className="py-3 px-6 text-right font-mono text-white">{formatCurrency(futureRevenue)}</td>
                    <td className="py-3 px-6 text-right font-mono text-emerald-400">
                      {((futureRevenue / initialRevenue - 1) * 100).toFixed(0)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="py-3 px-6 text-slate-300 font-medium">Company Valuation</td>
                    <td className="py-3 px-6 text-right font-mono text-slate-400">{formatCurrency(entryValuation)}</td>
                    <td className="py-3 px-6 text-right font-mono text-white">{formatCurrency(exitValuation)}</td>
                    <td className="py-3 px-6 text-right font-mono text-emerald-400">
                      {((exitValuation / entryValuation - 1) * 100).toFixed(0)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-[#18181B]/50 transition-colors bg-[#00D1D1]/5">
                    <td className="py-3 px-6 text-[#00D1D1] font-bold flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#00D1D1] mr-2"></div>
                      Your Investment Value
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-slate-400">{formatCurrency(investmentAmount)}</td>
                    <td className="py-3 px-6 text-right font-mono text-[#00D1D1] font-bold">{formatCurrency(exitValue)}</td>
                    <td className="py-3 px-6 text-right font-mono text-emerald-400 font-bold">
                      {roiPercentage > 1000 ? (roiPercentage/100).toFixed(1) + 'x' : roiPercentage.toFixed(0) + '%'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
