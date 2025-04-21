import Breadcrumbs from "CommonElements/Breadcrumbs";
import { FC, useEffect, useState } from "react";
import { Maps, leafletMaps } from "utils/Constant";

const LeafletMap = () => {
  const [LeafletMapContainer, setLeafletMapContainer] = useState<FC | null>(null);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        const newClient = (
          await import("@/components_source/Miscellaneous/maps/LeafletMap")
        ).default;
        setLeafletMapContainer(() => newClient);
      }
    })();
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs title={leafletMaps} mainTitle={leafletMaps} parent={Maps} />
      {LeafletMapContainer ? <LeafletMapContainer /> : ""}
    </div>
  );
};

export default LeafletMap;
