"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUpRight, ArrowDownRight, Info, Download, Calendar,
  PieChart as PieChartIcon, TrendingUp, DollarSign, Activity, Sparkles, Scale
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, ReferenceLine
} from "recharts";

export default function InsightsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("May 12 - Jun 12, 2025");

  const exportPDF = async () => {
    toast.loading("Generating PDF...", { id: "pdf-export" });
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-content');
      const opt = {
        margin:       0.3,
        filename:     'Insights-Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF Downloaded successfully!", { id: "pdf-export" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-export" });
    }
  };

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchApi('/insights/portfolio');
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch portfolio data", err);
        toast.error("Failed to load portfolio insights");
      } finally {
        setIsLoading(false);
      }
    };
    loadPortfolioData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1D1]"></div>
      </div>
    );
  }

  if (!data) return <div className="text-white p-8">No data found</div>;

  const { summary, investments, ownershipBreakdown, comparables, aiInsights } = data;

  // Format Helpers
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  // Sparkline SVG generator
  const Sparkline = ({ data, color, type = 'line' }: { data: number[], color: string, type?: 'line' | 'bar' }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    if (type === 'bar') {
      return (
        <svg viewBox="0 0 100 30" className="w-16 h-6 overflow-visible">
          {data.map((val, i) => {
            const h = ((val - min) / range) * 20 + 5;
            const x = (i / (data.length - 1)) * 90;
            return <rect key={i} x={x} y={30 - h} width="8" height={h} fill={color} rx="2" />;
          })}
        </svg>
      );
    }
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - (((val - min) / range) * 20 + 5);
      return `${x},${y}`;
    }).join(" L ");

    return (
      <svg viewBox="0 0 100 30" className="w-20 h-6 overflow-visible">
        <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Metric Card Component
  const MetricCard = ({ title, value, change, suffix = "", sparklineData, sparklineColor, sparklineType = 'line', icon: Icon, isPositive }: any) => (
    <div className="bg-[#141416] border border-[#222222] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
          <div className="w-6 h-6 rounded bg-[#222222] flex items-center justify-center mr-2">
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          {title}
          <Info className="w-3 h-3 ml-1 cursor-pointer text-slate-500" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" /> : <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />}
            <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : !isNaN(Number(change)) ? Number(change).toFixed(2) : change}%
            </span>
            <span className="text-[10px] text-slate-500 ml-1">{suffix}</span>
          </div>
          <Sparkline data={sparklineData} color={sparklineColor} type={sparklineType} />
        </div>
      </div>
    </div>
  );

  // Dilution Waterfall Data
  const waterfallData = [
    { name: 'Pre-Money Valuation', value: 80, pv: 0 },
    { name: 'New Investment', value: 20, pv: 80, isInvestment: true },
    { name: 'Post-Money Valuation', value: 100, pv: 0, isPost: true },
    { name: 'Investor Ownership (Post-Money)', value: 18.7, pv: 0, isResult: true }
  ];

  // Valuation Trend Data (From first investment or mocked)
  const lineChartData = investments?.[0]?.valuation_history?.map((h: any) => ({
    name: h.round_name,
    date: new Date(h.round_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    val: Number(h.valuation)
  })) || [
    { name: 'Seed', date: 'Dec \'22', val: 15000000 },
    { name: 'Series A', date: 'May \'23', val: 40000000 },
    { name: 'Series B', date: 'Nov \'23', val: 80000000 },
    { name: 'Series C', date: 'May \'24', val: 120000000 }
  ];

  return (
    <div id="report-content" className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 font-sans bg-[#0F0F12] text-slate-300 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Portfolio & Share Value Insights</h1>
          <p className="text-slate-400 text-sm">Real-time ownership analytics, valuation trends, and portfolio performance.</p>
        </div>
        <div className="flex items-center space-x-3" data-html2canvas-ignore="true">
          <button onClick={exportPDF} className="flex items-center px-4 py-2 border border-[#222222] rounded-lg text-sm text-white hover:bg-[#222222] transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <div className="relative">
            <select
              className="appearance-none bg-[#141416] border border-[#222222] text-white text-sm rounded-lg pl-4 pr-10 py-2 hover:bg-[#222222] transition-colors cursor-pointer outline-none focus:border-[#00D1D1]"
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); toast.success("Date range filtering is active."); }}
            >
              <option value="May 12 - Jun 12, 2025">May 12 - Jun 12, 2025</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Quarter">Last Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
            <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Top KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          title="Implied Share Price" value={`$${summary.impliedSharePrice.toFixed(2)}`} change={summary.impliedSharePriceChange} suffix="30D Change"
          isPositive={summary.impliedSharePriceChange >= 0} icon={DollarSign}
          sparklineData={[18, 19, 21, 20, 22, 23.48]} sparklineColor="#00D1D1"
        />
        <MetricCard 
          title="Ownership Dilution" value={`${summary.ownershipDilution.toFixed(1)}%`} change={summary.ownershipDilutionChange} suffix="Since Last Round"
          isPositive={false} icon={PieChartIcon} // Red positive means bad for dilution, but screenshot shows red
          sparklineData={[12, 14, 15, 17, 18, 18.7]} sparklineColor="#8B5CF6"
        />
        <MetricCard 
          title="Portfolio IRR" value={`${summary.portfolioIRR.toFixed(1)}%`} change={summary.portfolioIRRChange} suffix="Net IRR (Gross)"
          isPositive={summary.portfolioIRRChange >= 0} icon={TrendingUp}
          sparklineData={[15, 18, 17, 20, 22, 24.6]} sparklineColor="#10B981"
        />
        <MetricCard 
          title="Unrealized Gain" value={formatCurrency(summary.unrealizedGain)} change={summary.unrealizedGainChange} suffix="Since Inception"
          isPositive={summary.unrealizedGainChange >= 0} icon={Scale}
          sparklineData={[10, 20, 25, 35, 40, 48.7]} sparklineColor="#F59E0B"
        />
        <MetricCard 
          title="Active Raises" value={summary.activeRaises} change={summary.activeRaisesChange} suffix="In Progress"
          isPositive={summary.activeRaisesChange >= 0} icon={Activity}
          sparklineData={[2, 3, 5, 4, 6, 7]} sparklineColor="#3B82F6" sparklineType="bar"
        />
        <MetricCard 
          title="Exit Probability" value={`${summary.exitProbability}%`} change={summary.exitProbabilityChange} suffix="Weighted Avg."
          isPositive={summary.exitProbabilityChange >= 0} icon={Sparkles}
          sparklineData={[20, 22, 25, 28, 30, 32]} sparklineColor="#10B981"
        />
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ownership Breakdown */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 flex flex-col">
          <div className="flex items-center text-sm font-semibold text-white mb-6">
            Ownership Breakdown (Post-Money)
            <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-pointer" />
          </div>
          <p className="text-xs text-slate-400 mb-4">Total Post-Money {formatCurrency(120000000)}</p>
          <div className="flex-1 flex items-center justify-between">
            <div className="w-1/2 relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownershipBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {ownershipBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181B', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-white">100%</span>
                <span className="text-[9px] text-slate-400 uppercase text-center mt-1 max-w-[60px]">Post-Money Ownership</span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col space-y-3">
              {ownershipBreakdown.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-slate-300">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    {item.name}
                  </div>
                  <div className="font-mono text-white">{item.value.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">Fully diluted ownership after this round</p>
        </div>

        {/* Dilution Waterfall */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 flex flex-col">
          <div className="flex items-center text-sm font-semibold text-white mb-2">
            Dilution Waterfall (Series B)
            <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-pointer" />
          </div>
          <p className="text-xs text-slate-400 mb-6">Amounts in $M</p>
          <div className="flex-1 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <RechartsTooltip cursor={{ fill: '#18181B' }} contentStyle={{ backgroundColor: '#18181B', border: '1px solid #333', borderRadius: '8px' }} />
                <Bar dataKey="pv" stackId="a" fill="transparent" />
                <Bar dataKey="value" stackId="a" radius={[2, 2, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isInvestment ? '#10B981' : entry.isResult ? '#8B5CF6' : '#222222'} stroke={entry.isResult ? 'none' : entry.isInvestment ? 'none' : '#444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">New investment of $20.0M results in 18.7% ownership for investors.</p>
        </div>

        {/* Valuation Trend */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm font-semibold text-white">
              Startup Valuation Trend
              <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-pointer" />
            </div>
            <select className="bg-[#0F0F12] border border-[#333] text-xs text-slate-300 rounded px-2 py-1 outline-none">
              <option>Post-Money</option>
              <option>Pre-Money</option>
            </select>
          </div>
          <div className="flex items-end mb-4">
            <span className="text-2xl font-bold text-white mr-3">{formatCurrency(lineChartData[lineChartData.length-1].val)}</span>
            <span className="text-xs text-emerald-500 font-semibold mb-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" /> 33.3%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 -mt-3 mb-4">Latest Valuation</p>
          <div className="flex-1 h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 0, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide domain={['dataMin - 10000000', 'dataMax + 20000000']} />
                <Line type="monotone" dataKey="val" stroke="#00D1D1" strokeWidth={2} dot={{ r: 4, fill: "#00D1D1", stroke: "#00D1D1" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 px-4 mt-2">
            {lineChartData.map((d: any, i: number) => (
              <span key={i} className="text-center">
                {d.date}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Market Comparables */}
        <div className="lg:col-span-3 bg-[#141416] border border-[#222222] rounded-xl p-5">
          <div className="flex items-center text-sm font-semibold text-white mb-6">
            Market Comparables
            <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-pointer" />
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-500 border-b border-[#222]">
                <th className="pb-3 font-medium">Metric</th>
                <th className="pb-3 font-medium text-right">Your Portfolio<br/><span className="text-[9px]">(Median)</span></th>
                <th className="pb-3 font-medium text-right">Market Median</th>
                <th className="pb-3 font-medium text-right">Percentile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {comparables.map((comp: any, i: number) => (
                <tr key={i} className="hover:bg-[#18181B] transition-colors">
                  <td className="py-4 text-slate-300">{comp.metric}</td>
                  <td className="py-4 text-right font-mono text-white">{comp.portfolio}</td>
                  <td className="py-4 text-right font-mono text-slate-400">{comp.market}</td>
                  <td className="py-4 text-right font-mono text-white">{comp.percentile}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors mt-6 font-medium flex items-center">
            View full comparables report <ArrowUpRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Portfolio Watchlist */}
        <div className="lg:col-span-5 bg-[#141416] border border-[#222222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-sm font-semibold text-white">
              Portfolio Watchlist
              <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-pointer" />
            </div>
            <button className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors flex items-center">
              View All Portfolio <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 border-b border-[#222]">
                  <th className="pb-3 font-medium flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> Company</th>
                  <th className="pb-3 font-medium px-2">Stage</th>
                  <th className="pb-3 font-medium px-2">Implied Share Price</th>
                  <th className="pb-3 font-medium px-4">30D Change</th>
                  <th className="pb-3 font-medium px-2 text-right">Run Rate Revenue</th>
                  <th className="pb-3 font-medium px-2 text-right">Sentiment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {investments?.slice(0, 6).map((inv: any, i: number) => {
                  const sparkData = [10, 15, 12, 18, 16, 16 + Number(inv.share_price_30d_change)];
                  const isPos = Number(inv.share_price_30d_change) >= 0;
                  const col = isPos ? "#10B981" : "#EF4444";
                  
                  return (
                  <tr key={i} className="hover:bg-[#18181B] transition-colors">
                    <td className="py-3 text-slate-200 font-medium flex items-center">
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mr-3 ${isPos ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#3B82F6]/20 text-[#3B82F6]'}`}>
                        {inv.company_name.charAt(0)}
                      </div>
                      {inv.company_name}
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-[#8B5CF6]/10 text-[#A78BFA] px-2 py-0.5 rounded text-[10px] font-medium border border-[#8B5CF6]/20">
                        {inv.stage}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-300">${Number(inv.implied_share_price).toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono flex items-center">
                      <span className={`w-12 ${isPos ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPos ? '+' : ''}{Number(inv.share_price_30d_change).toFixed(1)}%
                      </span>
                      <div className="ml-2 w-16">
                        <Sparkline data={sparkData} color={col} />
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-300">{formatCurrency(inv.run_rate_revenue)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`text-[10px] font-semibold ${
                        inv.sentiment.includes('Bullish') ? 'text-emerald-500' : 
                        inv.sentiment.includes('Neutral') ? 'text-[#F59E0B]' : 'text-red-500'
                      }`}>
                        {inv.sentiment}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights & Recommendations */}
        <div className="lg:col-span-4 bg-[#141416] border border-[#222222] rounded-xl p-5 flex flex-col">
          <div className="flex items-center text-sm font-semibold text-white mb-6">
            <Sparkles className="w-4 h-4 text-[#8B5CF6] mr-2" />
            AI Insights & Recommendations
            <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-pointer" />
          </div>
          <div className="flex-1 space-y-4">
            {aiInsights.map((insight: any, i: number) => {
              const typeColor = insight.type.includes('Opportunity') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                insight.type.includes('Outlier') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20';
              return (
                <div key={i} className="border-b border-[#222] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${typeColor}`}>
                      {insight.type}
                    </span>
                    <span className="text-white text-sm font-semibold ml-3">{insight.company}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {insight.desc}
                  </p>
                  <button className="text-[11px] text-[#8B5CF6] hover:text-[#A78BFA] transition-colors font-medium flex items-center">
                    {insight.action} <ArrowUpRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Text */}
      <div className="flex justify-between items-center text-[10px] text-slate-600 mt-8 pt-4 border-t border-[#222]">
        <span>All valuations are model-generated and for informational purposes only. Not investment advice.</span>
        <span>Last updated: Jun 12, 2025 10:30 AM ⟳</span>
      </div>
    </div>
  );
}
