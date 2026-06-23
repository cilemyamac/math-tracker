import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { TopicMasteryPoint } from '@/lib/types'

interface Props {
  data: TopicMasteryPoint[]
}

interface TooltipPayloadItem {
  value?: number
  payload?: { topic: string }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground">
        {payload[0].payload?.topic}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value?.toFixed(0)}%
      </p>
    </div>
  )
}

export function TopicMasteryChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No mastery data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
        />
        <Tooltip content={(props) => <CustomTooltip {...(props as unknown as CustomTooltipProps)} />} />
        <Radar
          dataKey="mastery"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
