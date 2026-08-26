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

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load opportunities and chats in parallel
      const [oppsRes, chatsRes] = await Promise.all([
        fetchApi('/opportunities').catch(() => ({ data: [] })),
        fetchApi('/chats').catch(() => ({ data: [] }))
      ]);

      const opps = oppsRes.data || [];
      const chats = chatsRes.data || [];

      // Calculate totals
      let totalRev = 0;
      let dealCount = 0;
      const sectors: Record<SectorType, number> = {
        saas: 0,
        fintech: 0,
        healthtech: 0,
        ai_ml: 0,
        cleantech: 0
      };

      // Monthly binning (last 6 months)
      const monthsData = [0, 0, 0, 0, 0, 0];
      const now = new Date();

      opps.forEach((o: any) => {
        const rev = Number(o.expected_revenue || 0);
        totalRev += rev;
        dealCount += 1;

        const rawSector = (o.companies?.industry || 'saas').toLowerCase();
        if (rawSector.includes('saas') || rawSector.includes('software')) sectors.saas += 1;
        else if (rawSector.includes('fintech') || rawSector.includes('finance')) sectors.fintech += 1;
        else if (rawSector.includes('health') || rawSector.includes('med')) sectors.healthtech += 1;
        else if (rawSector.includes('ai') || rawSector.includes('machine') || rawSector.includes('intelligence')) sectors.ai_ml += 1;
        else if (rawSector.includes('clean') || rawSector.includes('green') || rawSector.includes('solar')) sectors.cleantech += 1;
        else sectors.saas += 1; // Default fallback

        // Month indexing
        const createdDate = new Date(o.created_at || Date.now());
        const diffMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
        if (diffMonths >= 0 && diffMonths < 6) {
          monthsData[5 - diffMonths] += 1;
        }
      });

      setStats({
        totalTargetRevenue: totalRev,
        averageDealSize: dealCount > 0 ? totalRev / dealCount : 0,
        totalDeals: dealCount,
        totalMatches: chats.length || 0,
        sectorCounts: sectors
      });
      setMonthlyCounts(monthsData);
    } catch (err) {
      console.error("Failed to compile dashboard metrics", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

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
  const getSectorTrends = (sector: SectorType) => {
    const localDeals = stats.sectorCounts[sector];
    const matchRate = stats.totalDeals > 0 ? (stats.totalMatches / stats.totalDeals) * 100 : 0;
    const sectorPercent = stats.totalDeals > 0 ? ((localDeals / stats.totalDeals) * 100).toFixed(0) : 0;
    const matchScore = Math.round(Math.min(98, 65 + matchRate * 0.3));

    const trends: Record<SectorType, any> = {
      saas: {
        name: 'Software-as-a-Service (SaaS)',
        multiple: '8.5x - 11.2x ARR',
        dealVolume: `${localDeals} active deal(s) (${sectorPercent}% of flow)`,
        sentiment: 'Bullish on B2B, Neutral on SMB tools',
        matchingScore: matchScore,
        insights: [
          'Revenue retention (NDR > 115%) remains the single most scrutinized metric by Series A investors.',
          'SaaS valuations are stabilizing around historical means after the volatility of recent cycles.',
          `Currently, our marketplace has registered ${localDeals} live SaaS/Software placement proposals, indicating active matching interest.`
        ]
      },
      fintech: {
        name: 'Financial Technology (FinTech)',
        multiple: '6.2x - 8.9x Forward Revenue',
        dealVolume: `${localDeals} active deal(s) (${sectorPercent}% of flow)`,
        sentiment: 'Bullish on embedded finance & infrastructure',
        matchingScore: matchScore,
        insights: [
          'RegTech and compliance automation are seeing accelerated VC inflows due to tightening licensing audits.',
          'Payment service margins are tightening, forcing founders to offer high-margin SaaS ledger layers.',
          `We record ${localDeals} active FinTech/payment placements in the database matching our investor profiles.`
        ]
      },
      healthtech: {
        name: 'Health & BioTech (HealthTech)',
        multiple: '9.0x - 14.5x ARR',
        dealVolume: `${localDeals} active deal(s) (${sectorPercent}% of flow)`,
        sentiment: 'Highly Bullish on AI clinical assistance',
        matchingScore: matchScore,
        insights: [
          'Enterprise hospital sales cycles remain long, raising the cash runway requirements for early-stage teams.',
          'FDA regulatory milestones are highly correlated with successful Series A/B cap table conversions.',
          `There are ${localDeals} live health/medtech proposals listed on the marketplace.`
        ]
      },
      ai_ml: {
        name: 'Artificial Intelligence & ML (AI/ML)',
        multiple: '15.0x - 22.0x ARR / Forward Revenue',
        dealVolume: `${localDeals} active deal(s) (${sectorPercent}% of flow)`,
        sentiment: 'Extremely Bullish on agentic AI applications',
        matchingScore: matchScore,
        insights: [
          'GPU capex efficiency and proprietary dataset barriers are the key differentiators for premium seed deals.',
          'Average funding sought is 40% higher than general SaaS due to computing compute/development overheads.',
          `AI/ML currently accounts for ${sectorPercent}% of our active deal pipeline with ${localDeals} listed placement(s).`
        ]
      },
      cleantech: {
        name: 'Clean Energy & ESG (CleanTech)',
        multiple: '5.0x - 7.5x Revenue',
        dealVolume: `${localDeals} active deal(s) (${sectorPercent}% of flow)`,
        sentiment: 'Bullish on battery storage & grid management',
        matchingScore: matchScore,
        insights: [
          'Infrastructure-heavy CleanTech startups rely on structured debt matching alongside traditional equity rounds.',
          'ESG regulatory mandates in EU/North America are driving interest from institutional asset managers.',
          `We track ${localDeals} CleanTech/renewables placement options in our active deal rooms.`
        ]
      }
    };

    return trends[sector];
  };

  const handleGenerateAdvisorReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setGeneratedReport(getSectorTrends(selectedSector));
      setIsGeneratingReport(false);
      toast.success("Intelligence report generated!");
    }, 800);
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

    </div>
  );
}
