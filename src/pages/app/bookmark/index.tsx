import { Card, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Apps, BookMarksHeading } from "utils/Constant";
import SideBar from "@/components_source/app/Bookmarks/SideBar";
import BookmarksTabs from "@/components_source/app/Bookmarks/BookmarksTabs";

const BookMark = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={BookMarksHeading}
        mainTitle={BookMarksHeading}
        parent={Apps}
      />
      <Container fluid={true}>
        <div className="email-wrap bookmark-wrap">
          <Row>
            <SideBar />
            <Col xl={9} md={12} className="box-col-12 xl-70">
              <div className="email-right-aside bookmark-tabcontent">
                <Card className="email-body radius-left">
                  <div className="ps-0">
                    <BookmarksTabs />
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default BookMark;
