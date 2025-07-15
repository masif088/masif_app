'use client'
import React, { useContext, useState, useEffect } from "react";
import SidebarLogo from "./SidebarLogo";
import SidebarMenu from "./SidebarMenu";
import ConfigDB from "config/ThemeConfig";
import CustomizerContext from "helper/Customizer";
import layoutContext from "helper/Layout";
import Link from "next/link";
import Image from "next/image";
import { ImgPath } from "utils/Constant";
import { SettingsService } from "../../../utils/supabase/settingsService";

const Sidebar = () => {
  const { sidebarIconType } = useContext(CustomizerContext);
  const { sideBarToggle } = useContext(layoutContext);
  const [faviconUrl, setFaviconUrl] = useState<string>(`${ImgPath}/logo/logo-icon.png`);
  const [isLoadingFavicon, setIsLoadingFavicon] = useState(true);

  const IconType = sidebarIconType || ConfigDB.data.settings.sidebar.iconType;

  useEffect(() => {
    fetchFaviconFromSettings();
  }, []);

  const fetchFaviconFromSettings = async () => {
    try {
      setIsLoadingFavicon(true);
      const faviconFromSettings = await SettingsService.getSettingValue("app_favicon");
      
      if (faviconFromSettings) {
        setFaviconUrl(faviconFromSettings);
      }
    } catch (error) {
      console.error("Error fetching favicon from settings:", error);
      // Keep default favicon if fetching fails
    } finally {
      setIsLoadingFavicon(false);
    }
  };

  return (
    <div
      className={`sidebar-wrapper ${sideBarToggle ? "close_icon" : ""}`}
      sidebar-layout={IconType}
    >
      <div>
        <SidebarLogo />
        <div className="logo-icon-wrapper">
          <Link href={"/dashboard/default"}>
            {!isLoadingFavicon ? (
              <Image
                width={35}
                height={35}
                className="img-fluid"
                src={faviconUrl}
                alt=""
              />
            ) : (
              // Show loading placeholder while fetching favicon
              <div style={{ width: 35, height: 35, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                ...
              </div>
            )}
          </Link>
        </div>
        <SidebarMenu />
      </div>
    </div>
  );
};

export default Sidebar;
