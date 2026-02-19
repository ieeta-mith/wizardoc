import { FolderOpen, ClipboardList, LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/my-studies",
    label: "Workspace",
    icon: FolderOpen,
  },
  {
    href: "/question-pool",
    label: "Template Manager",
    icon: ClipboardList,
  },
]
