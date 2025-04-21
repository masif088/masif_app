import UserCardsContainer from "@/components_source/app/users/UserCards";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Users, UserCards } from "utils/Constant";

const UserCard = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={UserCards} mainTitle={UserCards} parent={Users}/>
      <UserCardsContainer/>
    </div>
  );
};

export default UserCard;
