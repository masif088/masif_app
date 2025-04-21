import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useContext } from "react";
import { Col } from "reactstrap";
import NotificationSlider from "./NotificationSlider";
import { AlignCenter } from "react-feather";
import { ImgPath } from "utils/Constant";
import layoutContext from "helper/Layout";

const Leftbar = () => {
  const { sideBarToggle, setSideBarToggle } = useContext(layoutContext);
  return (
    <Fragment>
      <Col className="header-logo-wrapper col-auto p-0">
        <div className="logo-wrapper">
          <Link href={"/dashboard/default"}>
            <Image
              className="img-fluid for-light"
              src={`${ImgPath}/logo/logo.png`}
              alt="logo"
              width={100}
              height={100}
            />
            <Image
              className="img-fluid for-dark"
              src={`${ImgPath}/logo/logo_dark.png`}
              alt="logo"
              width={100}
              height={100}
            />
          </Link>
        </div>
        <div
          className="toggle-sidebar"
          onClick={() => setSideBarToggle(!sideBarToggle)}
        >
          <AlignCenter
            className="status_toggle middle sidebar-toggle"
            id="sidebar-toggle"
          />
        </div>
      </Col>
      <Col xxl={5} xl={6} lg={5} md={4} sm={3} className="left-header p-0">
        <NotificationSlider />
      </Col>
    </Fragment>
  );
};

export default Leftbar;
