import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EnvelopeIcon } from "../../components/icons";
import { Input } from "../../components/ui/Input";

const meta = {
  title: "Design System/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "filled"],
    },
    uppercase: { control: "boolean" },
  },
  args: {
    placeholder: "Email",
    variant: "filled",
    uppercase: true,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: <EnvelopeIcon size={16} className="shrink-0 text-faint" />,
    placeholder: "Email",
  },
};

export const WithValue: Story = {
  args: {
    icon: <EnvelopeIcon size={16} className="shrink-0 text-faint" />,
    defaultValue: "user@example.com",
    placeholder: "Email",
  },
};

export const NoUppercase: Story = {
  args: {
    uppercase: false,
    placeholder: "Enter amount",
    variant: "default",
  },
};

export const Disabled: Story = {
  args: {
    icon: <EnvelopeIcon size={16} className="shrink-0 text-faint" />,
    disabled: true,
    placeholder: "Email",
  },
};

export const Active: Story = {
  args: {
    icon: <EnvelopeIcon size={16} className="shrink-0 text-faint" />,
    placeholder: "Email",
    autoFocus: true,
  },
};
