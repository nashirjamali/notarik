import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Design System/Foundations/Tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const colorGroups: { label: string; tokens: { name: string; className: string }[] }[] = [
  {
    label: "Ground",
    tokens: [
      { name: "bg", className: "bg-bg border border-border" },
      { name: "surface", className: "bg-surface border border-border" },
      { name: "sidebar", className: "bg-sidebar border border-border" },
      { name: "border", className: "bg-border" },
      { name: "border-strong", className: "bg-border-strong" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { name: "ink", className: "bg-ink" },
      { name: "muted", className: "bg-muted" },
      { name: "faint", className: "bg-faint" },
    ],
  },
  {
    label: "Brand",
    tokens: [
      { name: "primary", className: "bg-primary" },
      { name: "primary-hover", className: "bg-primary-hover" },
      { name: "secondary", className: "bg-secondary" },
      { name: "accent-blue", className: "bg-accent-blue" },
      { name: "accent-purple", className: "bg-accent-purple" },
    ],
  },
  {
    label: "Status",
    tokens: [
      { name: "success", className: "bg-success" },
      { name: "warning", className: "bg-warning" },
      { name: "danger", className: "bg-danger" },
    ],
  },
];

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {colorGroups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-3 text-sm font-extrabold text-ink">{group.label}</h3>
          <div className="flex flex-wrap gap-4">
            {group.tokens.map((t) => (
              <div key={t.name} className="flex flex-col gap-2">
                <div className={`size-16 rounded-md ${t.className}`} />
                <span className="text-xs font-medium text-muted">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

const typeRamp = [
  { label: "Heading/H2", size: "text-[40px]", weight: "font-extrabold" },
  { label: "Heading/H4", size: "text-2xl", weight: "font-extrabold" },
  { label: "Heading/H6", size: "text-lg", weight: "font-extrabold" },
  { label: "Body/Large/ExtraBold", size: "text-base", weight: "font-extrabold" },
  { label: "Body/Large/Medium", size: "text-base", weight: "font-medium" },
  { label: "Body/Medium/ExtraBold", size: "text-sm", weight: "font-extrabold" },
  { label: "Body/Medium/Medium", size: "text-sm", weight: "font-medium" },
  { label: "Body/Small/SemiBold", size: "text-xs", weight: "font-semibold" },
  { label: "Body/XSmall/Medium", size: "text-[10px]", weight: "font-medium" },
];

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      {typeRamp.map((t) => (
        <div key={t.label} className="flex items-baseline gap-6">
          <span className={`${t.size} ${t.weight} text-ink`}>The quick brown fox</span>
          <span className="text-xs text-muted">{t.label}</span>
        </div>
      ))}
    </div>
  ),
};

const spacing = [
  { name: "xs", px: 4 },
  { name: "sm", px: 8 },
  { name: "md", px: 12 },
  { name: "lg", px: 16 },
  { name: "xl", px: 24 },
  { name: "2xl", px: 32 },
  { name: "3xl", px: 40 },
];

const radius = [
  { name: "sm", px: 8 },
  { name: "md", px: 12 },
  { name: "lg", px: 16 },
  { name: "full", px: 1000 },
];

export const SpacingAndRadius: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-ink">Spacing</h3>
        <div className="flex flex-col gap-2">
          {spacing.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className="h-4 bg-primary" style={{ width: s.px }} />
              <span className="text-xs text-muted">
                spacing/{s.name} — {s.px}px
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-ink">Radius</h3>
        <div className="flex flex-col gap-2">
          {radius.map((r) => (
            <div key={r.name} className="flex items-center gap-3">
              <div
                className="size-12 bg-secondary"
                style={{ borderRadius: Math.min(r.px, 24) }}
              />
              <span className="text-xs text-muted">
                radius/{r.name} — {r.px}px
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
