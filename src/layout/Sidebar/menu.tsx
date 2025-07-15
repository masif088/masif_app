import {sidebarMenuType} from "Types/LayoutDataType";

export const MenuList: sidebarMenuType[] = [
  {
    title: "General",
    menucontent: "Dashboards,Widgets",
    Items: [
      {
        path: "/admin/dashboard",
        icon: "material-symbols-light:dashboard-outline",
        type: "link",
        title: "Dashboard",
        id: 1,
      },
    ],
  },
  {
    title: "Finance",
    menucontent: "money",
    Items: [
      {
        path: "/admin/wallet",
        icon: "material-symbols-light:account-balance-wallet-outline",
        type: "link",
        title: "Wallet",
        id: 3,
      },

      // {
      //   title: "Editor",
      //   id: 31,
      //   icon: "editors",
      //   type: "sub",
      //   pathSlice: "editor",
      //   active: false,
      //   children: [
      //     { path: "/editor/ckeditor", type: "link", title: "CK Editor" },
      //     { path: "/editor/mdeeditor", type: "link", title: "MDE Editor" },
      //     { path: "/editor/aceeditor", type: "link", title: "ACE Editor" },
      //   ],
      // },
    ],
  },
  {
    title: "Users",
    menucontent: "users",
    Items: [
      {
        path: "/admin/users",
        icon: "material-symbols-light:account-circle",
        type: "link",
        title: "Users",
        id: 99,
      },
      {
        path: "/admin/contact-email",
        icon: "material-symbols-light:account-circle",
        type: "link",
        title: "Contact Email",
        id: 99,
      },
    ],
  },
  {
    title: "Company",
    menucontent: "company",
    Items: [
      {
        path: "/admin/customer",
        icon: "material-symbols-light:business-center",
        type: "link",
        title: "Companies",
        id: 201,
      },
    ],
  },
  {
    title: "Activity",
    menucontent: "activity",
    Items: [
      {
        path: "/admin/activity",
        icon: "material-symbols-light:history",
        type: "link",
        title: "Activity",
        id: 202,
      },
      {
        path: "/admin/activity_statuses",
        icon: "material-symbols-light:history",
        type: "link",
        title: "Activity Status",
        id: 204,
      },    
      {
        path: "/admin/activity_priorities",
        icon: "material-symbols-light:flag",
        type: "link",
        title: "Activity Priorities",
        id: 203,
      },
    ],
  },
  
  {
    title: "Settings",
    menucontent: "settings",
    Items: [
      {
        path: "/admin/setting",
        icon: "material-symbols-light:settings",
        type: "link",
        title: "Settings",
        id: 205,
      },
    ],
  },

];
