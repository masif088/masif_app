import Image from "next/image";
import Link from "next/link";
import FeatherIconCom from "CommonElements/Icons/FeatherIconCom";
import React, { useEffect, useState } from "react";
import { Admin, EmayWalter } from "utils/Constant";
import { profileListData } from "Data/HeaderData";
import { Logout } from "../../../../utils/Constant/index";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const Profile = () => {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  // Use AuthContext user data as primary source, fallback to cookies
  useEffect(() => {
    if (user) {
      // If we have user from AuthContext, use it
      setUserData({
        first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
        last_name: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'User'
      });
    } else {
      // Fallback to cookies for backward compatibility
      const userCookie = Cookies.get("user");
      if (userCookie) {
        try {
          const parsedUser = JSON.parse(userCookie);
          setUserData(parsedUser);
        } catch (error) {
          console.error('Error parsing user cookie:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    }
  }, [user]);

  const handleLogOut = async () => {
    try {
      console.log('Starting logout process...');
      
      // Show loading toast
      const loadingToast = toast.loading("Logging out...");
      
      // Remove all authentication-related cookies
      console.log('Removing cookies...');
      Cookies.remove('token');
      Cookies.remove('user');
      
      // Clear any localStorage items
      if (typeof window !== 'undefined') {
        console.log('Clearing localStorage...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Use Supabase signOut to properly clear the session
      console.log('Calling Supabase signOut...');
      await signOut();
      
      console.log('Logout completed successfully');
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Logged out successfully");
      
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Error during logout. Please try again.");
      
      // Fallback: force redirect to login page and clear everything
      console.log('Executing fallback logout...');
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      router.push("/authentication/login");
    }
  };

  // Don't render if no user data
  if (!userData) {
    return null;
  }

  
  return (
    <li className="profile-nav onhover-dropdown pe-0 py-0">
      <div className="media profile-media">
        <Image className="b-r-10" src="/assets/images/dashboard/profile.png" alt="" width={35} height={35}/>
        <div className="media-body">
          <span>{userData?.first_name} {userData?.last_name}</span>
          <p className="mb-0 font-roboto">
            {userData?.role} <i className="middle fa fa-angle-down" />
          </p>
        </div>
      </div>
      <ul className="profile-dropdown onhover-show-div">
        {profileListData &&
          profileListData.map((item, index) => (
            <li key={index}>
              <Link href={item.path}>
                <FeatherIconCom iconName={item.icon} />
                <span>{item.text} </span>
              </Link>
            </li>
          ))}
        <li onClick={handleLogOut}>
          <a href="#123">
            <FeatherIconCom iconName={"LogIn"} />
            <span>{Logout}</span>
          </a>
        </li>
      </ul>
    </li>
  );
};

export default Profile;
