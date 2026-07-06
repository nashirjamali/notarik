import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "../../components/ui/Input";

const meta = {
  title: "Design System/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter amount",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "250,000" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled" },
};
