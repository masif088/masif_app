
import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { GoogleMaps, Maps } from "utils/Constant";

const GoogleMap = () => {
  const GoogleMapsContainer = dynamic(() => import('@/components_source/Miscellaneous/maps/GoogleMaps'), { ssr: false });
  return (
    <div className="page-body">
      <Breadcrumbs title={GoogleMaps} mainTitle={GoogleMaps} parent={Maps} />
      <GoogleMapsContainer />
    </div>
  );
};

export default GoogleMap;
