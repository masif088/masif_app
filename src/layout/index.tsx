'use client'
import React, { ReactNode, useContext, useEffect } from "react";
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
        <title>Cuba - Premium Admin Template</title>
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
