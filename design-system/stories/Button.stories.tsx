import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../../components/ui/Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["lime", "primary", "secondary", "ghost"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Sign in",
    variant: "lime",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lime: Story = {
  args: { variant: "lime" },
};

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Disabled: Story = {
  args: { variant: "lime", disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="lime">Lime</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
