import CommonErrorPage from "@/components_source/Others/Error/common/CommonErrorPage";

const Error404 = () => {
  return (
    <CommonErrorPage
      tittle={404}
      tittleClassName="font-danger"
      BtnClassName="btn-danger-gradien"
    />
  );
};

export default Error404;
