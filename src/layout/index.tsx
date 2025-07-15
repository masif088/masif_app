'use client'
import React, { ReactNode, useContext, useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ThemeCustomizer from "./ThemeCustomizer";
import Footer from "CommonElements/Footer";
import CustomizerContext from "helper/Customizer";
import layoutContext, { searchableMenuType } from "helper/Layout";
import Head from "next/head";
import { sidebarItemType } from "Types/LayoutDataType";
import { MenuList } from "./Sidebar/menu";
import Loader from "./loader";
import NoSsr from "utils/NoSsr";
import Taptop from "./Taptop";
import { SettingsService } from "utils/supabase/settingsService";

interface layoutProps {
  children: ReactNode;
}

const Layout = ({ children }: layoutProps) => {
  const { layout, setLayout } = useContext(CustomizerContext);
  const {
    sideBarToggle,
    setSideBarToggle,
    setSearchableMenu,
    setBookmarkList,
  } = useContext(layoutContext);
  
  const [settings, setSettings] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [favicon_apple, setFaviconApple] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await SettingsService.getSettingByKey('app_title');
        console.log(settingsData?.value);
        setSettings(settingsData?.value || null);
        const faviconData = await SettingsService.getSettingByKey('app_favicon');
        console.log(faviconData?.value);
        setFavicon(faviconData?.value || null);
        const faviconAppleData = faviconData?.value
          ? faviconData.value.replace(/\/[^\/]*$/, '/')
          : null;
        setFaviconApple(faviconAppleData || null);

      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const compactSidebar = () => {
    if (layout === "compact-wrapper") {
      if (window.innerWidth <= 1006) {
        setSideBarToggle(true);
      } else {
        setSideBarToggle(false);
      }
    } else if (layout === "horizontal-wrapper") {
      if (window.innerWidth <= 1006) {
        setSideBarToggle(true);
        setLayout("compact-wrapper");
      } else {
        setSideBarToggle(false);
        setLayout("horizontal-wrapper");
      }
    }
  };

  useEffect(() => {
    compactSidebar();
    window.addEventListener("resize", () => {
      compactSidebar();
    });
  }, [layout]);

  useEffect(() => {
    const suggestionArray: searchableMenuType[] = [];
    const bookmarkArray: searchableMenuType[] = [];
    let num = 0;

    const getAllLink = (item: sidebarItemType, icon: ReactNode) => {
      if (item.children) {
        item.children.map((ele: sidebarItemType) => {
          getAllLink(ele, icon);
        });
      } else {
        num = num + 1;
        suggestionArray.push({
          icon: icon,
          title: item.title ? item.title : "",
          path: item.path ? item.path : "",
          bookmarked: item.bookmark ? item.bookmark : false,
          id: num,
        });
        if (item.bookmark) {
          bookmarkArray.push({
            icon: icon,
            title: item.title ? item.title : "",
            path: item.path ? item.path : "",
            bookmarked: item.bookmark,
            id: num,
          });
        }
      }
    };

    MenuList.forEach((item) => {
      item.Items?.map((child) => {
        getAllLink(child, child.icon);
      });
    });
    setSearchableMenu(suggestionArray);
    setBookmarkList(bookmarkArray);
  }, []);
  

  return (
    <NoSsr>
      <Head>
        <title>{settings || "Cuba - Premium Admin Template"}</title>
        <link rel="icon" href={favicon || "/favicon.ico"} type="image/x-icon" />
        <link rel="shortcut icon" href={favicon || "/favicon.ico"} type="image/x-icon" />
<link rel="apple-touch-icon" sizes="57x57" href={favicon_apple + "/apple-icon-57x57.png"} />
<link rel="apple-touch-icon" sizes="60x60" href={favicon_apple + "/apple-icon-60x60.png"} />
<link rel="apple-touch-icon" sizes="72x72" href={favicon_apple + "/apple-icon-72x72.png"} />
<link rel="apple-touch-icon" sizes="76x76" href={favicon_apple + "/apple-icon-76x76.png"} />
<link rel="apple-touch-icon" sizes="114x114" href={favicon_apple + "/apple-icon-114x114.png"} />
<link rel="apple-touch-icon" sizes="120x120" href={favicon_apple + "/apple-icon-120x120.png"} />
<link rel="apple-touch-icon" sizes="144x144" href={favicon_apple + "/apple-icon-144x144.png"} />
<link rel="apple-touch-icon" sizes="152x152" href={favicon_apple + "/apple-icon-152x152.png"} />
<link rel="apple-touch-icon" sizes="180x180" href={favicon_apple + "/apple-icon-180x180.png"} />
<link rel="icon" type="image/png" sizes="192x192"  href={favicon_apple + "/android-icon-192x192.png"} />
<link rel="icon" type="image/png" sizes="32x32" href={favicon_apple + "/favicon-32x32.png"} />
<link rel="icon" type="image/png" sizes="96x96" href={favicon_apple + "/favicon-96x96.png"} />
<link rel="icon" type="image/png" sizes="16x16" href={favicon_apple + "/favicon-16x16.png"} />
<link rel="manifest" href="/manifest.json" />
<meta name="msapplication-TileColor" content="#ffffff" />
<meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
<meta name="theme-color" content="#ffffff" />

      </Head>
      {/* <Loader /> */}
      <div
        className={`page-wrapper ${sideBarToggle ? "compact-wrapper" : layout}`}
      >
        <Header />
        <div className="page-body-wrapper">
          <Sidebar />
          {children}
          <Footer />
        </div>
      </div>
      <ThemeCustomizer />
      <Taptop />
    </NoSsr>
  );
};

export default Layout;
