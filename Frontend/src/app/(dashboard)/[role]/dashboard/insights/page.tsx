"use client"

import { useState, useEffect } from "react";
import { 
  Activity, TrendingUp, DollarSign, MessageSquare, 
  PieChart, BarChart2, Cpu, Sparkles, 
  Scale, Info, CheckCircle2, AlertTriangle
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

type SectorType = 'saas' | 'fintech' | 'healthtech' | 'ai_ml' | 'cleantech';

export default function InsightsPage() {
  const { user } = useAuth();
  
  // Real stats from API
  const [stats, setStats] = useState({
    totalTargetRevenue: 0,
    averageDealSize: 0,
    totalDeals: 0,
    totalMatches: 0,
    sectorCounts: { saas: 0, fintech: 0, healthtech: 0, ai_ml: 0, cleantech: 0 } as Record<SectorType, number>
  });
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true);

  // Dilution Calculator State
  const [preMoneyVal, setPreMoneyVal] = useState(5000000); // Default $5M
  const [investmentAmt, setInvestmentAmt] = useState(1000000); // Default $1M
  const [optionPool, setOptionPool] = useState(10); // Default 10%

  // AI Advisor State
  const [selectedSector, setSelectedSector] = useState<SectorType>('saas');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  // Top 10 Opportunities State
  const [topOpportunities, setTopOpportunities] = useState<any[]>([]);
  const [topOppLoading, setTopOppLoading] = useState(false);
  const [topOppSector, setTopOppSector] = useState('all');

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi('/insights/overview');
      if (res.data) {
        setStats({
          totalTargetRevenue: res.data.totalTargetRevenue,
          averageDealSize: res.data.averageDealSize,
          totalDeals: res.data.totalDeals,
          totalMatches: res.data.totalMatches,
          sectorCounts: res.data.sectorCounts
        });
        setMonthlyCounts(res.data.monthlyCounts);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard metrics", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopOpportunities = async () => {
    try {
      setTopOppLoading(true);
      const res = await fetchApi(`/insights/top-opportunities?sector=${topOppSector}`);
      if (res.data) {
        setTopOpportunities(res.data);
      }
    } catch (err) {
      console.error("Failed to load top placements", err);
    } finally {
      setTopOppLoading(false);
    }
  };

  useEffect(() => {
    loadTopOpportunities();
  }, [topOppSector]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Dilution Calculations
  const postMoneyVal = preMoneyVal + investmentAmt;
  const investorOwnership = (investmentAmt / postMoneyVal) * 100;
  const optionPoolOwnership = optionPool;
  const founderOwnership = 100 - investorOwnership - optionPoolOwnership;

  // Dynamic Sector allocation percentages
  const totalDeals = stats.totalDeals;
  const saasPct = totalDeals > 0 ? stats.sectorCounts.saas / totalDeals : 0;
  const fintechPct = totalDeals > 0 ? stats.sectorCounts.fintech / totalDeals : 0;
  const healthtechPct = totalDeals > 0 ? stats.sectorCounts.healthtech / totalDeals : 0;
  const aimlPct = totalDeals > 0 ? stats.sectorCounts.ai_ml / totalDeals : 0;
  const cleantechPct = totalDeals > 0 ? stats.sectorCounts.cleantech / totalDeals : 0;

  // SVG Circle length parameters (Radius = 70, Circumference = ~440)
  const circumference = 440;
  const saasLength = saasPct * circumference;
  const aimlLength = aimlPct * circumference;
  const fintechLength = fintechPct * circumference;
  const healthtechLength = healthtechPct * circumference;
  const cleantechLength = cleantechPct * circumference;

  const saasOffset = 0;
  const aimlOffset = -saasLength;
  const fintechOffset = -(saasLength + aimlLength);
  const healthtechOffset = -(saasLength + aimlLength + fintechLength);
  const cleantechOffset = -(saasLength + aimlLength + fintechLength + healthtechLength);

  // SVG Area path coordinates calculation for momentum graph
  const maxMonthlyVal = Math.max(...monthlyCounts, 1);
  const coords = monthlyCounts.map((c, i) => {
    const x = i * 100;
    const y = 100 - (c / maxMonthlyVal) * 80;
    return { x, y };
  });
  const linePath = `M ${coords.map(pt => `${pt.x} ${pt.y}`).join(' L ')}`;
  const areaPath = `${linePath} L 500 120 L 0 120 Z`;

  // AI Advisor Sector Trends Data (integrated with actual marketplace stats)
  const handleGenerateAdvisorReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetchApi(`/insights/sector-trends?sector=${selectedSector}`);
      if (res.data) {
        setGeneratedReport(res.data);
        toast.success("Intelligence report generated!");
      }
    } catch (err) {
      console.error("Failed to generate report", err);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val === 0) return "$0";
    if (val < 1000000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${(val / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#0F0F12] text-slate-300 min-h-screen">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#222222]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="h-6 w-6 text-[#00D1D1] animate-pulse" />
            <span>Marketplace Intelligence &amp; Insights</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time sector valuations, round dilution simulators, and AI match analytics.
          </p>
        </div>
        <div className="text-xs text-[#00D1D1] bg-[#00D1D1]/10 px-3 py-1 rounded-full border border-[#00D1D1]/20 font-mono mt-2 md:mt-0 self-start select-none">
          Live Market Mode
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Placements Value */}
        <div className="bg-[#141416]/60 border border-[#222222] p-5 rounded-xl flex items-center justify-between hover:border-[#00D1D1]/30 transition-all group">
          <div className="space-y-1">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Marketplace Placements Value</span>
            <span className="text-xl font-bold text-white block font-mono group-hover:text-[#00D1D1] transition-colors">
              {isLoading ? "..." : formatCurrency(stats.totalTargetRevenue)}
            </span>
            <span className="text-[10px] text-slate-500">Aggregate expected target</span>
          </div>
          <div className="h-10 w-10 bg-[#00D1D1]/10 text-[#00D1D1] rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Match Volume */}
        <div className="bg-[#141416]/60 border border-[#222222] p-5 rounded-xl flex items-center justify-between hover:border-[#8B5CF6]/30 transition-all group">
          <div className="space-y-1">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Active Matches (Chats)</span>
            <span className="text-xl font-bold text-white block font-mono group-hover:text-[#8B5CF6] transition-colors">
              {isLoading ? "..." : stats.totalMatches}
            </span>
            <span className="text-[10px] text-slate-500">Live communication pipelines</span>
          </div>
          <div className="h-10 w-10 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Average Placement Target */}
        <div className="bg-[#141416]/60 border border-[#222222] p-5 rounded-xl flex items-center justify-between hover:border-[#F59E0B]/30 transition-all group">
          <div className="space-y-1">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Average Deal Size</span>
            <span className="text-xl font-bold text-white block font-mono group-hover:text-[#F59E0B] transition-colors">
              {isLoading ? "..." : formatCurrency(stats.averageDealSize)}
            </span>
            <span className="text-[10px] text-slate-500">Mean capital request target</span>
          </div>
          <div className="h-10 w-10 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Total Listed Placements */}
        <div className="bg-[#141416]/60 border border-[#222222] p-5 rounded-xl flex items-center justify-between hover:border-[#10B981]/30 transition-all group">
          <div className="space-y-1">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Total Opportunities</span>
            <span className="text-xl font-bold text-white block font-mono group-hover:text-[#10B981] transition-colors">
              {isLoading ? "..." : stats.totalDeals}
            </span>
            <span className="text-[10px] text-slate-500">Total listed proposals</span>
          </div>
          <div className="h-10 w-10 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 3. Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Charts / Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sector Allocation Panel */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <PieChart className="h-4.5 w-4.5 text-[#00D1D1]" />
                <span>Placement Allocation by Sector</span>
              </h3>
              <span className="text-[10px] text-slate-500">Database statistics</span>
            </div>

            {totalDeals === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 text-slate-500 bg-[#0F0F12]/30 border border-dashed border-[#222222] rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500/60" />
                <span className="text-xs">No opportunities currently listed to calculate sector allocation.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                {/* SVG Doughnut Chart */}
                <div className="relative flex justify-center">
                  <svg className="w-48 h-48 transform -rotate-90 select-none">
                    {/* Outer circle track */}
                    <circle cx="96" cy="96" r="70" fill="transparent" stroke="#222222" strokeWidth="22" />
                    
                    {/* SaaS Segment */}
                    {saasLength > 0 && (
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="transparent" 
                        stroke="#00D1D1" 
                        strokeWidth="24" 
                        strokeDasharray={`${saasLength} 440`} 
                        strokeDashoffset={saasOffset}
                        className="transition-all duration-500 hover:stroke-[28px] cursor-pointer"
                      />
                    )}
                    
                    {/* AI/ML Segment */}
                    {aimlLength > 0 && (
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="transparent" 
                        stroke="#8B5CF6" 
                        strokeWidth="24" 
                        strokeDasharray={`${aimlLength} 440`} 
                        strokeDashoffset={aimlOffset}
                        className="transition-all duration-500 hover:stroke-[28px] cursor-pointer"
                      />
                    )}
                    
                    {/* FinTech Segment */}
                    {fintechLength > 0 && (
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="transparent" 
                        stroke="#F59E0B" 
                        strokeWidth="24" 
                        strokeDasharray={`${fintechLength} 440`} 
                        strokeDashoffset={fintechOffset}
                        className="transition-all duration-500 hover:stroke-[28px] cursor-pointer"
                      />
                    )}
                    
                    {/* HealthTech Segment */}
                    {healthtechLength > 0 && (
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="transparent" 
                        stroke="#10B981" 
                        strokeWidth="24" 
                        strokeDasharray={`${healthtechLength} 440`} 
                        strokeDashoffset={healthtechOffset}
                        className="transition-all duration-500 hover:stroke-[28px] cursor-pointer"
                      />
                    )}

                    {/* CleanTech Segment */}
                    {cleantechLength > 0 && (
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        fill="transparent" 
                        stroke="#EC4899" 
                        strokeWidth="24" 
                        strokeDasharray={`${cleantechLength} 440`} 
                        strokeDashoffset={cleantechOffset}
                        className="transition-all duration-500 hover:stroke-[28px] cursor-pointer"
                      />
                    )}
                  </svg>
                  {/* Center Value */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                    <span className="text-2xl font-bold text-white font-mono">{stats.totalDeals}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Total Deals</span>
                  </div>
                </div>

                {/* Legends with dynamic numbers */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#222222]/40 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#00D1D1]" />
                      <span className="text-slate-400 font-medium">SaaS / Software</span>
                    </div>
                    <span className="text-white font-bold font-mono">{stats.sectorCounts.saas} deals</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/40 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
                      <span className="text-slate-400 font-medium">Artificial Intelligence / ML</span>
                    </div>
                    <span className="text-white font-bold font-mono">{stats.sectorCounts.ai_ml} deals</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/40 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-slate-400 font-medium">FinTech / Payments</span>
                    </div>
                    <span className="text-white font-bold font-mono">{stats.sectorCounts.fintech} deals</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/40 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                      <span className="text-slate-400 font-medium">HealthTech / Bio</span>
                    </div>
                    <span className="text-white font-bold font-mono">{stats.sectorCounts.healthtech} deals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#EC4899]" />
                      <span className="text-slate-400 font-medium">CleanTech / ESG</span>
                    </div>
                    <span className="text-white font-bold font-mono">{stats.sectorCounts.cleantech} deals</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deal Flow Momentum (SVG Area Graph) */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <BarChart2 className="h-4.5 w-4.5 text-[#8B5CF6]" />
                <span>Deal Creation Momentum (Last 6 Months)</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Real-time binning</span>
            </div>

            {totalDeals === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 text-slate-500 bg-[#0F0F12]/30 border border-dashed border-[#222222] rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500/60" />
                <span className="text-xs">No historical creation data available in database.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Area graph SVG */}
                <div className="w-full h-40">
                  <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#222222" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#222222" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#222222" strokeDasharray="3 3" />

                    {/* Area fill */}
                    <path 
                      d={`${areaPath}`} 
                      fill="url(#chartGrad)" 
                    />

                    {/* Trend line */}
                    <path 
                      d={`${linePath}`} 
                      fill="none" 
                      stroke="#8B5CF6" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />

                    {/* Final point indicator */}
                    {coords.length > 0 && (
                      <>
                        <circle cx={coords[5].x} cy={coords[5].y} r="5" fill="#8B5CF6" />
                        <circle cx={coords[5].x} cy={coords[5].y} r="10" fill="transparent" stroke="#8B5CF6" strokeWidth="1" className="animate-ping" />
                      </>
                    )}
                  </svg>
                </div>

                {/* Months Axis */}
                <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest select-none px-1">
                  <span>-5 Months</span>
                  <span>-4 Months</span>
                  <span>-3 Months</span>
                  <span>-2 Months</span>
                  <span>-1 Month</span>
                  <span>Current Month</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Dilution Calculator */}
        <div className="space-y-8">
          
          {/* Equity Simulator */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Scale className="h-4.5 w-4.5 text-[#F59E0B]" />
                <span>Round Dilution Simulator</span>
              </h3>
              <span title="Compute post-money equity splits based on round size.">
                <Info className="h-4 w-4 text-slate-500 hover:text-slate-300 cursor-help" />
              </span>
            </div>

            <div className="space-y-5 text-xs select-none">
              
              {/* Slider 1: Pre-money Valuation */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Pre-Money Valuation</span>
                  <span className="text-white font-bold font-mono">${(preMoneyVal / 1000000).toFixed(1)}M</span>
                </div>
                <input 
                  type="range" 
                  min="500000" 
                  max="30000000" 
                  step="500000"
                  value={preMoneyVal}
                  onChange={(e) => setPreMoneyVal(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] bg-[#0F0F12] border border-[#222222] rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Investment Size */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Investment Sought</span>
                  <span className="text-[#00D1D1] font-bold font-mono">${(investmentAmt / 1000000).toFixed(2)}M</span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="10000000" 
                  step="100000"
                  value={investmentAmt}
                  onChange={(e) => setInvestmentAmt(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] bg-[#0F0F12] border border-[#222222] rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3: Options Pool Increase */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Post-Round Option Pool</span>
                  <span className="text-white font-bold font-mono">{optionPool}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="1"
                  value={optionPool}
                  onChange={(e) => setOptionPool(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] bg-[#0F0F12] border border-[#222222] rounded-lg cursor-pointer"
                />
              </div>

              {/* Calculated Outputs */}
              <div className="border-t border-[#222222] pt-4 space-y-3.5 bg-[#0F0F12]/30 p-3 rounded-lg border border-[#222222]/40">
                <div className="flex justify-between text-xs pb-2 border-b border-[#222222]/30">
                  <span className="text-slate-500 font-medium">Post-Money Valuation</span>
                  <span className="text-white font-bold font-mono">${(postMoneyVal / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-[#222222]/30">
                  <span className="text-slate-500 font-medium">Investor Shares (Dilution)</span>
                  <span className="text-[#00D1D1] font-bold font-mono">{investorOwnership.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Founder Shares (Post-round)</span>
                  <span className="text-white font-bold font-mono">{founderOwnership.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI advisor teaser card */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
              <span>AI Placement Match Finder</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed bg-[#0F0F12] p-3 rounded border border-[#222222] whitespace-pre-wrap">
              Unlock targeted institutional matching lists by configuring deal characteristics. Ensure your pre-money valuation remains within matching bounds.
            </p>
            <button
              onClick={() => {
                toast.success("Dilution parameters locked. VC matching engines notified.");
              }}
              className="w-full py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded transition-colors cursor-pointer text-center"
            >
              Lock Configuration
            </button>
          </div>

        </div>

      </div>

      {/* 4. AI Market Intelligence Advisor */}
      <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-[#8B5CF6] animate-pulse" />
            <div>
              <h3 className="text-sm font-semibold text-white">AI Market Intelligence Advisor</h3>
              <p className="text-[10px] text-slate-500">Instant sector multiples &amp; investment dynamics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as SectorType)}
              className="bg-[#0F0F12] border border-[#222222] text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="saas">SaaS Sector</option>
              <option value="fintech">FinTech Sector</option>
              <option value="healthtech">HealthTech Sector</option>
              <option value="ai_ml">AI / ML Sector</option>
              <option value="cleantech">CleanTech Sector</option>
            </select>
            <button
              onClick={handleGenerateAdvisorReport}
              disabled={isGeneratingReport}
              className="flex items-center bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold px-4 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <span>{isGeneratingReport ? "Compiling..." : "Generate Advisor Report"}</span>
            </button>
          </div>
        </div>

        {/* Advisor Report Response Container */}
        {generatedReport ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            
            {/* Left Box: Stats Summary */}
            <div className="bg-[#0F0F12] border border-[#222222] p-5 rounded-lg space-y-4">
              <h4 className="text-xs font-semibold text-[#8B5CF6] uppercase border-b border-[#222222] pb-2">Market Multiples</h4>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500">Revenue Multiples</span>
                  <span className="font-bold text-white block mt-0.5">{generatedReport.multiple}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Deal Volume</span>
                  <span className="font-bold text-white block mt-0.5">{generatedReport.dealVolume}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Investor Sentiment</span>
                  <span className="font-bold text-white block mt-0.5">{generatedReport.sentiment}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Average Match Probability</span>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <div className="flex-1 bg-[#222222] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#8B5CF6] h-full" style={{ width: `${generatedReport.matchingScore}%` }}></div>
                    </div>
                    <span className="font-bold text-white font-mono text-[10px]">{generatedReport.matchingScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right Box: Bullet Insights */}
            <div className="md:col-span-2 bg-[#0F0F12] border border-[#222222] p-5 rounded-lg space-y-4">
              <h4 className="text-xs font-semibold text-[#8B5CF6] uppercase border-b border-[#222222] pb-2">Strategic Intelligence Summary</h4>
              <ul className="space-y-4 text-xs">
                {generatedReport.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <div className="h-5 w-5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="leading-relaxed text-slate-400 font-sans">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 border border-dashed border-[#222222] rounded-lg bg-[#0F0F12]/30 flex flex-col items-center justify-center space-y-2">
            <Cpu className="h-8 w-8 text-slate-700 animate-pulse" />
            <h4 className="text-xs font-semibold text-slate-400">Advisor Ready</h4>
            <p className="text-[11px] max-w-sm">
              Select a marketplace sector from the dropdown above and generate a strategic trends report summarizing valuations, multiples, and match guidelines.
            </p>
          </div>
        )}

      </div>

      {/* 5. Top 10 Placements */}
      <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-[#10B981]" />
            <div>
              <h3 className="text-sm font-semibold text-white">Top 10 Placements</h3>
              <p className="text-[10px] text-slate-500">Highest value expected revenue targets</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={topOppSector}
              onChange={(e) => setTopOppSector(e.target.value)}
              className="bg-[#0F0F12] border border-[#222222] text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="saas">SaaS Sector</option>
              <option value="fintech">FinTech Sector</option>
              <option value="healthtech">HealthTech Sector</option>
              <option value="ai_ml">AI / ML Sector</option>
              <option value="cleantech">CleanTech Sector</option>
            </select>
          </div>
        </div>

        {topOppLoading ? (
          <div className="flex justify-center py-10">
            <Activity className="h-6 w-6 text-[#10B981] animate-spin" />
          </div>
        ) : topOpportunities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-[#222222] rounded-lg bg-[#0F0F12]/30">
            <p className="text-[11px]">No top placements found for this sector.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F0F12] text-slate-500 border-b border-[#222222]">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Rank</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Company</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Sector</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Expected Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/50">
                {topOpportunities.map((opp, idx) => (
                  <tr key={opp.id} className="hover:bg-[#0F0F12]/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">#{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-white">{opp.companies?.company_name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-400">{opp.companies?.industry || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#10B981] font-bold">
                      {formatCurrency(Number(opp.expected_revenue || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
