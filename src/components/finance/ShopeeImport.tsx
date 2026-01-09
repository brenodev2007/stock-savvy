import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Save } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFinance, Transaction } from "@/contexts/FinanceContext";
import { toast } from "sonner";

interface ShopeeTransaction {
  orderId: string;
  status: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
}

export function ShopeeImport() {
  const { addTransactions } = useFinance();
  const [transactions, setTransactions] = useState<ShopeeTransaction[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Simple mapping logic - adaptable to real Shopee columns later
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData: ShopeeTransaction[] = data.map((row: any, index) => ({
          // Try to find common column names or fallback to generic
          orderId: row["ID do Pedido"] || row["Order ID"] || `ORD-${index}`,
          status: row["Status"] || row["Order Status"] || "Concluído",
          amount: parseFloat(row["Valor Original"] || row["Total Amount"] || "0"),
          commission: parseFloat(row["Taxa de Comissão"] || "0"),
          netAmount: parseFloat(row["Valor Líquido"] || row["Escrow Amount"] || "0"),
          date: row["Data"] || new Date().toLocaleDateString('en-CA'),
        })).slice(0, 50); // Increased limit for better testing

        setTransactions(mappedData);
      } catch (err) {
        console.error("Error parsing file", err);
        setError("Erro ao processar arquivo. Verifique se é um planilha válida.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveToDashboard = () => {
    if (transactions.length === 0) return;

    const newTransactions: Transaction[] = transactions.map(t => ({
      id: t.orderId,
      date: t.date,
      amount: t.netAmount,
      type: 'income',
      category: 'Venda Shopee',
      status: t.status,
      description: `Pedido ${t.orderId}`
    }));

    addTransactions(newTransactions);
    toast.success(`${newTransactions.length} transações importadas com sucesso!`);
    setTransactions([]);
    setFileName(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Relatórios da Shopee
          </CardTitle>
          <CardDescription>
            Faça upload dos arquivos .xlsx ou .csv exportados da Central do Vendedor para conciliação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
            <Label htmlFor="shopee-file">Arquivo de Transações</Label>
            <Input id="shopee-file" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {fileName && !error && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex justify-between items-center w-full">
                <div>
                    <AlertTitle className="text-green-800">Arquivo Carregado</AlertTitle>
                    <AlertDescription className="text-green-700">
                    Leitura de {transactions.length} registros com sucesso.
                    </AlertDescription>
                </div>
                <Button onClick={handleSaveToDashboard} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Save className="h-4 w-4" />
                    Confirmar Importação
                </Button>
              </div>
            </Alert>
          )}

          {transactions.length > 0 && (
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Venda</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{tx.orderId}</TableCell>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>{tx.status}</TableCell>
                      <TableCell className="text-right">R$ {tx.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-red-600">- R$ {tx.commission.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">R$ {tx.netAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {transactions.length === 0 && !fileName && (
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                <FileSpreadsheet className="h-12 w-12 mb-2 opacity-50" />
                <p>Nenhum dado importado ainda</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
