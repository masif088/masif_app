import CommonLogo from "@/components_source/Others/authentication/common/CommonLogo";
import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import {
  CreateYourPassword,
  Done,
  EnterOTP,
  Href,
  NewPassword,
  RememberPassword,
  Resend,
  RetypePassword,
  Signin,
  havePassword,
  EnterYourMobileNumber,
  IfDontReciveOtp,
  ImgPath,
  ResetYourPassword,
  Send,
} from "utils/Constant";

const ForgetPassWord = () => {
  const [showPassWord, setShowPassWord] = useState(false);

  return (
    <div className="page-wrapper">
      <Container fluid className="p-0">
        <Row>
          <Col xs={12}>
            <div className="login-card login-dark">
              <div>
                <div>
                  <CommonLogo />
                </div>
                <div className="login-main">
                  <form
                    className="theme-form"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <h4>{ResetYourPassword}</h4>
                    <FormGroup>
                      <Label className="col-form-label">
                        {EnterYourMobileNumber}
                      </Label>
                      <Row>
                        <Col xs={4} sm={3}>
                          <Input
                            className="mb-1"
                            type="text"
                            defaultValue="+ 91"
                          />
                        </Col>
                        <Col xs={8} sm={9}>
                          <Input
                            className="mb-1"
                            type="tel"
                            defaultValue="000-000-0000"
                          />
                        </Col>
                        <Col xs={12}>
                          <div className="text-end">
                            <Button
                              color="primary"
                              className="btn-block m-t-10"
                            >
                              {Send}
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </FormGroup>
                    <div className="mt-4 mb-4">
                      <span className="reset-password-link">
                        {IfDontReciveOtp}
                        <a className="btn-link txt-danger ms-2" href={Href}>
                          {Resend}
                        </a>
                      </span>
                    </div>
                    <FormGroup>
                      <Label className="col-form-label pt-0">{EnterOTP}</Label>
                      <Row>
                        <Col>
                          <Input
                            className="text-center opt-text"
                            type="text"
                            defaultValue={"00"}
                            maxLength={2}
                          />
                        </Col>
                        <Col>
                          <Input
                            className="text-center opt-text"
                            type="text"
                            defaultValue={"00"}
                            maxLength={2}
                          />
                        </Col>
                        <Col>
                          <Input
                            className="text-center opt-text"
                            type="text"
                            defaultValue={"00"}
                            maxLength={2}
                          />
                        </Col>
                      </Row>
                    </FormGroup>
                    <h6 className="mt-4">{CreateYourPassword}</h6>
                    <FormGroup>
                      <Label className="col-form-label">{NewPassword}</Label>
                      <div className="form-input position-relative">
                        <Input
                          type={showPassWord ? "text" : "password"}
                          placeholder="*********"
                        />
                        <div className="show-hide">
                          <span
                            onClick={() => setShowPassWord(!showPassWord)}
                            className={!showPassWord ? "show" : ""}
                          />
                        </div>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label className="col-form-label">{RetypePassword}</Label>
                      <Input
                        type={showPassWord ? "text" : "password"}
                        placeholder="*********"
                      />
                    </FormGroup>
                    <FormGroup className="mb-0">
                      <div className="checkbox p-0">
                        <Input id="checkbox1" type="checkbox" />
                        <Label className="text-muted" htmlFor="checkbox1">
                          {RememberPassword}
                        </Label>
                      </div>
                      <Button
                        color="primary"
                        className="btn-block w-100"
                        type="submit"
                      >
                        {Done}
                      </Button>
                    </FormGroup>
                    <p className="mt-4 mb-0 text-center">
                      {havePassword}
                      <Link
                        className="ms-2"
                        href="/pages/authentication/sign-up-two"
                      >
                        {Signin}
                      </Link>
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

export default ForgetPassWord;
