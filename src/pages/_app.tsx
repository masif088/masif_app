import "../../public/assets/scss/app.scss";
import { useRouter } from "next/router";
import { withoutLayoutThemePath } from "Data/OthersPageData";
import { ToastContainer } from "react-toastify";
import { ProjectProvider } from "helper/project/ProjectProvider";
import "../../i18n";
import { TaskProvider } from "helper/Task/TaskProvider";
import "../../public/assets/scss/app.scss";
import LayoutProvider from "helper/Layout/LayoutProvider";
import Layout from "../layout";
import { BookmarkProvider } from "helper/Bookmark/BookmarkProvider";
import { CustomizerProvider } from "helper/Customizer/CustomizerProvider";
import TodoListProvider from "helper/TodoList/TodoListProvider";
import ContactProvider from "helper/Contacts/ContactProvider";
import NoSsr from "utils/NoSsr";
import { AuthProvider } from "../contexts/AuthContext";
import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-layouts/styles/material.css';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-gantt/styles/material.css';
import '@syncfusion/ej2-kanban/styles/material.css';

// import '@syncfusion/ej2-base/styles/material.css';  
// import '@syncfusion/ej2-buttons/styles/material.css';  
// import '@syncfusion/ej2-calendars/styles/material.css';  
// import '@syncfusion/ej2-dropdowns/styles/material.css';  
// import '@syncfusion/ej2-inputs/styles/material.css';
// import '@syncfusion/ej2-navigations/styles/material.css';
// import '@syncfusion/ej2-lists/styles/material.css';
// import '@syncfusion/ej2-layouts/styles/material.css';
// import '@syncfusion/ej2-popups/styles/material.css';
// import '@syncfusion/ej2-splitbuttons/styles/material.css';
// import '@syncfusion/ej2-grids/styles/material.css';
// import '@syncfusion/ej2-richtexteditor/styles/material.css';
// import '@syncfusion/ej2-treegrid/styles/material.css';
// import '@syncfusion/ej2-react-gantt/styles/material.css';




const Myapp = ({ Component, pageProps }: any) => {
  const getLayout =Component.getLayout || ((page: any) => <Layout>{page}</Layout>);
  const router = useRouter();
  const currentUrl = router.asPath;
  let updatedPath;
  if(currentUrl.includes("?")){
    const tempt=currentUrl
     updatedPath=tempt.split("?")[0]
  }else{
    updatedPath=currentUrl
  }
  // registerLicense('MzkwNjY1MUAzMjMxMmUzMDJlMzBNNFYwK2FTMFNWcWFNNHA5T2d0QU9hL3BIdWU4MXRQMmF3ZFA0M3pFY2tjPQ==;MzkwNjY1MkAzMjMxMmUzMDJlMzBrSHQxdXUrYm5rVnJGU3hQVXFEclU3aTNBdTRRTFBJTE5OVjRNeVYySU44PQ==;Mgo+DSMBPh8sVXJ1S0R+XVFPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9mSXhSc0VqWn9ceXxVTmZXU0U=;ORg4AjUWIQA/Gnt2VFhiQlBEfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5Vd0BjUHxecn1dQmBfWkZ3;NRAiBiAaIQQuGjN/V0d+Xk9FdlRDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS3tTcERmWXZdcHdVRmFfUE90Xg==;MzkwNjY1NkAzMjMxMmUzMDJlMzBWMmRIdDE5eXdvT0FzamZodHNMNStrUGxpMzIrQ0g4QlU3cithcW1pS09VPQ==;MzkwNjY1N0AzMjMxMmUzMDJlMzBYa1lRNkMyV1g4cEhGRnhiVXhnS2hjSVREZk1aalRQQUdqMDRJZnZ6ZHVNPQ==;Mgo+DSMBMAY9C3t2VFhiQlBEfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5Vd0BjUHxec3RXQGNbWkZ3;MzkwNjY1OUAzMjMxMmUzMDJlMzBqSnJTUUFaYjNyYm5UVExseHNiM1NRMGlGSm1KNExaV1lRNmQwcDJ6Tms4PQ==;MzkwNjY2MEAzMjMxMmUzMDJlMzBCWld6YkY4VjUzY29qSWJDM1B2QmJBLzR6djk1RXhpNzRETEdkcmdEcUI4PQ==;MzkwNjY2MUAzMjMxMmUzMDJlMzBWMmRIdDE5eXdvT0FzamZodHNMNStrUGxpMzIrQ0g4QlU3cithcW1pS09VPQ==');

  // Ngo9BigBOggjHTQxAR8/V1JEaF5cXmRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXlceHZVRGNfUkBwXEZWYEk=
  //  registerLicense('Ngo9BigBOggjHTQxAR8/V1JEaF5cXmRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXlceHZVRGNfUkBwXEZWYEk=');
  registerLicense('ORg4AjUWIQA/Gnt3VVhhQlJDfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5VdE1hWXxfcHBcQWZfWkd2')
  return (
    <NoSsr>
      <AuthProvider>
        {withoutLayoutThemePath.includes(updatedPath) ? (
          <Component {...pageProps} />
        ) : (
          <CustomizerProvider>
            <TodoListProvider>
              <ProjectProvider>
                <LayoutProvider>
                  <TaskProvider>
                    <BookmarkProvider>
                      <ContactProvider>
                        {getLayout(<Component {...pageProps} />)}
                      </ContactProvider>
                    </BookmarkProvider>
                  </TaskProvider>
                </LayoutProvider>
              </ProjectProvider>
            </TodoListProvider>
          </CustomizerProvider>
        )}
        <ToastContainer />
      </AuthProvider>
    </NoSsr>
  );
};

export default Myapp;
