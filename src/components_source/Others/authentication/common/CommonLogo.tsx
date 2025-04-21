import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ImgPath } from "utils/Constant";
interface propsType {
  alignLogo?: string;
}
const CommonLogo = ({ alignLogo }: propsType) => {
  return (
    <Link
      className={`logo ${alignLogo ? alignLogo : ""} `}
      href="dashboard/default"
    >
      <Image
        width={121}
        height={35}
        className="img-fluid for-light"
        src={`${ImgPath}/logo/logo.png`}
        alt="looginpage"
      />
      <Image
        width={121}
        height={35}
        className="img-fluid for-dark"
        src={`${ImgPath}/logo/logo_dark.png`}
        alt="looginpage"
      />
    </Link>
  );
};

export default CommonLogo;
