import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Warehouse, Tags, Package, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';

interface SetupGuideProps {
  hasWarehouses: boolean;
  hasProducts: boolean;
  hasMovements: boolean;
}

export function SetupGuide({ hasWarehouses, hasProducts, hasMovements }: SetupGuideProps) {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const hasCategories = (categories?.length || 0) > 0;

  // If all steps are completed, don't return null, maybe show "All set!" or just collapse.
  // The user asked for a "Manual", so it should probably stay visible or be dismissible.
  // For now I'll always show it if any step is incomplete, or show a success state.
  
  const allCompleted = hasWarehouses && hasCategories && hasProducts && hasMovements;

  if (allCompleted) return null; // Or return a "Good job" card

  const steps = [
    {
      id: 'warehouse',
      title: '1. Cadastrar Depósito',
      description: 'Primeiro, crie um local para armazenar seus produtos (Ex: Loja Física, Depósito Principal).',
      icon: Warehouse,
      completed: hasWarehouses,
      action: () => navigate('/warehouses'),
      btnText: 'Ir para Depósitos'
    },
    {
      id: 'category',
      title: '2. Cadastrar Categoria',
      description: 'Organize seus produtos em categorias (Ex: Eletrônicos, Roupas).',
      icon: Tags,
      completed: hasCategories,
      action: () => navigate('/products?tab=categories'),
      btnText: 'Ir para Categorias'
    },
    {
      id: 'product',
      title: '3. Cadastrar Produto',
      description: 'Agora você pode cadastrar seus produtos e vinculá-los a categorias e fornecedores.',
      icon: Package,
      completed: hasProducts,
      action: () => navigate('/products'),
      btnText: 'Ir para Produtos'
    },
    {
      id: 'movement',
      title: '4. Registrar Entrada',
      description: 'Por fim, registre a entrada de estoque para atualizar as quantidades disponíveis.',
      icon: ArrowLeftRight,
      completed: hasMovements,
      action: () => navigate('/movements'),
      btnText: 'Registrar Entrada'
    }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Guia de Configuração Inicial
        </CardTitle>
        <CardDescription>
          Siga estes passos para configurar seu estoque corretamente e evitar erros.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={cn(
              "flex flex-col p-4 rounded-lg border bg-card transition-colors",
              step.completed ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10" : "border-muted"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-full", step.completed ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" : "bg-primary/10 text-primary")}>
                <step.icon className="h-5 w-5" />
              </div>
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <h3 className={cn("font-medium mb-1", step.completed && "text-green-700 dark:text-green-400")}>{step.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 flex-1">
              {step.description}
            </p>
            <Button 
              variant={step.completed ? "ghost" : "default"} 
              size="sm" 
              className={cn("w-full gap-2", step.completed && "hidden")}
              onClick={step.action}
            >
              {step.btnText}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
