import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import MarkjecnoBlog from "@/components_source/Miscellaneous/Blog/BlogDetails/MarkjencoBlog";
import BlogWithDetails from "@/components_source/Miscellaneous/Blog/BlogDetails/BlogWithDetails";
import BlogWithoutDetails from "@/components_source/Miscellaneous/Blog/BlogDetails/BlogWithoutDetails";
import { Blog, BlogDetailsHeading } from "utils/Constant";

const BlogDetails = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={BlogDetailsHeading} mainTitle={BlogDetailsHeading} parent={Blog}/>
      <Container fluid={true} className="blog-list-items">
        <Row>
          <MarkjecnoBlog />
          <BlogWithDetails />
          <BlogWithoutDetails />
        </Row>
      </Container>
    </div>
  );
};

export default BlogDetails;
