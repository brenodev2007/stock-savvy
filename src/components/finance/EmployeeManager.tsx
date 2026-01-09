import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/contexts/FinanceContext";
import { Plus, Trash, UserPlus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function EmployeeManager() {
  const { employees, addEmployee, removeEmployee } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    salary: "",
    hireDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.salary) return;

    addEmployee({
      name: formData.name,
      role: formData.role || "Funcionário",
      salary: parseFloat(formData.salary),
      hireDate: formData.hireDate
    });

    setFormData({
      name: "",
      role: "",
      salary: "",
      hireDate: new Date().toISOString().split('T')[0]
    });
    setIsOpen(false);
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
             <CardTitle className="text-sm font-medium">Equipe Ativa</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
             <CardTitle className="text-sm font-medium">Folha de Pagamento Mensal</CardTitle>
             <Badge variant="secondary" className="font-mono">Custo Fixo</Badge>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-red-600">
               - {formatCurrency(totalPayroll)}
             </div>
             <p className="text-xs text-muted-foreground">Impacta diretamente o lucro líquido</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestão de Funcionários & Comissões</CardTitle>
            <CardDescription>Gerencie sua equipe e salários para cálculo preciso de lucro.</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
                <DialogDescription>
                  Preencha os dados do funcionário. O salário será deduzido como custo fixo no dashboard.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                 <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="grid gap-2">
                      <Label htmlFor="role">Cargo / Função</Label>
                      <Input 
                        id="role" 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        placeholder="Ex: Vendedor"
                      />
                   </div>
                   <div className="grid gap-2">
                      <Label htmlFor="salary">Salário Mensal (R$)</Label>
                      <Input 
                        id="salary" 
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                        required
                      />
                   </div>
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="date">Data de Admissão</Label>
                    <Input 
                        id="date" 
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      />
                 </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                 </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                <Users className="h-12 w-12 mb-2 opacity-50" />
                <p>Nenhum funcionário cadastrado.</p>
             </div>
          ) : (
             <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Nome</TableHead>
                     <TableHead>Cargo</TableHead>
                     <TableHead>Data Admissão</TableHead>
                     <TableHead className="text-right">Salário</TableHead>
                     <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {employees.map((emp) => (
                      <TableRow key={emp.id}>
                         <TableCell className="font-medium">{emp.name}</TableCell>
                         <TableCell>{emp.role}</TableCell>
                         <TableCell>{new Date(emp.hireDate).toLocaleDateString('pt-BR')}</TableCell>
                         <TableCell className="text-right">{formatCurrency(emp.salary)}</TableCell>
                         <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeEmployee(emp.id)}
                            >
                               <Trash className="h-4 w-4" />
                            </Button>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
