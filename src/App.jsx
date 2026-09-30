import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  LayoutDashboard, BarChart3, Users, ShoppingCart, Settings,
  Bell, Search, ChevronDown, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Package, CreditCard, Activity,
  RefreshCw, Download, Filter, MoreHorizontal, Star, Globe,
  Menu, X, Zap, AlertCircle, CheckCircle2, Clock, Eye
} from 'lucide-react'

/* ─── mock data ─── */
const generateRevenue = () =>
  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({
    month: m,
    revenue: 18000 + Math.sin(i * 0.8) * 8000 + i * 2400 + Math.random() * 3000,
    profit: 8000 + Math.sin(i * 0.9) * 3000 + i * 1200 + Math.random() * 2000,
    expenses: 10000 + Math.cos(i * 0.7) * 2000 + Math.random() * 1500,
  }))

const generateTraffic = () =>
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({
    day: d,
    organic: 1200 + Math.random() * 800,
    paid: 600 + Math.random() * 500,
    referral: 300 + Math.random() * 300,
  }))

const generateActivity = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2,'0')}:00`,
    users: Math.floor(Math.random() * 1200 + 200),
  }))

const revenueData = generateRevenue()
const trafficData = generateTraffic()
const activityData = generateActivity()

const kpis = [
  { label: 'Total Revenue', value: '$284,521', delta: '+18.4%', up: true, icon: CreditCard, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', sub: 'vs last month' },
  { label: 'Active Users', value: '47,293', delta: '+12.1%', up: true, icon: Users, color: '#10B981', bg: 'rgba(16,185,129,0.1)', sub: 'daily active' },
  { label: 'Orders', value: '9,847', delta: '-2.3%', up: false, icon: ShoppingCart, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', sub: 'this month' },
  { label: 'Churn Rate', value: '2.14%', delta: '-0.8%', up: true, icon: Activity, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', sub: 'monthly' },
]

const topProducts = [
  { name: 'Nexus Pro Plan', sales: 1842, revenue: '$92,100', growth: 24.5, category: 'SaaS' },
  { name: 'API Credits Bundle', sales: 3201, revenue: '$48,015', growth: 18.2, category: 'Add-on' },
  { name: 'Enterprise Suite', sales: 94, revenue: '$47,000', growth: 31.0, category: 'Enterprise' },
  { name: 'Starter Plan', sales: 5102, revenue: '$25,510', growth: -3.2, category: 'SaaS' },
  { name: 'Data Export Tool', sales: 712, revenue: '$14,240', growth: 8.7, category: 'Add-on' },
]

const recentOrders = [
  { id: '#ORD-7721', customer: 'Stripe Inc.', product: 'Enterprise Suite', amount: '$4,999', status: 'paid', date: '2 min ago', avatar: 'SI' },
  { id: '#ORD-7720', customer: 'Linear', product: 'Pro Plan × 10', amount: '$790', status: 'paid', date: '14 min ago', avatar: 'LN' },
  { id: '#ORD-7719', customer: 'Vercel', product: 'API Credits', amount: '$299', status: 'processing', date: '38 min ago', avatar: 'VC' },
  { id: '#ORD-7718', customer: 'Raycast GmbH', product: 'Pro Plan × 5', amount: '$395', status: 'paid', date: '1h ago', avatar: 'RC' },
  { id: '#ORD-7717', customer: 'Supabase', product: 'Data Export', amount: '$149', status: 'failed', date: '2h ago', avatar: 'SB' },
  { id: '#ORD-7716', customer: 'Resend', product: 'Starter × 20', amount: '$200', status: 'paid', date: '3h ago', avatar: 'RS' },
]

const notifications = [
  { icon: CheckCircle2, color: 'text-emerald-400', title: 'Payment received', desc: '$4,999 from Stripe Inc.', time: '2m' },
  { icon: AlertCircle, color: 'text-amber-400', title: 'High server load', desc: 'EU-West region at 89%', time: '15m' },
  { icon: Users, color: 'text-blue-400', title: 'New enterprise signup', desc: 'Figma joined on Enterprise', time: '1h' },
  { icon: TrendingUp, color: 'text-violet-400', title: 'Revenue milestone', desc: '$250k ARR reached!', time: '3h' },
]

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Users, label: 'Customers' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: Package, label: 'Products' },
  { icon: Globe, label: 'Marketing' },
  { icon: Settings, label: 'Settings' },
]

/* ─── custom chart tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-zinc-400 font-mono mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300">{p.name}:</span>
          <span className="text-white font-semibold">
            {typeof p.value === 'number' && p.value > 1000 ? `$${(p.value/1000).toFixed(1)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── component: KPI Card ─── */
function KpiCard({ item, delay }) {
  const [count, setCount] = useState(0)
  const numericValue = parseFloat(item.value.replace(/[^0-9.]/g, ''))

  useEffect(() => {
    const steps = 40
    const increment = numericValue / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, numericValue)
      setCount(current)
      if (current >= numericValue) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [numericValue])

  const displayValue = item.value.startsWith('$')
    ? `$${count > 1000 ? (count/1000).toFixed(1) + 'k' : count.toFixed(0)}`
    : item.value.includes('%')
    ? `${count.toFixed(2)}%`
    : Math.floor(count).toLocaleString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="card card-hover p-5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-50"
        style={{ background: item.color, transform: 'translate(30%,-30%)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
          <item.icon size={18} style={{ color: item.color }} />
        </div>
        <span className={`badge ${item.up ? 'badge-green' : 'badge-red'}`}>
          {item.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {item.delta}
        </span>
      </div>
      <p className="font-medium text-2xl text-white mb-1 font-mono tracking-tight">{displayValue}</p>
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{item.label}</p>
      <p className="text-zinc-600 text-xs mt-0.5">{item.sub}</p>
    </motion.div>
  )
}

/* ─── main ─── */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [notifOpen, setNotifOpen] = useState(false)
  const [chartPeriod, setChartPeriod] = useState('12M')
  const [loading, setLoading] = useState(false)

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  const statusBadge = (s) => {
    const map = { paid: 'badge-green', processing: 'badge-blue', failed: 'badge-red' }
    return <span className={map[s] || 'badge-blue'}>{s}</span>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* ── SIDEBAR ── */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-20 lg:hidden" />
          )}
        </AnimatePresence>

        <aside className={`fixed lg:relative z-30 flex flex-col w-60 h-full sidebar-gradient border-r border-white/[0.05]
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' }}>
                <Zap size={15} className="text-white" />
              </div>
              <span className="font-semibold text-white text-sm">Nexus</span>
              <span className="badge badge-blue ml-1">v2</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-500 hover:text-white"><X size={16} /></button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
            <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase px-3 mb-2">Main</p>
            {navItems.slice(0, 5).map(item => (
              <div key={item.label} onClick={() => { setActiveNav(item.label); setSidebarOpen(false) }}
                className={`nav-item ${activeNav === item.label ? 'active' : ''}`}>
                <item.icon size={16} />
                {item.label}
                {item.label === 'Orders' && <span className="ml-auto badge badge-amber">12</span>}
              </div>
            ))}
            <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase px-3 mt-4 mb-2">Growth</p>
            {navItems.slice(5).map(item => (
              <div key={item.label} onClick={() => { setActiveNav(item.label); setSidebarOpen(false) }}
                className={`nav-item ${activeNav === item.label ? 'active' : ''}`}>
                <item.icon size={16} />
                {item.label}
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' }}>AK</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">Alex Floch</p>
                <p className="text-[10px] text-zinc-500 truncate">Admin</p>
              </div>
              <ChevronDown size={13} className="text-zinc-600" />
            </div>
          </div>
        </aside>
      </>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-white/[0.05] bg-zinc-950/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-500 hover:text-white p-1">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-semibold text-white text-sm">{activeNav}</h1>
              <p className="text-zinc-500 text-xs">Tuesday, 15 October 2024</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 w-52">
              <Search size={13} className="text-zinc-500" />
              <input placeholder="Search..." className="bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none w-full" />
              <kbd className="text-[9px] font-mono text-zinc-600 border border-white/10 rounded px-1 py-0.5">⌘K</kbd>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 card border border-white/8 shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      <button onClick={() => setNotifOpen(false)} className="text-zinc-500 hover:text-white"><X size={13} /></button>
                    </div>
                    {notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.025] transition-colors border-b border-white/[0.04] cursor-pointer">
                        <n.icon size={14} className={`${n.color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white">{n.title}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-zinc-600 flex-shrink-0">{n.time}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
              <Settings size={17} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Action bar */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Welcome back, Alex 👋</p>
                <p className="text-xs text-zinc-600">Here's what's happening with your business today.</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={refreshData} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8 text-zinc-400 hover:text-white hover:border-white/20 text-xs transition-all">
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs transition-colors">
                  <Download size={13} />
                  Export
                </motion.button>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {kpis.map((k, i) => <KpiCard key={k.label} item={k} delay={i * 0.07} />)}
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Revenue area chart */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="lg:col-span-2 card p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Revenue Overview</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">Monthly revenue vs profit</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/4 rounded-lg p-1">
                    {['3M','6M','12M'].map(p => (
                      <button key={p} onClick={() => setChartPeriod(p)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${chartPeriod === p ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData.slice(chartPeriod === '3M' ? 9 : chartPeriod === '6M' ? 6 : 0)}>
                    <defs>
                      <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="transparent" tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'mono' }} />
                    <YAxis stroke="transparent" tick={{ fill: '#52525b', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#gRevenue)" dot={false} />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} fill="url(#gProfit)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Traffic bar chart */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                className="card p-5">
                <div className="mb-5">
                  <h3 className="font-semibold text-white text-sm">Traffic Sources</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">This week by channel</p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trafficData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" stroke="transparent" tick={{ fill: '#52525b', fontSize: 10 }} />
                    <YAxis stroke="transparent" tick={{ fill: '#52525b', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="organic" name="Organic" fill="#3B82F6" radius={[4,4,0,0]} maxBarSize={12} />
                    <Bar dataKey="paid" name="Paid" fill="#8B5CF6" radius={[4,4,0,0]} maxBarSize={12} />
                    <Bar dataKey="referral" name="Referral" fill="#10B981" radius={[4,4,0,0]} maxBarSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Activity + top products */}
            <div className="grid lg:grid-cols-5 gap-5">
              {/* Realtime activity */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="lg:col-span-2 card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
                  <h3 className="font-semibold text-white text-sm">Real-time Activity</h3>
                  <span className="ml-auto badge badge-green">Live</span>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={activityData}>
                    <XAxis dataKey="hour" stroke="transparent" tick={{ fill: '#52525b', fontSize: 9 }} interval={5} />
                    <YAxis stroke="transparent" tick={{ fill: '#52525b', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="users" name="Active users" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.05]">
                  {[['847', 'Online now'],['3.2m', 'Avg. session'],['4.1%', 'Bounce rate']].map(([v,l]) => (
                    <div key={l} className="text-center">
                      <p className="font-mono font-bold text-base text-white">{v}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top products */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
                className="lg:col-span-3 card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white text-sm">Top Products</h3>
                  <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                    View all <ArrowUpRight size={11} />
                  </button>
                </div>
                <div className="space-y-1">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.025] transition-colors group cursor-pointer">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: ['rgba(59,130,246,0.15)','rgba(139,92,246,0.15)','rgba(16,185,129,0.15)','rgba(245,158,11,0.15)','rgba(236,72,153,0.15)'][i],
                          color: ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EC4899'][i] }}>
                        {i+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-zinc-500">{p.sales.toLocaleString()} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold text-white">{p.revenue}</p>
                        <p className={`text-[10px] font-mono ${p.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {p.growth > 0 ? '+' : ''}{p.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Orders table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
              className="card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                <div>
                  <h3 className="font-semibold text-white text-sm">Recent Orders</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Latest 6 transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/8 text-zinc-400 hover:text-white text-xs transition-all">
                    <Filter size={12} /> Filter
                  </button>
                  <button className="p-1.5 rounded-xl border border-white/8 text-zinc-400 hover:text-white transition-all">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {['Order', 'Customer', 'Product', 'Amount', 'Status', 'Time'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-mono text-zinc-600 tracking-widest uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="table-row cursor-pointer">
                        <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">{o.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' }}>{o.avatar}</div>
                            <span className="text-zinc-200 text-xs font-medium">{o.customer}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-400">{o.product}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-white font-semibold">{o.amount}</td>
                        <td className="px-5 py-3.5">{statusBadge(o.status)}</td>
                        <td className="px-5 py-3.5 text-xs text-zinc-600 flex items-center gap-1 mt-3.5">
                          <Clock size={10} /> {o.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  )
}
