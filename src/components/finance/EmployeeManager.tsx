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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 p-3 sm:p-6">
             <CardTitle className="text-xs sm:text-sm font-medium">Equipe Ativa</CardTitle>
             <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
             <div className="text-xl sm:text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 p-3 sm:p-6">
             <CardTitle className="text-xs sm:text-sm font-medium">Folha Mensal</CardTitle>
             <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs hidden sm:inline-flex">Custo Fixo</Badge>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
             <div className="text-lg sm:text-2xl font-bold text-red-600">
               - {formatCurrency(totalPayroll)}
             </div>
             <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Impacta diretamente o lucro líquido</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-6">
          <div>
            <CardTitle className="text-sm sm:text-base">Gestão de Funcionários</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Gerencie sua equipe e salários.</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Funcionário</span>
                <span className="sm:hidden">Adicionar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Adicionar Membro da Equipe</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Preencha os dados do funcionário. O salário será deduzido como custo fixo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                 <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="text-sm"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3 sm:gap-4">
                   <div className="grid gap-1.5 sm:gap-2">
                      <Label htmlFor="role" className="text-xs sm:text-sm">Cargo</Label>
                      <Input 
                        id="role" 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        placeholder="Ex: Vendedor"
                        className="text-sm"
                      />
                   </div>
                   <div className="grid gap-1.5 sm:gap-2">
                      <Label htmlFor="salary" className="text-xs sm:text-sm">Salário (R$)</Label>
                      <Input 
                        id="salary" 
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                        required
                        className="text-sm"
                      />
                   </div>
                 </div>
                 <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="date" className="text-xs sm:text-sm">Data de Admissão</Label>
                    <Input 
                        id="date" 
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                        className="text-sm"
                      />
                 </div>
                 <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1 sm:flex-none">Cancelar</Button>
                    <Button type="submit" className="flex-1 sm:flex-none">Salvar</Button>
                 </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          {employees.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">Nenhum funcionário cadastrado.</p>
             </div>
          ) : (
             <div className="overflow-x-auto -mx-3 sm:mx-0">
               <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead className="text-xs sm:text-sm">Nome</TableHead>
                       <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Cargo</TableHead>
                       <TableHead className="text-xs sm:text-sm hidden md:table-cell">Admissão</TableHead>
                       <TableHead className="text-right text-xs sm:text-sm">Salário</TableHead>
                       <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {employees.map((emp) => (
                        <TableRow key={emp.id}>
                           <TableCell className="font-medium text-xs sm:text-sm">
                             <div>{emp.name}</div>
                             <div className="text-[10px] text-muted-foreground sm:hidden">{emp.role}</div>
                           </TableCell>
                           <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{emp.role}</TableCell>
                           <TableCell className="text-xs sm:text-sm hidden md:table-cell">{new Date(emp.hireDate).toLocaleDateString('pt-BR')}</TableCell>
                           <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(emp.salary)}</TableCell>
                           <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                onClick={() => removeEmployee(emp.id)}
                              >
                                 <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
