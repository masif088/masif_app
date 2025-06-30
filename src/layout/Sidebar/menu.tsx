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
      {
        path: "/admin/activity",
        icon: "material-symbols-light:dashboard-outline",
        type: "link",
        title: "Activity",
        id: 2,
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
    ],
  },

];
