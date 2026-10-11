import type { Component } from "solid-js";
import { createSignal, For, onMount } from "solid-js";
import { registerView } from "@/views/registry";
import { query } from "@/pack-data";

type Note = { body: string };

function notesFrom(result: unknown, field: string): Note[] {
  const first = Array.isArray(result) ? result[0] : result;
  const value = first && typeof first === "object" && first !== null && "result" in first
    ? (first as { result?: unknown }).result
    : first;
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const body = (row as Record<string, unknown>)[field];
    return typeof body === "string" ? [{ body }] : [];
  });
}

const MarkerCalls: Component = () => {
  const [rows, setRows] = createSignal<Note[]>([]);
  const [body, setBody] = createSignal("");
  const [error, setError] = createSignal("");
  const [saving, setSaving] = createSignal(false);

  const load = async () => {
    const result = await query("SELECT marker__body FROM marker__note ORDER BY marker__at;");
    setRows(notesFrom(result, "marker__body"));
  };

  onMount(() => {
    void load().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Could not load notes.");
    });
  });

  const create = async () => {
    const text = body().trim();
    if (!text || saving()) return;
    setSaving(true);
    setError("");
    try {
      await query("CREATE marker__note SET marker__body = $body;", { body: text });
      setBody("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the note.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h1>Marker notes</h1>
      <form onSubmit={(event) => { event.preventDefault(); void create(); }}>
        <label>
          Note
          <input
            value={body()}
            maxlength={500}
            onInput={(event) => setBody(event.currentTarget.value)}
          />
        </label>
        <button type="submit" disabled={saving() || body().trim() === ""}>Add note</button>
      </form>
      <p role="alert">{error()}</p>
      <ul>
        <For each={rows()} fallback={<li>No notes yet.</li>}>{(note) => <li>{note.body}</li>}</For>
      </ul>
    </section>
  );
};

registerView({
  id: "marker__calls",
  label: "Marker notes",
  component: MarkerCalls,
});
