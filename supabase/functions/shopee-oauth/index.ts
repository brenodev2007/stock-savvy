import { createClient } from 'npm:@supabase/supabase-js@2'
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PARTNER_ID = Deno.env.get('SHOPEE_PARTNER_ID')
const PARTNER_KEY = Deno.env.get('SHOPEE_PARTNER_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Shopee API base URL (use partner.shopeemobile.com for production)
const SHOPEE_API_HOST = 'https://partner.shopeemobile.com'

function generateSignature(path: string, timestamp: number, accessToken?: string, shopId?: number): string {
  let baseString = `${PARTNER_ID}${path}${timestamp}`
  if (accessToken && shopId) {
    baseString += `${accessToken}${shopId}`
  }
  const hmac = createHmac('sha256', PARTNER_KEY!)
  hmac.update(baseString)
  return hmac.digest('hex')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let action = url.searchParams.get('action')
    let body: Record<string, unknown> = {}

    // Parse body for POST requests
    if (req.method === 'POST') {
      try {
        body = await req.json()
        if (body.action) {
          action = body.action as string
        }
      } catch {
        // No body or invalid JSON
      }
    }

    // Check for required credentials
    if (!PARTNER_ID || !PARTNER_KEY) {
      console.error('Missing Shopee credentials')
      return new Response(
        JSON.stringify({ error: 'Shopee credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    if (action === 'auth-url') {
      // Generate authorization URL for Shopee OAuth
      const redirectUrl = url.searchParams.get('redirect_url')
      if (!redirectUrl) {
        return new Response(
          JSON.stringify({ error: 'redirect_url is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const path = '/api/v2/shop/auth_partner'
      const timestamp = Math.floor(Date.now() / 1000)
      const sign = generateSignature(path, timestamp)

      const authUrl = `${SHOPEE_API_HOST}${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(redirectUrl)}`

      console.log('Generated auth URL for Shopee OAuth')
      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'callback') {
      // Handle OAuth callback from Shopee - support both query params and body
      const code = url.searchParams.get('code') || (body.code as string)
      const shopId = url.searchParams.get('shop_id') || (body.shopId as string | number)

      if (!code || !shopId) {
        return new Response(
          JSON.stringify({ error: 'code and shop_id are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const shopIdNum = typeof shopId === 'number' ? shopId : parseInt(shopId as string)

      // Exchange code for access token
      const path = '/api/v2/auth/token/get'
      const timestamp = Math.floor(Date.now() / 1000)
      const sign = generateSignature(path, timestamp)

      const tokenResponse = await fetch(
        `${SHOPEE_API_HOST}${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            shop_id: shopIdNum,
            partner_id: parseInt(PARTNER_ID!)
          })
        }
      )

      const tokenData = await tokenResponse.json()
      console.log('Token response:', JSON.stringify(tokenData))

      if (tokenData.error) {
        return new Response(
          JSON.stringify({ error: tokenData.error, message: tokenData.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get shop info
      const shopPath = '/api/v2/shop/get_shop_info'
      const shopTimestamp = Math.floor(Date.now() / 1000)
      const shopSign = generateSignature(shopPath, shopTimestamp, tokenData.access_token, shopIdNum)

      const shopResponse = await fetch(
        `${SHOPEE_API_HOST}${shopPath}?partner_id=${PARTNER_ID}&timestamp=${shopTimestamp}&sign=${shopSign}&shop_id=${shopIdNum}&access_token=${tokenData.access_token}`,
        { method: 'GET' }
      )

      const shopData = await shopResponse.json()
      console.log('Shop info:', JSON.stringify(shopData))

      const shopName = shopData.response?.shop_name || `Loja ${shopIdNum}`

      // Save or update account in database
      const { data: existingAccount } = await supabase
        .from('shopee_accounts')
        .select('id')
        .eq('shop_id', shopIdNum)
        .single()

      if (existingAccount) {
        await supabase
          .from('shopee_accounts')
          .update({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: new Date(Date.now() + tokenData.expire_in * 1000).toISOString(),
            shop_name: shopName,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAccount.id)
      } else {
        await supabase
          .from('shopee_accounts')
          .insert({
            shop_id: shopIdNum,
            shop_name: shopName,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: new Date(Date.now() + tokenData.expire_in * 1000).toISOString(),
            is_active: true,
            user_id: userId
          })
      }

      console.log('Account saved/updated successfully')
      return new Response(
        JSON.stringify({ success: true, shop_name: shopName }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'refresh-token') {
      // Refresh access token
      const body = await req.json()
      const { account_id } = body

      const { data: account } = await supabase
        .from('shopee_accounts')
        .select('*')
        .eq('id', account_id)
        .single()

      if (!account) {
        return new Response(
          JSON.stringify({ error: 'Account not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const path = '/api/v2/auth/access_token/get'
      const timestamp = Math.floor(Date.now() / 1000)
      const sign = generateSignature(path, timestamp)

      const refreshResponse = await fetch(
        `${SHOPEE_API_HOST}${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refresh_token: account.refresh_token,
            shop_id: parseInt(account.shop_id),
            partner_id: parseInt(PARTNER_ID!)
          })
        }
      )

      const refreshData = await refreshResponse.json()

      if (refreshData.error) {
        await supabase
          .from('shopee_accounts')
          .update({ status: 'expired' })
          .eq('id', account_id)

        return new Response(
          JSON.stringify({ error: refreshData.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase
        .from('shopee_accounts')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          token_expires_at: new Date(Date.now() + refreshData.expire_in * 1000).toISOString(),
          status: 'active'
        })
        .eq('id', account_id)

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Shopee OAuth error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
