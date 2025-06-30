import Image from "next/image";
import Link from "next/link";
import FeatherIconCom from "CommonElements/Icons/FeatherIconCom";
import React, { useEffect, useState } from "react";
import { Admin, EmayWalter } from "utils/Constant";
import { profileListData } from "Data/HeaderData";
import { Logout } from "../../../../utils/Constant/index";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const Profile = () => {
  const router = useRouter();

  const handleLogOut = () => {
    Cookies.remove('token')
    router.push("/authentication/login");
  };

  const [userData, setUserData] = useState<any>(null);
  useEffect(() => {
    const user = Cookies.get("user");
    const userData = JSON.parse(user || "{}");
    console.log(userData.first_name);
    setUserData(userData);
  }, []);

  
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
