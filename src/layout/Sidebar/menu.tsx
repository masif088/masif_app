import { sidebarMenuType } from "Types/LayoutDataType";

export const MenuList: sidebarMenuType[] = [
  {
    title: "General",
    menucontent: "Dashboards,Widgets",
    Items: [
      {
        title: "Dashboards",
        id: 1,
        icon: "home",
        pathSlice: "dashboard",
        type: "sub",
        badge: "badge badge-light-primary",
        badgetxt: "8",
        children: [
          { path: "/dashboard/default", title: "Default", type: "link" },
          { path: "/dashboard/e-commerce", title: "Ecommerce", type: "link" },
          {
            path: "/dashboard/online-course",
            title: "Online Course",
            type: "link",
          },
          { path: "/dashboard/crypto", title: "Crypto", type: "link" },
          { path: "/dashboard/social", title: "Social", type: "link" },
          { path: "/dashboard/nft", title: "NFT", type: "link" },
          {
            path: "/dashboard/school-management",
            title: "School Management",
            type: "link",
          },
          { path: "/dashboard/pos", title: "POS", type: "link" },
        ],
      },
      {
        title: "Widgets",
        id: 2,
        icon: "widget",
        pathSlice: "widgets",
        type: "sub",
        active: false,
        children: [
          { path: "/widgets/general", title: "General", type: "link" },
          { path: "/widgets/chart", title: "Chart", type: "link" },
        ],
      },
    ],
  },
  {
    title: "Applications",
    menucontent: "Ready to use Apps",
    Items: [
      {
        title: "Project",
        id: 3,
        icon: "project",
        type: "sub",
        pathSlice: "project",
        badge: "badge badge-light-secondary",
        badgetxt: "New",
        active: false,
        children: [
          {
            path: "/app/project/project-list",
            type: "link",
            title: "Project List",
          },
          {
            path: "/app/project/new-project",
            type: "link",
            title: "Create New",
          },
        ],
      },
      {
        title: "Users",
        icon: "user",
        type: "sub",
        pathSlice: "users",
        active: false,
        children: [
          {
            bookmark: true,
            path: "/app/users/profile",
            type: "link",
            title: "Users Profile",
          },
          { path: "/app/users/edit", type: "link", title: "Users Edit" },
          { path: "/app/users/cards", type: "link", title: "Users Cards" },
        ],
      },
      {
        path: "/app/bookmark",
        icon: "bookmark",
        type: "link",
        title: "Bookmark",
        id: 10,
      },
      {
        title: "Contact",
        icon: "contact",
        type: "link",
        id: 11,
        active: false,
        path: "/app/contacts",
      },
      { path: "/app/task", icon: "task", type: "link", title: "Task" },
      {
        path: "/app/calendar",
        icon: "calendar",
        type: "link",
        title: "Calendar",
      },

      {
        path: "/app/social-app",
        icon: "social",
        type: "link",
        title: "Social-App",
      },
      { path: "/app/todo-app", icon: "to-do", type: "link", title: "Todo" },
      {
        path: "/app/search",
        icon: "search",
        type: "link",
        title: "Search Result",
      },
    ],
  },

  {
    title: "Forms & Table",
    menucontent: "Ready to use froms & tables",
    Items: [
      {
        title: "Forms",
        id: 17,
        icon: "form",
        type: "sub",
        pathSlice: "forms",
        active: false,
        children: [
          {
            title: "Form Controls",
            type: "sub",
            pathSlice: "controls",
            children: [
              {
                bookmark: true,
                title: "Form Validation",
                type: "link",
                path: "/forms/controls/validation",
              },
              {
                title: "Base Input",
                type: "link",
                path: "/forms/controls/input",
              },
              {
                title: "Checkbox & Radio",
                type: "link",
                path: "/forms/controls/radio-checkbox",
              },
              {
                title: "Input Groups",
                type: "link",
                path: "/forms/controls/group",
              },
              {
                title: "Input Mask",
                type: "link",
                path: "/forms/controls/inputmasks",
              },
              {
                title: "Mega Option",
                type: "link",
                path: "/forms/controls/megaoption",
              },
            ],
          },
          {
            title: "Form Widget",
            type: "sub",
            pathSlice: "widget",
            children: [
              {
                title: "Datepicker",
                type: "link",
                path: "/forms/widget/datepicker",
              },
              {
                title: "Touchspin",
                type: "link",
                path: "/forms/widget/touchspin",
              },
              { title: "Switch", type: "link", path: "/forms/widget/switch" },
              {
                title: "Typeahead",
                type: "link",
                path: "/forms/widget/typeahead",
              },
              {
                title: "Clipboard",
                type: "link",
                path: "/forms/widget/clipboard",
              },
            ],
          },
          {
            title: "Form Layout",
            type: "sub",
            pathSlice: "layout",
            children: [
              {
                path: "/forms/layout/formwizard",
                title: "Form Wizard 1",
                type: "link",
              },
              {
                path: "/forms/layout/formwizard2",
                title: "Form Wizard 2",
                type: "link",
              },
              {
                path: "/forms/layout/twofactor",
                title: "Two factor",
                type: "link",
              },
            ],
          },
        ],
      },

      {
        title: "Table",
        icon: "table",
        id: 18,
        pathSlice: "table",
        type: "sub",
        children: [
          {
            title: "Reactstrap Table",
            type: "sub",
            pathSlice: "reactstraptable",
            children: [
              {
                bookmark: true,
                title: "Basic Table",
                type: "link",
                path: "/table/reactstraptable/basictable",
              },
              {
                title: "Table Components",
                type: "link",
                path: "/table/reactstraptable/tablecomponent",
              },
            ],
          },
          {
            title: "Data Tables",
            type: "sub",
            pathSlice: "datatable",
            children: [
              {
                path: "/table/datatable/basicinit",
                title: "Basic Init",
                type: "link",
              },
              {
                path: "/table/datatable/advanceinit",
                title: "Advance Init",
                type: "link",
              },
              { path: "/table/datatable/api", title: "API", type: "link" },
              {
                path: "/table/datatable/datasources",
                title: "DATA Sources",
                type: "link",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    title: "Components",
    menucontent: "UI Components & Elements",
    Items: [
      {
        title: "Ui-Kits",
        icon: "ui-kits",
        id: 19,
        type: "sub",
        pathSlice: "ui-kits",
        active: false,
        children: [
          { path: "/ui-kits/typography", title: "Typography", type: "link" },
          { path: "/ui-kits/avatar", title: "Avatar", type: "link" },
          {
            path: "/ui-kits/helperclass",
            title: "Helper Classes",
            type: "link",
          },
          { path: "/ui-kits/grid", title: "Grid", type: "link" },
          { path: "/ui-kits/tag-pills", title: "Tag & Pills", type: "link" },
          { path: "/ui-kits/progress", title: "Progress", type: "link" },
          { path: "/ui-kits/modal", title: "Modal", type: "link" },
          { path: "/ui-kits/alert", title: "Alert", type: "link" },
          { path: "/ui-kits/popover", title: "Popover", type: "link" },
          { path: "/ui-kits/tooltip", title: "Tooltip", type: "link" },
          { path: "/ui-kits/dropdown", title: "Dropdown", type: "link" },
          { path: "/ui-kits/accordion", title: "Accordion", type: "link" },
          { path: "/ui-kits/tabs", title: "Tabs", type: "link" },
          { path: "/ui-kits/list", title: "Lists", type: "link" },
        ],
      },

      {
        title: "Bonus-Ui",
        icon: "bonus-kit",
        id: 20,
        type: "sub",
        pathSlice: "bonus-ui",
        active: false,
        children: [
          { path: "/bonus-ui/scrollable", title: "Scrollable", type: "link" },
          { path: "/bonus-ui/tree-view", title: "Tree View", type: "link" },
          { path: "/bonus-ui/toasts", title: "Toasts", type: "link" },
          { path: "/bonus-ui/rating", title: "Rating", type: "link" },
          { path: "/bonus-ui/dropzone", title: "Dropzone", type: "link" },
          { path: "/bonus-ui/tour", title: "Tour ", type: "link" },
          {
            path: "/bonus-ui/sweet-alert2",
            title: "SweetAlert2",
            type: "link",
          },
          {
            path: "/bonus-ui/owl-carousel",
            title: "Owl Carousel",
            type: "link",
          },
          { path: "/bonus-ui/ribbons", title: "Ribbons", type: "link" },
          { path: "/bonus-ui/pagination", title: "Pagination", type: "link" },
          { path: "/bonus-ui/breadcrumb", title: "Breadcrumb", type: "link" },
          {
            path: "/bonus-ui/rangeslider",
            title: "Range Slider",
            type: "link",
          },
          {
            path: "/bonus-ui/imagecropper",
            title: "Image Cropper",
            type: "link",
          },
          { path: "/bonus-ui/basic-cards", title: "Basic Card", type: "link" },
          {
            path: "/bonus-ui/creative-cards",
            title: "Creative Card",
            type: "link",
          },
          { path: "/bonus-ui/timeline", title: "Timeline", type: "link" },
        ],
      },

      {
        title: "Icons",
        icon: "icons",
        id: 21,
        type: "sub",
        pathSlice: "icons",
        active: false,
        children: [
          { path: "/icons/flagIcons", title: "Flag Icon", type: "link" },
          {
            path: "/icons/fontawesome-icon",
            title: "Fontawesome Icon",
            type: "link",
          },
          { path: "/icons/ico-icon", title: "Ico_Icon", type: "link" },
          { path: "/icons/themify-icon", title: "Themify Icon", type: "link" },
          { path: "/icons/feather-icon", title: "Feather Icon", type: "link" },
          { path: "/icons/weather-icon", title: "Weather Icons", type: "link" },
        ],
      },

      {
        title: "Buttons",
        icon: "button",
        id: 22,
        type: "sub",
        pathSlice: "buttons",
        active: false,
        children: [
          {
            path: "/buttons/simplebutton",
            title: "Default Style",
            type: "link",
          },
          { path: "/buttons/flat", title: "Flat Style", type: "link" },
          { path: "/buttons/edge", title: "Edge Style", type: "link" },
          { path: "/buttons/raised", title: "Raised Style", type: "link" },
          { path: "/buttons/group", title: "Button Group", type: "link" },
        ],
      },

      {
        title: "Charts",
        icon: "charts",
        type: "sub",
        pathSlice: "charts",
        id: 23,
        active: false,
        children: [
          { path: "/charts/apex", type: "link", title: "Apex Chart" },
          { path: "/charts/google", type: "link", title: "Google Chart" },
          { path: "/charts/chartjs", type: "link", title: "Chartjs Chart" },
        ],
      },
    ],
  },
  {
    title: "Pages",
    menucontent: "All neccesory pages added",
    Items: [
      {
        icon: "sample-page",
        badge2: true,
        id: 24,
        active: false,
        path: "/pages/sample-page",
        title: "Sample Page",
        type: "link",
      },
      {
        title: "Others",
        icon: "others",
        id: 25,
        type: "sub",
        pathSlice: "pages",
        children: [
          {
            title: "Error Pages",
            type: "sub",
            pathSlice: "errors",
            children: [
              {
                title: "Error 400",
                type: "link",
                path: "/pages/errors/error400",
              },
              {
                title: "Error 401",
                type: "link",
                path: "/pages/errors/error401",
              },
              {
                title: "Error 403",
                type: "link",
                path: "/pages/errors/error403",
              },
              {
                title: "Error 404",
                type: "link",
                path: "/pages/errors/error404",
              },
              {
                title: "Error 500",
                type: "link",
                path: "/pages/errors/error500",
              },
              {
                title: "Error 503",
                type: "link",
                path: "/pages/errors/error503",
              },
            ],
          },
          {
            title: "Authentication",
            type: "sub",
            pathSlice: "authentication",
            children: [
              {
                title: "Login Simple",
                type: "link",
                path: "/pages/authentication/login-simple",
              },
              {
                title: "Login with bg image",
                type: "link",
                path: "/pages/authentication/login-bg-img",
              },
              {
                title: "Login with image two",
                type: "link",
                path: "/pages/authentication/login-img",
              },
              {
                title: "Login with validation",
                type: "link",
                path: "/pages/authentication/login-validation",
              },
              {
                title: "Login with tooltip",
                type: "link",
                path: "/pages/authentication/login-tooltip",
              },
              {
                title: "Login with sweetalert",
                type: "link",
                path: "/pages/authentication/login-sweetalert",
              },
              {
                title: "Register Simple",
                type: "link",
                path: "/pages/authentication/register-simple",
              },
              {
                title: "Register with Bg Image",
                type: "link",
                path: "/pages/authentication/register-bg-img",
              },
              {
                title: "Register with Bg Two",
                type: "link",
                path: "/pages/authentication/sign-up-two",
              },
              {
                title: "Register Wizard",
                type: "link",
                path: "/pages/authentication/registerwizard",
              },
              {
                title: "Unloack User",
                type: "link",
                path: "/pages/authentication/unlock-user",
              },
              {
                title: "Forget Password",
                type: "link",
                path: "/pages/authentication/forget-pwd",
              },
              {
                title: "Reset Password",
                type: "link",
                path: "/pages/authentication/create-pwd",
              },
              {
                title: "Maintenance",
                type: "link",
                path: "/pages/authentication/maintenance",
              },
            ],
          },
          {
            title: "Coming Soon",
            type: "sub",
            pathSlice: "comingsoon",
            children: [
              {
                title: "Coming Simple",
                type: "link",
                path: "/pages/comingsoon/comingsoonsimple",
              },
              {
                title: "Coming with Bg Video",
                type: "link",
                path: "/pages/comingsoon/coming-bg-video",
              },
              {
                title: "Coming with bg Image",
                type: "link",
                path: "/pages/comingsoon/coming-bg-img",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    title: "Miscellaneous",
    menucontent: "Bouns Pages & Apps",
    Items: [
      {
        title: "Gallery",
        icon: "gallery",
        id: 26,
        type: "sub",
        pathSlice: "gallery",
        active: false,
        children: [
          { path: "/app/gallery/grids", title: "Gallery Grids", type: "link" },
          {
            path: "/app/gallery/griddesc",
            title: "Gallery Grid Desc",
            type: "link",
          },
          {
            path: "/app/gallery/masonrys",
            title: "Masonry Gallery",
            type: "link",
          },
          {
            path: "/app/gallery/masonrydesc",
            title: "Masonry With Desc",
            type: "link",
          },
          {
            path: "/app/gallery/hovereffect",
            title: "Hover Effect",
            type: "link",
          },
        ],
      },

      {
        title: "Blog",
        icon: "blog",
        id: 27,
        type: "sub",
        pathSlice: "blog",
        active: false,
        children: [
          {
            path: "/app/blog/blogdetails",
            title: "Blog Details",
            type: "link",
          },
          { path: "/app/blog/blogsingle", title: "Blog Single", type: "link" },
          { path: "/app/blog/blogpost", title: "Add Post", type: "link" },
        ],
      },
      {
        path: "/app/faq",
        icon: "faq",
        type: "link",
        active: false,
        title: "FAQ",
      },
      {
        title: "Job Search",
        icon: "job-search",
        id: 28,
        type: "sub",
        pathSlice: "jobsearch",
        active: false,
        children: [
          { path: "/app/jobsearch/cardview", title: "Card View", type: "link" },
          { path: "/app/jobsearch/joblist", title: "List View", type: "link" },
          {
            path: "/app/jobsearch/jobdetail",
            title: "Job Detail",
            type: "link",
          },
          { path: "/app/jobsearch/jobapply", title: "Apply", type: "link" },
        ],
      },
      {
        title: "Learning",
        icon: "learning",
        id: 29,
        type: "sub",
        pathSlice: "learning",
        active: false,
        children: [
          {
            path: "/app/learning/learninglist",
            title: "Learning List",
            type: "link",
          },
          {
            path: "/app/learning/learningdetail",
            title: "Detailed Course",
            type: "link",
          },
        ],
      },
      {
        title: "Maps",
        icon: "maps",
        type: "sub",
        pathSlice: "map",
        id: 30,
        active: false,
        children: [
          { path: "/app/map/googlemap", type: "link", title: "Google Map" },
          { path: "/app/map/leafletmap", type: "link", title: "Leaflet Map" },
        ],
      },
      {
        title: "Editor",
        id: 31,
        icon: "editors",
        type: "sub",
        pathSlice: "editor",
        active: false,
        children: [
          { path: "/editor/ckeditor", type: "link", title: "CK Editor" },
          { path: "/editor/mdeeditor", type: "link", title: "MDE Editor" },
          { path: "/editor/aceeditor", type: "link", title: "ACE Editor" },
        ],
      },

      {
        id: 32,
        path: "/app/knowledgebase",
        icon: "knowledgebase",
        type: "link",
        active: false,
        title: "Knowledgebase",
      },
      {
        id: 33,
        path: "/app/supportticket",
        icon: "support-tickets",
        type: "link",
        active: false,
        title: "Support Ticket",
      },
    ],
  },
];
