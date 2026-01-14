import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { back_url } = await req.json();
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN") || "TEST-3047253968705022-011416-2f1fa3410cbd8e0bc4f0dc02cdec19cc-1713221463";

    if (!mpAccessToken) {
      console.error("MP_ACCESS_TOKEN is missing");
      throw new Error("MP_ACCESS_TOKEN not configured");
    }

    console.log("Creating Mercado Pago subscription...");

    // Determine back_url if not provided in body (though it should be)
    // We can also use a default from the request origin
    const origin = req.headers.get("origin") || "https://stock-savvy.vercel.app";
    const actualBackUrl = back_url || `${origin}/dashboard?success=true`;

    const payload = {
      reason: "Assinatura Stock Savvy Pro",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 50.00,
        currency_id: "BRL"
      },
      free_trial: {
        frequency: 14,
        frequency_type: "days"
      },
      back_url: actualBackUrl,
      status: "pending" // Initial status
    };

    console.log("Payload:", JSON.stringify(payload));

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Mercado Pago Error:", data);
        throw new Error(data.message || "Failed to create subscription");
    }

    console.log("Subscription created:", data.id);

    // returning init_point for redirect
    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating checkout:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
