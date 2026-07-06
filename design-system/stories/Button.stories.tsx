import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronRightIcon } from "../../components/icons";
import { Button } from "../../components/ui/Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["lime", "primary", "secondary", "ghost", "icon", "text"],
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

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="lime" icon={<ChevronRightIcon size={16} />}>
        Continue
      </Button>
      <Button variant="primary" icon={<ChevronRightIcon size={16} />} iconPosition="right">
        Next
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Button
      variant="icon"
      aria-label="Continue"
      icon={<ChevronRightIcon size={16} />}
      className="rounded-xl"
    />
  ),
};

export const Text: Story = {
  args: { variant: "text", children: "Forget Password ?" },
};

export const TextEmphasis: Story = {
  args: { variant: "text", emphasis: true, children: "Sign Up" },
};
