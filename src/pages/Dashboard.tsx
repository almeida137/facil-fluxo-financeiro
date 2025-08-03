import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  upcomingBills: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    upcomingBills: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    try {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

      // Fetch current month income
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('type', 'income')
        .eq('is_paid', true)
        .gte('transaction_date', `${currentMonth}-01`)
        .lt('transaction_date', nextMonth);

      if (incomeError) throw incomeError;

      // Fetch current month expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('type', 'expense')
        .eq('is_paid', true)
        .gte('transaction_date', `${currentMonth}-01`)
        .lt('transaction_date', nextMonth);

      if (expenseError) throw expenseError;

      // Fetch upcoming bills (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: billsData, error: billsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('is_paid', false)
        .gte('due_date', new Date().toISOString().slice(0, 10))
        .lte('due_date', nextWeek.toISOString().slice(0, 10));

      if (billsError) throw billsError;

      const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const upcomingBills = billsData?.length || 0;

      setData({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        upcomingBills,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças pessoais
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(data.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total recebido este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">
              {formatCurrency(data.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total gasto este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.balance >= 0 ? 'text-success' : 'text-danger'
            }`}>
              {formatCurrency(data.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Vencer</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {data.upcomingBills}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Adicionar Receita
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <TrendingDown className="h-4 w-4 text-danger" />
              Adicionar Despesa
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Calendar className="h-4 w-4 text-warning" />
              Cadastrar Conta Fixa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de Economia</span>
                <span className="text-sm font-medium">
                  {data.totalIncome > 0 
                    ? `${((data.balance / data.totalIncome) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.balance >= 0 ? 'bg-success' : 'bg-danger'
                  }`}
                  style={{ 
                    width: data.totalIncome > 0 
                      ? `${Math.min(Math.abs((data.balance / data.totalIncome) * 100), 100)}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.balance >= 0 
                  ? 'Você está poupando dinheiro este mês!'
                  : 'Cuidado! Suas despesas estão maiores que as receitas.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}