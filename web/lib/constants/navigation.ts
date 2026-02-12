import { FolderOpen, ClipboardList, LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/my-studies",
    label: "My Studies",
    icon: FolderOpen,
  },
  {
    href: "/question-pool",
    label: "Document Template",
    icon: ClipboardList,
  },
]
