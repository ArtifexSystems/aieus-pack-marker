import type { Component } from "solid-js";
import { registerView } from "@/views/registry";

const MarkerCalls: Component = () => (
  <section>
    <h1>Marker calls</h1>
    <p>Restored from the pack lock.</p>
  </section>
);

registerView({
  id: "marker__calls",
  label: "Marker calls",
  component: MarkerCalls,
});
