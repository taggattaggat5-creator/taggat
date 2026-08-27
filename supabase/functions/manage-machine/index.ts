import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const userToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!userToken) {
      return jsonError("Non autorise", 401);
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser(userToken);
    if (userErr || !user) {
      return jsonError("Session invalide", 401);
    }

    const body = await req.json();
    const { action, session_id, lab_id } = body;

    if (!action || !session_id) {
      return jsonError("action et session_id requis", 400);
    }

    // Verify the session belongs to the user
    const { data: session, error: sessErr } = await supabase
      .from("activity_sessions")
      .select("*")
      .eq("id", session_id)
      .maybeSingle();

    if (sessErr || !session) {
      return jsonError("Session introuvable", 404);
    }
    if (session.student_id !== user.id) {
      return jsonError("Acces refuse", 403);
    }

    // Get the lab
    const labId = lab_id ?? session.lab_id;
    if (!labId) {
      return jsonError("Aucun lab associe a la session", 400);
    }

    const { data: lab } = await supabase
      .from("labs")
      .select("is_automated, n8n_workflow_id, vm_template_id, title, max_duration_min")
      .eq("id", labId)
      .maybeSingle();

    if (!lab) {
      return jsonError("Lab introuvable", 404);
    }
    if (!lab.is_automated) {
      return jsonError("Ce lab n'est pas automatise", 400);
    }

    const n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
    const n8nApiKey = Deno.env.get("N8N_API_KEY");
    if (!n8nBaseUrl) {
      return jsonError("N8N_BASE_URL non configure", 500);
    }

    const n8nHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (n8nApiKey) {
      n8nHeaders["X-N8N-API-KEY"] = n8nApiKey;
    }

    if (action === "start") {
      // Mark session as provisioning
      await supabase
        .from("activity_sessions")
        .update({ machine_status: "provisioning", machine_error: null })
        .eq("id", session_id);

      // n8n generates a unique flag per session and manages the VM lifecycle
      const startPayload = {
        student_id: user.id,
        lab_id: labId,
        duration_minutes: lab.max_duration_min,
      };

      const webhookUrl = lab.n8n_workflow_id
        ? `${n8nBaseUrl.replace(/\/$/, "")}/webhook/${lab.n8n_workflow_id}`
        : `${n8nBaseUrl.replace(/\/$/, "")}/webhook/start-vm`;

      const n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: n8nHeaders,
        body: JSON.stringify(startPayload),
      });

      if (!n8nRes.ok) {
        const errText = await n8nRes.text();
        await supabase
          .from("activity_sessions")
          .update({ machine_status: "error", machine_error: `n8n: ${n8nRes.status} ${errText.slice(0, 200)}` })
          .eq("id", session_id);
        return jsonError(`Echec de provisionnement (n8n ${n8nRes.status})`, 502);
      }

      const n8nData = await n8nRes.json();

      // n8n returns: { session_id, access_url, flag, expires_at }
      const n8nSessionId = n8nData.session_id ?? n8nData.n8n_session_id ?? null;
      const accessUrl = n8nData.access_url ?? n8nData.url ?? n8nData.machine_url ?? null;
      const flag = n8nData.flag ?? n8nData.n8n_flag ?? null;

      if (!accessUrl && !flag) {
        await supabase
          .from("activity_sessions")
          .update({ machine_status: "error", machine_error: "n8n n'a retourne ni access_url ni flag" })
          .eq("id", session_id);
        return jsonError("Reponse n8n invalide: aucune info machine", 502);
      }

      await supabase
        .from("activity_sessions")
        .update({
          machine_status: "running",
          machine_url: accessUrl,
          machine_ip: null,
          machine_instance_id: null,
          n8n_session_id: n8nSessionId,
          n8n_flag: flag,
          n8n_flag_solved: false,
          machine_error: null,
        })
        .eq("id", session_id);

      return jsonResponse({
        success: true,
        status: "running",
        machine_url: accessUrl,
        n8n_session_id: n8nSessionId,
      });
    }

    if (action === "stop") {
      await supabase
        .from("activity_sessions")
        .update({ machine_status: "stopping" })
        .eq("id", session_id);

      // n8n stop payload: just session_id (idempotent)
      const stopPayload = {
        session_id: session.n8n_session_id ?? session_id,
      };

      const webhookUrl = lab.n8n_workflow_id
        ? `${n8nBaseUrl.replace(/\/$/, "")}/webhook/${lab.n8n_workflow_id}/stop`
        : `${n8nBaseUrl.replace(/\/$/, "")}/webhook/stop-vm`;

      const n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: n8nHeaders,
        body: JSON.stringify(stopPayload),
      });

      if (!n8nRes.ok) {
        const errText = await n8nRes.text();
        await supabase
          .from("activity_sessions")
          .update({ machine_status: "error", machine_error: `n8n stop: ${n8nRes.status} ${errText.slice(0, 200)}` })
          .eq("id", session_id);
        return jsonError(`Echec d'arret (n8n ${n8nRes.status})`, 502);
      }

      await supabase
        .from("activity_sessions")
        .update({
          machine_status: "stopped",
          machine_url: null,
          machine_ip: null,
          machine_instance_id: null,
        })
        .eq("id", session_id);

      return jsonResponse({ success: true, status: "stopped" });
    }

    return jsonError("Action inconnue. Utilisez 'start' ou 'stop'.", 400);
  } catch (err) {
    return jsonError(err.message ?? "Erreur serveur", 500);
  }
});

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
