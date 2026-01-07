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

const SHOPEE_API_HOST = 'https://partner.shopeemobile.com'

function generateSignature(path: string, timestamp: number, accessToken: string, shopId: number): string {
  const baseString = `${PARTNER_ID}${path}${timestamp}${accessToken}${shopId}`
  const hmac = createHmac('sha256', PARTNER_KEY!)
  hmac.update(baseString)
  return hmac.digest('hex')
}

// Map Shopee order status to our status
function mapOrderStatus(shopeeStatus: string): string {
  const statusMap: Record<string, string> = {
    'UNPAID': 'aguardandoEnvio',
    'READY_TO_SHIP': 'aguardandoEnvio',
    'PROCESSED': 'aguardandoEnvio',
    'SHIPPED': 'enviado',
    'TO_CONFIRM_RECEIVE': 'emTransporte',
    'IN_CANCEL': 'cancelado',
    'CANCELLED': 'cancelado',
    'COMPLETED': 'entregue',
    'TO_RETURN': 'devolvido'
  }
  return statusMap[shopeeStatus] || 'aguardandoEnvio'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { account_id } = await req.json()

    if (!account_id) {
      return new Response(
        JSON.stringify({ error: 'account_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!PARTNER_ID || !PARTNER_KEY) {
      return new Response(
        JSON.stringify({ error: 'Shopee credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('shopee_accounts')
      .select('*')
      .eq('id', account_id)
      .single()

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token needs refresh
    const tokenExpiry = new Date(account.token_expires_at)
    if (tokenExpiry < new Date()) {
      console.log('Token expired, refreshing...')
      // Call refresh token endpoint
      const refreshPath = '/api/v2/auth/access_token/get'
      const refreshTimestamp = Math.floor(Date.now() / 1000)
      const refreshSign = createHmac('sha256', PARTNER_KEY!)
        .update(`${PARTNER_ID}${refreshPath}${refreshTimestamp}`)
        .digest('hex')

      const refreshResponse = await fetch(
        `${SHOPEE_API_HOST}${refreshPath}?partner_id=${PARTNER_ID}&timestamp=${refreshTimestamp}&sign=${refreshSign}`,
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
          JSON.stringify({ error: 'Token expired, please reconnect your account' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update tokens
      account.access_token = refreshData.access_token
      account.refresh_token = refreshData.refresh_token
      await supabase
        .from('shopee_accounts')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          token_expires_at: new Date(Date.now() + refreshData.expire_in * 1000).toISOString(),
          status: 'active'
        })
        .eq('id', account_id)
    }

    // Fetch orders from Shopee
    const shopId = parseInt(account.shop_id)
    const path = '/api/v2/order/get_order_list'
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = generateSignature(path, timestamp, account.access_token, shopId)

    // Get orders from last 15 days
    const timeFrom = Math.floor((Date.now() - 15 * 24 * 60 * 60 * 1000) / 1000)
    const timeTo = Math.floor(Date.now() / 1000)

    const orderListUrl = `${SHOPEE_API_HOST}${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&access_token=${account.access_token}&time_range_field=create_time&time_from=${timeFrom}&time_to=${timeTo}&page_size=100`

    console.log('Fetching orders from Shopee...')
    const orderListResponse = await fetch(orderListUrl)
    const orderListData = await orderListResponse.json()

    if (orderListData.error) {
      console.error('Shopee API error:', orderListData)
      
      // Create sync log with error
      await supabase.from('shopee_sync_logs').insert({
        account_id,
        status: 'error',
        error_message: orderListData.message || orderListData.error,
        orders_synced: 0
      })

      return new Response(
        JSON.stringify({ error: orderListData.message || 'Failed to fetch orders' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orderList = orderListData.response?.order_list || []
    console.log(`Found ${orderList.length} orders`)

    if (orderList.length === 0) {
      await supabase.from('shopee_sync_logs').insert({
        account_id,
        status: 'success',
        orders_synced: 0
      })

      return new Response(
        JSON.stringify({ success: true, orders_synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get order details
    const orderSnList = orderList.map((o: any) => o.order_sn).join(',')
    const detailPath = '/api/v2/order/get_order_detail'
    const detailTimestamp = Math.floor(Date.now() / 1000)
    const detailSign = generateSignature(detailPath, detailTimestamp, account.access_token, shopId)

    const detailUrl = `${SHOPEE_API_HOST}${detailPath}?partner_id=${PARTNER_ID}&timestamp=${detailTimestamp}&sign=${detailSign}&shop_id=${shopId}&access_token=${account.access_token}&order_sn_list=${orderSnList}&response_optional_fields=buyer_user_id,buyer_username,recipient_address,shipping_carrier,actual_shipping_fee,total_amount`

    const detailResponse = await fetch(detailUrl)
    const detailData = await detailResponse.json()

    const orders = detailData.response?.order_list || []
    let syncedCount = 0

    for (const order of orders) {
      const orderData = {
        account_id,
        order_sn: order.order_sn,
        buyer_name: order.buyer_username || order.recipient_address?.name || 'N/A',
        buyer_address: order.recipient_address ? 
          `${order.recipient_address.full_address || ''}, ${order.recipient_address.city || ''}, ${order.recipient_address.state || ''}` : null,
        total_amount: order.total_amount || 0,
        shipping_fee: order.actual_shipping_fee || 0,
        status: mapOrderStatus(order.order_status),
        carrier: order.shipping_carrier || null,
        tracking_number: order.tracking_no || null,
        order_date: new Date(order.create_time * 1000).toISOString(),
        ship_by_date: order.ship_by_date ? new Date(order.ship_by_date * 1000).toISOString() : null,
        items: order.item_list || [],
        raw_data: order
      }

      // Upsert order
      const { error: upsertError } = await supabase
        .from('shopee_orders')
        .upsert(orderData, { onConflict: 'order_sn' })

      if (!upsertError) {
        syncedCount++

        // Check for status changes and log them
        const { data: existingOrder } = await supabase
          .from('shopee_orders')
          .select('id, status')
          .eq('order_sn', order.order_sn)
          .single()

        if (existingOrder && existingOrder.status !== orderData.status) {
          await supabase.from('shopee_order_status_history').insert({
            order_id: existingOrder.id,
            old_status: existingOrder.status,
            new_status: orderData.status,
            changed_at: new Date().toISOString()
          })
        }
      } else {
        console.error('Error upserting order:', upsertError)
      }
    }

    // Create sync log
    await supabase.from('shopee_sync_logs').insert({
      account_id,
      status: 'success',
      orders_synced: syncedCount
    })

    console.log(`Successfully synced ${syncedCount} orders`)
    return new Response(
      JSON.stringify({ success: true, orders_synced: syncedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Sync error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
