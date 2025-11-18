import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Account, getTotalByCurrency, getTotalInBase, getTotalByLocation, formatCurrency } from "@web-project/types/accounts"
import { Wallet, MapPin, Globe, Coins } from "lucide-react"

interface AccountsStatsProps {
  accounts: Account[]
}

/** Tarjetas de resumen de cuentas (totales por moneda y ubicación). */
export function AccountsStats({ accounts }: AccountsStatsProps) {
  const totalsByCurrency = getTotalByCurrency(accounts)
  const totalInBase = getTotalInBase(accounts)
  const { national, foreign } = getTotalByLocation(accounts)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total en Pesos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total en Pesos
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalInBase.toLocaleString('es-ES')}
          </div>
          <p className="text-xs text-muted-foreground">
            Todas las cuentas convertidas
          </p>
        </CardContent>
      </Card>

      {/* Cuentas Nacionales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cuentas Nacionales
          </CardTitle>
          <MapPin className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ${national.toLocaleString('es-ES')}
          </div>
          <p className="text-xs text-muted-foreground">
            En bancos locales
          </p>
        </CardContent>
      </Card>

      {/* Cuentas Extranjeras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cuentas Extranjeras
          </CardTitle>
          <Globe className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            ${foreign.toLocaleString('es-ES')}
          </div>
          <p className="text-xs text-muted-foreground">
            En bancos del exterior
          </p>
        </CardContent>
      </Card>

      {/* Desglose por Monedas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monedas
          </CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(totalsByCurrency).slice(0, 3).map(([currency, amount]) => (
              <div key={currency} className="flex justify-between text-sm">
                <span className="font-medium">{currency}:</span>
                <span>{formatCurrency(amount, currency)}</span>
              </div>
            ))}
            {Object.keys(totalsByCurrency).length > 3 && (
              <p className="text-xs text-muted-foreground pt-1">
                +{Object.keys(totalsByCurrency).length - 3} más
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
