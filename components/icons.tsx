import type { ComponentProps } from "react";
import type { IconType } from "react-icons";
import {
  HiOutlineArrowPath,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowUpTray,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDocumentText,
  HiOutlineEllipsisVertical,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineQrCode,
  HiOutlineTrash,
  HiOutlineWallet,
  HiOutlineXMark,
} from "react-icons/hi2";

export type IconProps = {
  size?: number;
  className?: string;
} & Omit<ComponentProps<"svg">, "ref">;

function icon(Icon: IconType) {
  function Wrapped({ size = 20, className, ...props }: IconProps) {
    return <Icon size={size} className={className} aria-hidden {...props} />;
  }
  return Wrapped;
}

export const CameraIcon = icon(HiOutlineCamera);
export const UploadIcon = icon(HiOutlineArrowUpTray);
export const ScanIcon = icon(HiOutlineQrCode);
export const CheckIcon = icon(HiOutlineCheck);
export const AlertIcon = icon(HiOutlineExclamationTriangle);
export const XIcon = icon(HiOutlineXMark);
export const RefreshIcon = icon(HiOutlineArrowPath);
export const ReceiptIcon = icon(HiOutlineDocumentText);
export const ChevronDownIcon = icon(HiOutlineChevronDown);
export const TrashIcon = icon(HiOutlineTrash);
export const TrendIcon = icon(HiOutlineArrowTrendingUp);
export const PlusIcon = icon(HiOutlinePlus);
export const SearchIcon = icon(HiOutlineMagnifyingGlass);
export const ChevronLeftIcon = icon(HiOutlineChevronLeft);
export const ChevronRightIcon = icon(HiOutlineChevronRight);
export const EnvelopeIcon = icon(HiOutlineEnvelope);
export const LockIcon = icon(HiOutlineLockClosed);
export const EyeIcon = icon(HiOutlineEye);
export const EyeSlashIcon = icon(HiOutlineEyeSlash);
export const WalletIcon = icon(HiOutlineWallet);
export const MenuDotsIcon = icon(HiOutlineEllipsisVertical);
