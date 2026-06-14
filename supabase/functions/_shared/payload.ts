// Parses a JSON request body, enforcing a max byte length. Returns
// either { data } on success or { response } with a 413/400 to return.
export async function parseJsonBody<T = unknown>(
  req: Request,
  corsHeaders: Record<string, string>,
  maxBytes = 50_000,
): Promise<{ data: T } | { response: Response }> {
  const raw = await req.text();
  if (raw.length > maxBytes) {
    return {
      response: new Response(
        JSON.stringify({ error: "Payload too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }
  if (!raw) return { data: {} as T };
  try {
    return { data: JSON.parse(raw) as T };
  } catch {
    return {
      response: new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }
}

// Truncates a string to a max length. Safe for undefined/null.
export function clampString(v: unknown, max = 2000): string {
  if (typeof v !== "string") return "";
  return v.length > max ? v.slice(0, max) : v;
}

// Caps an array to the last N items.
export function clampArray<T>(v: unknown, max: number): T[] {
  if (!Array.isArray(v)) return [];
  return v.length > max ? (v.slice(-max) as T[]) : (v as T[]);
}