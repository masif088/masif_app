import AddProjectsAndUpload from "@/components_source/app/users/EditProfile/AddProjectsAndUpload";
import EditMyProfile from "@/components_source/app/users/EditProfile/EditMyProfile";
import EditProfileForm from "@/components_source/app/users/EditProfile/EditProfileForm";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { Users, UserEdit } from "utils/Constant";

const UserEdits = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={UserEdit} mainTitle={UserEdit} parent={Users} />
      <Container fluid>
        <div className="edit-profile">
          <Row>
            <EditMyProfile />
            <EditProfileForm />
            <AddProjectsAndUpload />
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default UserEdits;
