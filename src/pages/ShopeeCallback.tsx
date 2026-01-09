import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ShopeeCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processando autorização...");

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const shopId = searchParams.get("shop_id");

      if (!code || !shopId) {
        setStatus("error");
        setMessage("Parâmetros de autorização inválidos. Código ou Shop ID não encontrados.");
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          setStatus("error");
          setMessage("Sessão expirada. Por favor, faça login novamente.");
          return;
        }

        const { data, error } = await supabase.functions.invoke("shopee-oauth", {
          body: {
            action: "callback",
            code,
            shopId: parseInt(shopId, 10),
          },
        });

        if (error) {
          console.error("Erro ao processar callback:", error);
          setStatus("error");
          setMessage(error.message || "Erro ao conectar conta Shopee.");
          return;
        }

        if (data?.success) {
          setStatus("success");
          setMessage("Conta Shopee conectada com sucesso!");
        } else {
          setStatus("error");
          setMessage(data?.error || "Erro desconhecido ao conectar conta.");
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        setStatus("error");
        setMessage("Erro inesperado ao processar autorização.");
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === "error" && <XCircle className="h-6 w-6 text-destructive" />}
            {status === "loading" && "Conectando..."}
            {status === "success" && "Sucesso!"}
            {status === "error" && "Erro"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status !== "loading" && (
            <Button onClick={() => navigate("/shopee")}>
              Voltar para Shopee
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopeeCallback;
