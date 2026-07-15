import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface ChartData {
  name: string;
  value: number;
}

export function PieChartWidget({ data, title }: { data: ChartData[]; title?: string }) {
  if (!data.length) return <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No data</div>;
  return (
    <div>
      {title && <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{title}</h4>}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartWidget({ data, title, dataKey = 'value' }: { data: Record<string, unknown>[]; title?: string; dataKey?: string }) {
  if (!data.length) return <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No data</div>;
  return (
    <div>
      {title && <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{title}</h4>}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
          <Bar dataKey={dataKey} fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChartWidget({ data, title, lines }: { data: Record<string, unknown>[]; title?: string; lines: { key: string; color: string; name: string }[] }) {
  if (!data.length) return <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No data</div>;
  return (
    <div>
      {title && <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{title}</h4>}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
          <Legend />
          {lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} name={l.name} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
