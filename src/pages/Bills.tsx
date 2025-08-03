import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Bills() {
  const { user } = useAuth();
  const { transactions, isLoading, updateTransaction } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter for upcoming bills (unpaid transactions with due dates)
  const upcomingBills = transactions.filter(t => 
    !t.is_paid && 
    t.due_date && 
    new Date(t.due_date) >= new Date()
  ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Filter for overdue bills
  const overdueBills = transactions.filter(t => 
    !t.is_paid && 
    t.due_date && 
    new Date(t.due_date) < new Date()
  ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Filter for paid bills this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const paidBillsThisMonth = transactions.filter(t => 
    t.is_paid && 
    t.transaction_date.startsWith(currentMonth)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleMarkAsPaid = async (transactionId: string) => {
    await updateTransaction.mutateAsync({
      id: transactionId,
      data: {
        is_paid: true,
        transaction_date: new Date().toISOString().slice(0, 10)
      }
    });
  };

  const getDaysDifference = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas fixas e variáveis
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Conta</DialogTitle>
            </DialogHeader>
            <TransactionForm type="expense" onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <Clock className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{overdueBills.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overdueBills.reduce((sum, bill) => sum + Number(bill.amount), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Contas</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{upcomingBills.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(upcomingBills.reduce((sum, bill) => sum + Number(bill.amount), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas Este Mês</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{paidBillsThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paidBillsThisMonth.reduce((sum, bill) => sum + Number(bill.amount), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Bills */}
      {overdueBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-danger">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bill.description || 'Sem descrição'}</span>
                      <Badge variant="destructive">Vencida</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vencimento: {formatDate(bill.due_date!)} • {formatCurrency(Number(bill.amount))}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleMarkAsPaid(bill.id)}
                    className="ml-4"
                  >
                    Marcar como Pago
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Contas</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBills.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma conta a vencer nos próximos dias
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingBills.map((bill) => {
                const daysLeft = getDaysDifference(bill.due_date!);
                return (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bill.description || 'Sem descrição'}</span>
                        <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"}>
                          {daysLeft === 0 ? 'Hoje' : daysLeft === 1 ? 'Amanhã' : `${daysLeft} dias`}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vencimento: {formatDate(bill.due_date!)} • {formatCurrency(Number(bill.amount))}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAsPaid(bill.id)}
                      className="ml-4"
                    >
                      Marcar como Pago
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}