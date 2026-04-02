'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatTHB, formatDate } from '@/lib/utils'
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'

interface ReportData {
  monthly: { month: string; income: number; count: number }[]
  osBreakdown: { name: string; value: number; amount: number }[]
  recentRedeems: { id: string; owner: string; model: string; os: string; amount: number; interest: number; total: number; redeemedAt: string; staffName: string }[]
  summary: { totalRedeemed: number; totalInterest: number; totalDevices: number; avgInterest: number; topModel: string }
}

const CHART_COLORS = ['#e8a800', '#4da6ff', '#4caf78', '#ff7043', '#a78bfa']

const TooltipStyle = {
  contentStyle: { background: '#1e1b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e8e4dc', fontSize: '12px' },
  labelStyle: { color: '#b3aa97', fontWeight: 600 },
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/report?months=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [period])

  if (loading) return (
    <div className="space-y-6">
      <div className="page-enter"><h2 className="text-display text-3xl font-bold text-amber-100">รายงานและสถิติ</h2></div>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28 skeleton" />)}</div>
      <div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="glass-card h-64 skeleton" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between page-enter">
        <div>
          <h2 className="text-display text-3xl font-bold text-amber-100">รายงานและสถิติ</h2>
          <p className="text-ink-500 text-sm mt-1">วิเคราะห์รายได้และแนวโน้มการจำนำ</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl text-ink-300 focus:outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', colorScheme: 'dark' }}>
          <option value="3">3 เดือน</option>
          <option value="6">6 เดือน</option>
          <option value="12">12 เดือน</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 page-enter stagger-1">
        {[
          { label: 'รายได้ดอกเบี้ยรวม', value: `${formatTHB(data?.summary.totalInterest ?? 0)} ฿`, icon: '💰', color: '#e8a800' },
          { label: 'จำนวนที่ไถ่ถอนแล้ว', value: `${data?.summary.totalRedeemed ?? 0} เครื่อง`, icon: '✅', color: '#4caf78' },
          { label: 'ดอกเบี้ยเฉลี่ย/เครื่อง', value: `${formatTHB(data?.summary.avgInterest ?? 0)} ฿`, icon: '📊', color: '#4da6ff' },
          { label: 'รุ่นยอดนิยม', value: data?.summary.topModel ?? '-', icon: '🏆', color: '#ff7043' },
        ].map((c, i) => (
          <div key={i} className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: c.color }} />
            <p className="text-xs text-ink-600 uppercase tracking-wider mb-2">{c.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-mono font-bold text-xl" style={{ color: c.color }}>{c.value}</p>
              <span className="text-2xl">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 page-enter stagger-2">
        {/* Monthly income area chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-ink-300 mb-5">📈 รายได้รายเดือน (บาท)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.monthly ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8a800" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e8a800" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#625948', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#625948', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TooltipStyle} formatter={(v: number) => [`${formatTHB(v)} ฿`, 'รายได้']} />
              <Area type="monotone" dataKey="income" stroke="#e8a800" strokeWidth={2} fill="url(#goldGrad)" dot={{ fill: '#e8a800', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* OS Pie */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-ink-300 mb-5">🍎🤖 สัดส่วนระบบ</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={data?.osBreakdown ?? []} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                   dataKey="value" nameKey="name" paddingAngle={3}>
                {(data?.osBreakdown ?? []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TooltipStyle} formatter={(v: number, n: string) => [`${v} เครื่อง`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {(data?.osBreakdown ?? []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-ink-400">{item.name}</span>
                </div>
                <span className="text-mono text-ink-300">{item.value} เครื่อง</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly count bar chart */}
      <div className="glass-card p-5 page-enter stagger-3">
        <h3 className="text-sm font-semibold text-ink-300 mb-5">📦 จำนวนที่ไถ่ถอนรายเดือน (เครื่อง)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data?.monthly ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#625948', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#625948', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...TooltipStyle} formatter={(v: number) => [`${v} เครื่อง`, 'จำนวน']} />
            <Bar dataKey="count" fill="#4da6ff" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent redeems table */}
      <div className="page-enter stagger-4">
        <h3 className="text-display font-semibold text-amber-100 text-lg mb-4">ประวัติการไถ่ถอน</h3>
        <Table>
          <THead>
            <tr><Th>วันที่</Th><Th>รหัส</Th><Th>เจ้าของ</Th><Th>รุ่น</Th><Th>วงเงิน</Th><Th>ดอกเบี้ย</Th><Th>รวม</Th><Th>พนักงาน</Th></tr>
          </THead>
          <TBody>
            {(!data?.recentRedeems?.length) && <EmptyRow cols={8} message="ยังไม่มีประวัติการไถ่ถอน" />}
            {(data?.recentRedeems ?? []).map(r => (
              <Tr key={r.id}>
                <Td><span className="text-xs text-ink-500">{formatDate(r.redeemedAt)}</span></Td>
                <Td><span className="text-mono text-xs text-gold-500">{r.id}</span></Td>
                <Td><span className="font-medium text-ink-200">{r.owner}</span></Td>
                <Td><Badge variant={r.os === 'iOS' ? 'ios' : 'android'} label={r.model} /></Td>
                <Td><span className="text-mono text-ink-300">{formatTHB(r.amount)} ฿</span></Td>
                <Td><span className="text-mono text-amber-400">{formatTHB(r.interest)} ฿</span></Td>
                <Td><span className="text-mono text-emerald-400 font-bold">{formatTHB(r.total)} ฿</span></Td>
                <Td><span className="text-xs text-ink-500">{r.staffName || '-'}</span></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
