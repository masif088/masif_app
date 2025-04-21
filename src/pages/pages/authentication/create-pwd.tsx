import CommonLogo from "@/components_source/Others/authentication/common/CommonLogo";
import Link from "next/link";
import { useState } from "react";
import {Button,Col,Container,FormGroup,Input,Label,Row,} from "reactstrap";
import {CreateAccount,CreateYourPassWord,DoNotAccount,Done,NewPassword,RememberPassword,RetypePassword} from "utils/Constant";

const CreatePassword = () => {
  const [showPassWord, setShowPassWord] = useState(false);

  return (
    <div className="page-wrapper">
      <Container fluid className="p-0">
        <Row>
          <Col xs={12}>
            <div className="login-card login-dark">
              <div>
                <div><CommonLogo /></div>
                <div className="login-main">
                  <form className="theme-form" onSubmit={(event) => event.preventDefault()}>
                    <h4>{CreateYourPassWord}</h4>
                    <FormGroup>
                      <Label className="col-form-label">{NewPassword}</Label>
                      <div className="form-input position-relative">
                        <Input type={showPassWord ? "text" : "password"} placeholder="*********"/>
                        <div className="show-hide">
                          <span onClick={() => setShowPassWord(!showPassWord)} className={!showPassWord ? "show" : ""}/>
                        </div>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label className="col-form-label">{RetypePassword}</Label>
                      <Input type="password" required placeholder="*********" />
                    </FormGroup>
                    <FormGroup className="mb-0">
                      <div className="checkbox p-0">
                        <Input id="checkbox1" type="checkbox" />
                        <Label className="text-muted" htmlFor="checkbox1">{RememberPassword}</Label>
                      </div>
                      <Button color="primary" className="btn-block w-100">{Done}</Button>
                    </FormGroup>
                    <p className="mt-4 mb-0 text-center">{DoNotAccount}
                      <Link className="ms-2" href="/pages/authentication/register-simple">{CreateAccount}</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreatePassword;
