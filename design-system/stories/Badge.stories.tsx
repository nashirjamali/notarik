import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "../../components/ui/Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "success", "warning", "danger", "brand"],
    },
  },
  args: {
    children: "Label",
    tone: "neutral",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: { tone: "neutral" },
};

export const Success: Story = {
  args: { tone: "success", children: "Completed" },
};

export const Warning: Story = {
  args: { tone: "warning", children: "Pending" },
};

export const Danger: Story = {
  args: { tone: "danger", children: "Failed" },
};

export const Brand: Story = {
  args: { tone: "brand", children: "New" },
};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
      <Badge tone="brand">Brand</Badge>
    </div>
  ),
};
