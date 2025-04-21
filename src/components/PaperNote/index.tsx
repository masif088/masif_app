import Link from "next/link";
import React from "react";
import { Card, CardHeader, Col } from "reactstrap";

import PaperNoteBody from "./PaperNoteBody";
import {PaperNoteTitle, ViewProject} from "../../../utils/Constant";

const PaperNote = () => {
  return (
    <Col xxl={6} lg={8} md={11} className="box-col-8 col-ed-6">
      <Card className=" papernote-wrap">
        <CardHeader className=" card-no-border">
          <div className="header-top">
            <h5>{PaperNoteTitle}</h5>
            <Link className="f-light d-flex align-items-center" href="#">
              {ViewProject} <i className="f-w-700 icon-arrow-top-right" />
            </Link>
          </div>
        </CardHeader>
        <PaperNoteBody />
      </Card>
    </Col>
  );
};

export default PaperNote;
