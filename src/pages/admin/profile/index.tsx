import AddProjectsAndUpload from "./EditProfile/AddProjectsAndUpload";
import EditMyProfile from "./EditProfile/EditMyProfile";
import EditProfileForm from "./EditProfile/EditProfileForm";
import { ProfileProvider } from "./EditProfile/ProfileProvider";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { Users, UserEdit } from "utils/Constant";

const UserEdits = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={UserEdit} mainTitle={UserEdit} parent={Users} />
      <Container fluid>
        <ProfileProvider>
          <div className="edit-profile">
            <Row>
              <EditMyProfile />
              <EditProfileForm />
              {/* <AddProjectsAndUpload /> */}
            </Row>
          </div>
        </ProfileProvider>
      </Container>
    </div>
  );
};

export default UserEdits;
