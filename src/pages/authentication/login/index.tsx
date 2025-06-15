import CommonLogo from "@/components_source/Others/authentication/common/CommonLogo";
import { Col, Container, Row } from "reactstrap";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { Facebook, Linkedin, Twitter } from "react-feather";
import { Button, FormGroup, Input, Label } from "reactstrap";
import {
  CreateAccount,
  DoNotAccount,
  EmailAddress,
  EnterEmailPasswordLogin,
  FacebookHeading,
  ForgotPassword,
  Password,
  RememberPassword,
  SignIn,
  SignInAccount,
  SignInWith,
  TwitterHeading,
  linkedInHeading,
} from "utils/Constant";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createClient } from "utils/supabase/client";

const Login = () => {
  const [showPassWord, setShowPassWord] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "mokhamadasif@gmail.com",
    password: "admin",
  });
  const { email, password } = formValues;
  const router = useRouter();
  const handleUserValue = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };
  const handleLogin = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        Cookies.set("token", JSON.stringify(true));
        router.push("/admin/dashboard");
        toast.success("Login successful");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error(error);
    }
  };

  const formSubmitHandle = async (event: FormEvent) => {
    event.preventDefault();
    await handleLogin();
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs={12} className="p-0">
          <div className="login-card login-dark">
            <div>
              <div>
                <CommonLogo />
              </div>
              <div className="login-main">
                <form className="theme-form" onSubmit={formSubmitHandle}>
                  <h4>{SignInAccount}</h4>
                  <p>{EnterEmailPasswordLogin}</p>
                  <FormGroup>
                    <Label className="col-form-label">{EmailAddress}</Label>
                    <Input
                      type="email"
                      required
                      placeholder="Test@gmail.com"
                      value={email}
                      name="email"
                      onChange={handleUserValue}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="col-form-label">{Password}</Label>
                    <div className="form-input position-relative">
                      <Input
                        type={showPassWord ? "text" : "password"}
                        placeholder="*********"
                        onChange={handleUserValue}
                        value={password}
                        name="password"
                      />
                      <div className="show-hide">
                        <span
                          onClick={() => setShowPassWord(!showPassWord)}
                          className={!showPassWord ? "show" : ""}
                        />
                      </div>
                    </div>
                  </FormGroup>
                  <FormGroup className="mb-0 form-group">
                    <div className="checkbox p-0">
                      <Input id="checkbox1" type="checkbox" />
                      <Label className="text-muted" htmlFor="checkbox1">
                        {RememberPassword}
                      </Label>
                    </div>
                    <Link
                      className="link"
                      href="/pages/authentication/forget-pwd"
                    >
                      {ForgotPassword}
                    </Link>
                    <div className="text-end mt-3">
                      <Button
                        color="primary"
                        className="btn-block w-100"
                        type="submit"
                      >
                        {SignIn}
                      </Button>
                    </div>
                  </FormGroup>
                  <h6 className="text-muted mt-4 or">{SignInWith}</h6>
                  <div className="social mt-4">
                    <div className="btn-showcase">
                      <a
                        className="btn btn-light"
                        href="https://www.linkedin.com/login"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {" "}
                        <Linkedin className="txt-linkedin" /> {linkedInHeading}
                      </a>
                      <a
                        className="btn btn-light"
                        href="https://twitter.com/login?lang=en"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Twitter className="txt-twitter" />
                        {TwitterHeading}
                      </a>
                      <a
                        className="btn btn-light"
                        href="https://www.facebook.com/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Facebook className="txt-fb" />
                        {FacebookHeading}
                      </a>
                    </div>
                  </div>
                  <p className="mt-4 mb-0 text-center">
                    {DoNotAccount}
                    <Link
                      className="ms-2"
                      href="/pages/authentication/register-simple"
                    >
                      {CreateAccount}
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
