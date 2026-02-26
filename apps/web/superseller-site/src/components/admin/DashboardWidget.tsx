import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface DashboardWidgetProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: LucideIcon
  color: string
  bgColor: string
  trend?: "up" | "down" | "neutral"
  period?: string
}

export default function DashboardWidget({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  bgColor,
  trend = "neutral",
  period,
}: DashboardWidgetProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-emerald-600" />
      case "down":
        return <ArrowDownRight className="h-4 w-4 style={{ color: 'var(--superseller-red)' }}" />
      default:
        return <Minus className="h-4 w-4 text-slate-400" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-emerald-600"
      case "negative":
        return "style={{ color: 'var(--superseller-red)' }}"
      default:
        return "text-slate-600"
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
          </div>
        </div>
        
        <div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
          {period && (
            <p className="text-xs text-slate-500">{period}</p>
          )}
        </div>
      </div>
    </div>
  )
}
