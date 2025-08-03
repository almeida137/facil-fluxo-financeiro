import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import Dashboard from './Dashboard';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Dashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
