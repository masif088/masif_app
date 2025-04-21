import CustomStateButtons from "@/components_source/Buttons/DefaultStyle/CustomStateButtons";
import CommonButtons from "@/components_source/Buttons/common/CommonButtons";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { activeButtonsData, boldBorderOutlineButtonsData, defaultButtonsData,  disabledButtonsData, extraSmallButtonsData, gradientButtonsData, largeButtonsData, outlineButtonsData, outlineDisabledButtonsData, outlineExtraSmallButtonsData, outlineLargeButtonsData, outlineSmallButtonsData, smallButtonsData } from "Data/Buttons";
import { Col, Container, Row } from "reactstrap";
import { ActiveButtonsHeading, BoldBorderOutlineButtonsHeading, Buttons, DefaultButtonsHeading, DefaultStyleHeading, DisabledButtonsHeading, DisabledOutlineButtonsHeading, ExtraSmallButtonsHeading, GradientButtonsHeading, LargeButtonsHeading, OutlineButtonsHeading, OutlineExtraSmallButtonsHeading, OutlineLargeButtonsHeading, OutlineSmallButtonsHeading, SmallButtonsHeading, defaultButtonsHeadingData,LargeButtonsHeadingData,SmallButtonsHeadingData,ExtraSmallButtonsHeadingData,ActiveButtonsHeadingData,DisabledButtonsHeadingData,OutlineButtonsHeadingData,BoldBorderOutlineButtonsHeadingData,OutlineLargeButtonsHeadingData,OutlineSmallButtonsHeadingData,OutlineExtraSmallButtonsHeadingData,DisabledOutlineButtonsHeadingData,GraddienButtonsHeadingData } from "utils/Constant";

const DefaultStyle = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={DefaultStyleHeading}
        mainTitle={DefaultStyleHeading}
        parent={Buttons}
      />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <CommonButtons commonButtonsData={defaultButtonsData}  title={DefaultButtonsHeading} subTitle={defaultButtonsHeadingData} />
            <CommonButtons commonButtonsData={largeButtonsData}  title={LargeButtonsHeading} subTitle={LargeButtonsHeadingData} />
            <CommonButtons commonButtonsData={smallButtonsData}  title={SmallButtonsHeading} subTitle={SmallButtonsHeadingData} />
            <CommonButtons commonButtonsData={extraSmallButtonsData}  title={ExtraSmallButtonsHeading} subTitle={ExtraSmallButtonsHeadingData} />
            <CommonButtons commonButtonsData={activeButtonsData}  title={ActiveButtonsHeading} subTitle={ActiveButtonsHeadingData} />
            <CommonButtons commonButtonsData={disabledButtonsData}  title={DisabledButtonsHeading} subTitle={DisabledButtonsHeadingData} />
            <CustomStateButtons/>
            <CommonButtons commonButtonsData={outlineButtonsData}  title={OutlineButtonsHeading} subTitle={OutlineButtonsHeadingData} />
            <CommonButtons commonButtonsData={boldBorderOutlineButtonsData}  title={BoldBorderOutlineButtonsHeading} subTitle={BoldBorderOutlineButtonsHeadingData} />
            <CommonButtons commonButtonsData={outlineLargeButtonsData}  title={OutlineLargeButtonsHeading} subTitle={OutlineLargeButtonsHeadingData} />
            <CommonButtons commonButtonsData={outlineSmallButtonsData}  title={OutlineSmallButtonsHeading} subTitle={OutlineSmallButtonsHeadingData} />
            <CommonButtons commonButtonsData={outlineExtraSmallButtonsData}  title={OutlineExtraSmallButtonsHeading} subTitle={OutlineExtraSmallButtonsHeadingData} />
            <CommonButtons commonButtonsData={outlineDisabledButtonsData}  title={DisabledOutlineButtonsHeading} subTitle={DisabledOutlineButtonsHeadingData} />
            <CommonButtons commonButtonsData={gradientButtonsData}  title={GradientButtonsHeading} subTitle={GraddienButtonsHeadingData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DefaultStyle;
