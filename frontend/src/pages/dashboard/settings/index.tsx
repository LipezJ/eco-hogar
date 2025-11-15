import { Suspense, useMemo, useState, useEffect } from "react";
import { z } from "zod/v4";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form as FormProvider, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatsLoadingSkeleton } from "@/components/loading-skeleton";
import { useSuspenseQueryFetch } from "@/hooks/user-query-fetch";
import { API_ENDPOINTS } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { BudgetUpsertSchema } from "@web-project/types/budget";
import type { BudgetSummaryResponse } from "@web-project/types/budget";
import { Currency, formatCurrency } from "@web-project/types/accounts";
import { Calendar, ChevronLeft, ChevronRight, CreditCard, PiggyBank, Receipt, Wallet } from "lucide-react";

const BudgetFormSchema = BudgetUpsertSchema.pick({ amount: true, currency: true });
type BudgetFormValues = z.input<typeof BudgetFormSchema>;

const currencyOptions = Currency.options;

const getMonthInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const parseMonthValue = (value: string) => {
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const now = new Date();
  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
  };
};

const formatMonthLabel = (year: number, month: number) => {
  const formatter = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
  return formatter.format(new Date(year, month - 1, 1));
};

function MonthSelector({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const { year, month } = parseMonthValue(value);
  const label = formatMonthLabel(year, month);

  const stepMonth = (delta: number) => {
    const nextDate = new Date(year, month - 1 + delta, 1);
    onChange(getMonthInputValue(nextDate));
  };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">Mes configurado</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold capitalize">{label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => stepMonth(-1)} aria-label="Mes anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="month"
            value={value}
            onChange={(event) => {
              if (event.target.value) {
                onChange(event.target.value);
              }
            }}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={() => stepMonth(1)} aria-label="Mes siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetSummaryCard({ data }: { data: BudgetSummaryResponse }) {
  const currency = data.config?.currency ?? "COP";
  const { overall, year, month } = data.summary;

  const limit = overall.limit;
  const used = overall.used;
  const remaining = overall.remaining;
  const usage = overall.usagePercentage;
  const remainingLabel = formatCurrency(Math.max(remaining, 0), currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del presupuesto</CardTitle>
        <CardDescription className="capitalize">{formatMonthLabel(year, month)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total disponible</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-semibold">{formatCurrency(used, currency)}</span>
            <span className="text-sm text-muted-foreground">
              gastado de {formatCurrency(limit, currency)}
            </span>
          </div>
        </div>
        <Progress value={Math.min(usage, 100)} className="h-2" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Restante</p>
            <p className={cn("font-medium", remaining < 0 && "text-destructive")}>
              {remaining < 0 ? `-${formatCurrency(Math.abs(remaining), currency)}` : remainingLabel}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Uso</p>
            <p className="font-medium">{usage.toFixed(1)}%</p>
          </div>
        </div>
        {limit === 0 && (
          <p className="text-xs text-muted-foreground">
            Aún no definiste un presupuesto para este mes. Configura un monto para activar el seguimiento.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetBreakdownCard({ data }: { data: BudgetSummaryResponse }) {
  const currency = data.config?.currency ?? "COP";
  const { totals, year, month } = data.summary;
  const monthLabel = formatMonthLabel(year, month);

  const items = [
    {
      label: "Movimientos",
      value: totals.movements.expenses,
      icon: Wallet,
      meta: `${formatCurrency(totals.movements.income, currency)} en ingresos`,
    },
    {
      label: "Pagos de deudas",
      value: totals.debts.payments,
      icon: CreditCard,
      meta:
        totals.debts.payments === 0
          ? "Sin pagos confirmados"
          : "Pagos registrados con fecha dentro del mes",
    },
    {
      label: "Recibos",
      value: totals.bills.total,
      icon: Receipt,
      meta: `${formatCurrency(totals.bills.paid, currency)} pagado / ${formatCurrency(
        totals.bills.pending,
        currency,
      )} pendiente`,
    },
    {
      label: "CDTs",
      value: totals.cdts.invested,
      icon: PiggyBank,
      meta:
        totals.cdts.invested === 0
          ? "Sin nuevas aperturas"
          : "Inversiones creadas dentro del mes",
    },
  ];

  const hasData = items.some((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose mensual</CardTitle>
        <CardDescription>Impacto registrado durante {monthLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay movimientos que impacten el presupuesto en este mes. Registra movimientos,
            pagos, recibos o CDTs para ver el detalle.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(({ label, value, icon: Icon, meta }) => (
              <div key={label} className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{formatCurrency(value, currency)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{meta}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetForm({ data, month, year }: { data: BudgetSummaryResponse; month: number; year: number }) {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const currency = data.config?.currency ?? "COP";
  const amountValue = useMemo(() => Number(data.config?.amount ?? 0), [data.config?.amount]);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(BudgetFormSchema) as Resolver<BudgetFormValues>,
    defaultValues: {
      amount: amountValue,
      currency,
    },
  });

  useEffect(() => {
    form.reset({
      amount: amountValue,
      currency,
    });
  }, [amountValue, currency, form]);

  const mutation = useMutation({
    mutationFn: async (values: BudgetFormValues) => {
      const response = await fetch(API_ENDPOINTS.budget, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          month,
          year,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "No se pudo guardar el presupuesto");
      }

      return (await response.json()) as BudgetSummaryResponse;
    },
    onSuccess: () => {
      setStatusMessage("Presupuesto actualizado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
    onError: (error: Error) => {
      setStatusMessage(error.message);
    },
  });

  const onSubmit: SubmitHandler<BudgetFormValues> = (values) => {
    setStatusMessage(null);
    mutation.mutate(values);
  };

  const monthLabel = formatMonthLabel(year, month);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar presupuesto</CardTitle>
        <CardDescription>Este monto aplica para {monthLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto mensual</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Los movimientos, pagos de deuda, CDTs y recibos registrados dentro del mes afectarán este
              presupuesto automáticamente.
            </div>

            {statusMessage && (
              <p className={cn("text-sm", mutation.isError ? "text-destructive" : "text-muted-foreground")}>
                {statusMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar presupuesto"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

function BudgetSettingsContent({ selectedMonth }: { selectedMonth: string }) {
  const { year, month } = parseMonthValue(selectedMonth);
  const { data } = useSuspenseQueryFetch<BudgetSummaryResponse>({
    url: API_ENDPOINTS.budget,
    queryKey: ["budget", year, month],
    params: { month: String(month), year: String(year) },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetSummaryCard data={data} />
        <BudgetForm data={data} month={month} year={year} />
      </div>
      <BudgetBreakdownCard data={data} />
    </div>
  );
}

export default function SettingsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthInputValue(new Date()));

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        <SiteHeader title="Configuraciones" />
        <section className="container mx-auto space-y-6 px-4 py-6">
          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-2xl font-semibold">Presupuesto mensual</h2>
              <p className="text-sm text-muted-foreground">
                Define un monto y haz seguimiento del consumo agregado de tus movimientos, pagos, recibos y CDTs.
              </p>
            </div>
          </div>
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          <Suspense fallback={<StatsLoadingSkeleton />}>
            <BudgetSettingsContent selectedMonth={selectedMonth} />
          </Suspense>
        </section>
      </div>
    </DashboardLayout>
  );
}
