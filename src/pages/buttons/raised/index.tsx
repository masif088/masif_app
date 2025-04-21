import CustomStateButtons from "@/components_source/Buttons/DefaultStyle/CustomStateButtons";
import CommonButtons from "@/components_source/Buttons/common/CommonButtons";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { activeButtonsData, boldBorderOutlineButtonsData, defaultButtonsData,  disabledButtonsData, extraSmallButtonsData, gradientButtonsData, largeButtonsData, outlineButtonsData, outlineDisabledButtonsData, outlineExtraSmallButtonsData, outlineLargeButtonsData, outlineSmallButtonsData, smallButtonsData,defaultButtonsHeadingData,LargeButtonsHeadingData,SmallButtonsHeadingData,ExtraSmallButtonsHeadingData,ActiveButtonsHeadingData,DisabledButtonsHeadingData,OutlineButtonsHeadingData,BoldBorderOutlineButtonsHeadingData,OutlineLargeButtonsHeadingData,OutlineSmallButtonsHeadingData,OutlineExtraSmallButtonsHeadingData,DisabledOutlineButtonsHeadingData,GraddienButtonsHeadingData } from "Data/Buttons/RaisedButton";
import { Col, Container, Row } from "reactstrap";
import { ActiveButtonsHeading, BoldBorderOutlineButtonsHeading, Buttons, DefaultButtonsHeading, RaisedButtons, DisabledButtonsHeading, DisabledOutlineButtonsHeading, ExtraSmallButtonsHeading, GradientButtonsHeading, LargeButtonsHeading, OutlineButtonsHeading, OutlineExtraSmallButtonsHeading, OutlineLargeButtonsHeading, OutlineSmallButtonsHeading, SmallButtonsHeading } from "utils/Constant";


const FlatButton = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={RaisedButtons}
        mainTitle={RaisedButtons}
        parent={Buttons}
      />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <CommonButtons raised className="btn-pill" commonButtonsData={defaultButtonsData}  title={DefaultButtonsHeading} subTitle={defaultButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={largeButtonsData}  title={LargeButtonsHeading} subTitle={LargeButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={smallButtonsData}  title={SmallButtonsHeading} subTitle={SmallButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={extraSmallButtonsData}  title={ExtraSmallButtonsHeading} subTitle={ExtraSmallButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={activeButtonsData}  title={ActiveButtonsHeading} subTitle={ActiveButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={disabledButtonsData}  title={DisabledButtonsHeading} subTitle={DisabledButtonsHeadingData} />
            <CustomStateButtons/>
            <CommonButtons raised className="btn-pill" commonButtonsData={outlineButtonsData}  title={OutlineButtonsHeading} subTitle={OutlineButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={boldBorderOutlineButtonsData}  title={BoldBorderOutlineButtonsHeading} subTitle={BoldBorderOutlineButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={outlineLargeButtonsData}  title={OutlineLargeButtonsHeading} subTitle={OutlineLargeButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={outlineSmallButtonsData}  title={OutlineSmallButtonsHeading} subTitle={OutlineSmallButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={outlineExtraSmallButtonsData}  title={OutlineExtraSmallButtonsHeading} subTitle={OutlineExtraSmallButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={outlineDisabledButtonsData}  title={DisabledOutlineButtonsHeading} subTitle={DisabledOutlineButtonsHeadingData} />
            <CommonButtons raised className="btn-pill" commonButtonsData={gradientButtonsData}  title={GradientButtonsHeading} subTitle={GraddienButtonsHeadingData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FlatButton;
