import React from 'react';
import { Button, Card, CardBody, Col, Media } from 'reactstrap';
import ClockMain from './Clock';
import { GreetingCardProps } from './types';

const GreetingCard = ({ welcomeTitle, welcomeText, whatsNewText, imgPath,linkText }: GreetingCardProps) => {
  return (
      <Col xl={4} sm={6} className="box-col-6">
        <Card className="profile-box">
          <CardBody>
            <Media className="media-wrapper justify-content-between">
              <Media body>
                <div className="greeting-user">
                  <h4 className="f-w-600">{welcomeTitle}</h4>
                  <p>{welcomeText}</p>
                  <div className="whatsnew-btn">
                    <a color="" target='_blank'  className="btn btn-outline-white" href={linkText}>
                      {whatsNewText}
                    </a>
                  </div>
                </div>
              </Media>
              <ClockMain />
              <div className="cartoon">
                <img
                    className="img-fluid"
                    src={`${imgPath}/dashboard/cartoon.svg`}
                    alt="vector women with laptop"
                />
              </div>
            </Media>
          </CardBody>
        </Card>
      </Col>
  );
};

export default GreetingCard;
