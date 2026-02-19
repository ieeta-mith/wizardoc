import { FolderOpen, ClipboardList, LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/my-studies",
    label: "Projects",
    icon: FolderOpen,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: ClipboardList,
  },
]
