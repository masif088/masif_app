import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {Button,Col,Container,FormGroup,Input,Label,Row,} from "reactstrap";
import {EnterYourPassword,SignIn,HaveAccount,ImgPath,RememberPassword,Unlock} from "utils/Constant";

const UnlockUser = () => {
  const [showPassWord, setShowPassWord] = useState(false);

  return (
    <div className="page-wrapper">
      <Container fluid className="p-0">
        <div className="authentication-main mt-0">
          <Row>
            <Col xs={12}>
              <div className="login-card login-dark">
                <div>
                  <div>
                    <Link className="logo" href="dashboard/default">
                      <Image width={121} height={35} className="img-fluid for-light" src={`${ImgPath}/logo/logo.png`} alt="looginpage"/>
                      <Image width={121} height={35} className="img-fluid for-dark" src={`${ImgPath}/logo/logo_dark.png`} alt="looginpage"/>
                    </Link>
                  </div>
                  <div className="login-main">
                    <form className="theme-form" onSubmit={(event) => event.preventDefault()}>
                      <h4>{Unlock}</h4>
                      <FormGroup>
                        <Label className="col-form-label">{EnterYourPassword}</Label>
                        <div className="form-input position-relative">
                        <Input type={showPassWord ? "text" : "password"} placeholder="*********" />
                          <div className="show-hide">
                            <span onClick={() => setShowPassWord(!showPassWord)}className={!showPassWord ? "show" : ""} />
                          </div>
                        </div>
                      </FormGroup>
                      <FormGroup className="mb-0">
                        <div className="checkbox p-0">
                          <Input id="checkbox1" type="checkbox" />
                          <Label className="text-muted" htmlFor="checkbox1">{RememberPassword}</Label>
                        </div>
                        <Button color="primary" className="btn-block w-100">{Unlock}</Button>
                      </FormGroup>
                      <p className="mt-4 mb-0">{HaveAccount}
                        <Link className="ms-2" href="/pages/authentication/login-simple">{SignIn}</Link>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default UnlockUser;
