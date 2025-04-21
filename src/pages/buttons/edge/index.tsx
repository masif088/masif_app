import CustomStateButtons from "@/components_source/Buttons/DefaultStyle/CustomStateButtons";
import CommonButtons from "@/components_source/Buttons/common/CommonButtons";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { activeButtonsData, boldBorderOutlineButtonsData, defaultButtonsData, disabledButtonsData, extraSmallButtonsData, gradientButtonsData, largeButtonsData, outlineButtonsData, outlineDisabledButtonsData, outlineExtraSmallButtonsData, outlineLargeButtonsData, outlineSmallButtonsData, smallButtonsData, defaultButtonsHeadingData, LargeButtonsHeadingData, SmallButtonsHeadingData, ExtraSmallButtonsHeadingData, ActiveButtonsHeadingData, DisabledButtonsHeadingData, OutlineButtonsHeadingData, BoldBorderOutlineButtonsHeadingData, OutlineLargeButtonsHeadingData, OutlineSmallButtonsHeadingData, OutlineExtraSmallButtonsHeadingData, DisabledOutlineButtonsHeadingData, GraddienButtonsHeadingData } from "Data/Buttons/EdgeButton";
import { Col, Container, Row } from "reactstrap";
import { ActiveButtonsHeading, BoldBorderOutlineButtonsHeading, Buttons, DefaultButtonsHeading, EdgeButtons, DisabledButtonsHeading, DisabledOutlineButtonsHeading, ExtraSmallButtonsHeading, GradientButtonsHeading, LargeButtonsHeading, OutlineButtonsHeading, OutlineExtraSmallButtonsHeading, OutlineLargeButtonsHeading, SmallButtonsHeading, OutlineSmallButtonsHeading } from "utils/Constant";


const FlatButton = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={EdgeButtons}
        mainTitle={EdgeButtons}
        parent={Buttons}
      />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <CommonButtons className="btn-pill" commonButtonsData={defaultButtonsData} title={DefaultButtonsHeading} subTitle={defaultButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={largeButtonsData} title={LargeButtonsHeading} subTitle={LargeButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={smallButtonsData} title={SmallButtonsHeading} subTitle={SmallButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={extraSmallButtonsData} title={ExtraSmallButtonsHeading} subTitle={ExtraSmallButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={activeButtonsData} title={ActiveButtonsHeading} subTitle={ActiveButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={disabledButtonsData} title={DisabledButtonsHeading} subTitle={DisabledButtonsHeadingData} />
            <CustomStateButtons />
            <CommonButtons className="btn-pill" commonButtonsData={outlineButtonsData} title={OutlineButtonsHeading} subTitle={OutlineButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={boldBorderOutlineButtonsData} title={BoldBorderOutlineButtonsHeading} subTitle={BoldBorderOutlineButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={outlineLargeButtonsData} title={OutlineLargeButtonsHeading} subTitle={OutlineLargeButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={outlineSmallButtonsData} title={OutlineSmallButtonsHeading} subTitle={OutlineSmallButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={outlineExtraSmallButtonsData} title={OutlineExtraSmallButtonsHeading} subTitle={OutlineExtraSmallButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={outlineDisabledButtonsData} title={DisabledOutlineButtonsHeading} subTitle={DisabledOutlineButtonsHeadingData} />
            <CommonButtons className="btn-pill" commonButtonsData={gradientButtonsData} title={GradientButtonsHeading} subTitle={GraddienButtonsHeadingData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FlatButton;
