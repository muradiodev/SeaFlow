import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface KpiChartProps {
  data: any[];
  type: 'line' | 'pie' | 'bar';
  title?: string;
  dataKey?: string;
  nameKey?: string;
}

const COLORS = ['#0F4C81', '#16A085', '#2ECC71', '#FF6B35', '#FF8A65'];

export function KpiChart({ data, type, title, dataKey = 'value', nameKey = 'name' }: KpiChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data}>
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#0F4C81" 
              strokeWidth={2}
              dot={{ fill: '#0F4C81', strokeWidth: 2 }}
            />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={data}>
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#16A085" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
