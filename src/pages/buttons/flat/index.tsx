import CustomStateButtons from "@/components_source/Buttons/DefaultStyle/CustomStateButtons";
import CommonButtons from "@/components_source/Buttons/common/CommonButtons";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { activeButtonsData, boldBorderOutlineButtonsData, defaultButtonsData,  disabledButtonsData, extraSmallButtonsData, gradientButtonsData, largeButtonsData, outlineButtonsData, outlineDisabledButtonsData, outlineExtraSmallButtonsData, outlineLargeButtonsData, outlineSmallButtonsData, smallButtonsData, defaultButtonsHeadingData,LargeButtonsHeadingData,SmallButtonsHeadingData,ExtraSmallButtonsHeadingData,ActiveButtonsHeadingData,DisabledButtonsHeadingData,OutlineButtonsHeadingData,BoldBorderOutlineButtonsHeadingData,OutlineLargeButtonsHeadingData,OutlineSmallButtonsHeadingData,OutlineExtraSmallButtonsHeadingData,DisabledOutlineButtonsHeadingData,GraddienButtonsHeadingData } from "Data/Buttons/FlatButton";
import { Col, Container, Row } from "reactstrap";
import {ActiveButtonsHeading, BoldBorderOutlineButtonsHeading, Buttons, DefaultButtonsHeading, FlatStyleHeading, DisabledButtonsHeading, DisabledOutlineButtonsHeading, ExtraSmallButtonsHeading, GradientButtonsHeading, LargeButtonsHeading, OutlineButtonsHeading, OutlineExtraSmallButtonsHeading, OutlineLargeButtonsHeading, OutlineSmallButtonsHeading, SmallButtonsHeading  } from "utils/Constant";


const FlatButton = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={FlatStyleHeading}
        mainTitle={FlatStyleHeading}
        parent={Buttons}
      />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <CommonButtons className="btn-square" commonButtonsData={defaultButtonsData}  title={DefaultButtonsHeading} subTitle={defaultButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={largeButtonsData}  title={LargeButtonsHeading} subTitle={LargeButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={smallButtonsData}  title={SmallButtonsHeading} subTitle={SmallButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={extraSmallButtonsData}  title={ExtraSmallButtonsHeading} subTitle={ExtraSmallButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={activeButtonsData}  title={ActiveButtonsHeading} subTitle={ActiveButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={disabledButtonsData}  title={DisabledButtonsHeading} subTitle={DisabledButtonsHeadingData} />
            <CustomStateButtons/>
            <CommonButtons className="btn-square" commonButtonsData={outlineButtonsData}  title={OutlineButtonsHeading} subTitle={OutlineButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={boldBorderOutlineButtonsData}  title={BoldBorderOutlineButtonsHeading} subTitle={BoldBorderOutlineButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={outlineLargeButtonsData}  title={OutlineLargeButtonsHeading} subTitle={OutlineLargeButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={outlineSmallButtonsData}  title={OutlineSmallButtonsHeading} subTitle={OutlineSmallButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={outlineExtraSmallButtonsData}  title={OutlineExtraSmallButtonsHeading} subTitle={OutlineExtraSmallButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={outlineDisabledButtonsData}  title={DisabledOutlineButtonsHeading} subTitle={DisabledOutlineButtonsHeadingData} />
            <CommonButtons className="btn-square" commonButtonsData={gradientButtonsData}  title={GradientButtonsHeading} subTitle={GraddienButtonsHeadingData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FlatButton;
