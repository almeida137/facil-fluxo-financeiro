import { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const Income = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
                <p className="text-muted-foreground">Gerencie suas receitas e entradas</p>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Receita
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <TransactionForm 
                    type="income" 
                    onSuccess={() => setIsFormOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <TransactionList type="income" />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Income;