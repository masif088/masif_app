import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Apps, SupportTicketHeading } from "utils/Constant";
import SupportTicketContainer from "@/components_source/Miscellaneous/SupportTicket";

const SupportTicket = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={SupportTicketHeading} mainTitle={SupportTicketHeading} parent={Apps}/>
      <SupportTicketContainer />
    </div>
  );
};

export default SupportTicket;
