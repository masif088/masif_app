import Image from "next/image";
import Link from "next/link";
import FeatherIconCom from "../../../../CommonElements/Icons/FeatherIconCom";
import layoutContext from "helper/Layout";
import { useContext, useState, useEffect } from "react";
import { SettingsService } from "../../../../utils/supabase/settingsService";

const SidebarLogo = () => {
  const { setSideBarToggle, sideBarToggle } = useContext(layoutContext);
  const [logoUrl, setLogoUrl] = useState<string>("/assets/images/logo/logo.png");
  const [darkLogoUrl, setDarkLogoUrl] = useState<string>("/assets/images/logo/logo_dark.png");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogoFromSettings();
  }, []);

  const fetchLogoFromSettings = async () => {
    try {
      setIsLoading(true);
      const logoFromSettings = await SettingsService.getSettingValue("app_logo");
      
      if (logoFromSettings) {
        setLogoUrl(logoFromSettings);
        setDarkLogoUrl(logoFromSettings); // Using same logo for both light and dark mode
      }
    } catch (error) {
      console.error("Error fetching logo from settings:", error);
      // Keep default logos if fetching fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="logo-wrapper" style={{ paddingTop: "30px" }}>
      <Link href={"/dashboard/default"}>
        {!isLoading ? (
          <>
            <Image
              className="img-fluid for-light"
              src={logoUrl}
              alt="icon"
              width={150}
              height={100}
            />
            <Image
              className="img-fluid for-dark"
              src={darkLogoUrl}
              alt="icon"
              width={121}
              height={100}
            />
          </>
        ) : (
          // Show loading placeholder while fetching logo
          <div style={{ width: 121, height: 100, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading...
          </div>
        )}
      </Link>
      <div
        className="back-btn"
        onClick={() => setSideBarToggle(!sideBarToggle)}
      >
        <i className="fa fa-angle-left" />
      </div>
      <div
        className="toggle-sidebar"
        onClick={() => setSideBarToggle(!sideBarToggle)}
      >
        <FeatherIconCom
          iconName={"Grid"}
          className="status_toggle middle sidebar-toggle"
        />
      </div>
    </div>
  );
};

export default SidebarLogo;
