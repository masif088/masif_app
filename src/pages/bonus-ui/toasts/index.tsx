import Breadcrumbs from "CommonElements/Breadcrumbs";
import CustomClose from "@/components_source/Bonus-Ui/Toasts/CustomClose";
import ColorToast from "@/components_source/Bonus-Ui/Toasts/ColorToast";
import TransitionToast from "@/components_source/Bonus-Ui/Toasts/Transition";
import CustomDirections from "@/components_source/Bonus-Ui/Toasts/CustomDirection";
import React from "react";
import { Container, Row } from "reactstrap";

const Toasts = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title="Toasts" mainTitle="Toasts" parent="Bonus Ui" />
      <Container fluid={true}>
        <Row className="toasts-wrapper">
          <ColorToast />
          <CustomClose />
          <TransitionToast />
          <CustomDirections />
        </Row>
      </Container>
    </div>
  );
};

export default Toasts;
