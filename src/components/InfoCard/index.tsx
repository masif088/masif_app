
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import SvgIcon from './SvgIcon';
import {InfoCardProps} from "./types";


const InfoCard = ({ title, gros, total, color, icon }: InfoCardProps) => {
  return (
      <Card className="widget-1">
        <CardBody>
          <div className="widget-content">
            <div className={`widget-round ${color}`}>
              <div className="bg-round">
                <SvgIcon className="svg-fill" iconId={icon} />
                <SvgIcon className="half-circle svg-fill" iconId="halfcircle" />
              </div>
            </div>
            <div>
              <h4>{total}</h4>
              <span className="f-light">{title}</span>
            </div>
          </div>
          <div className={`font-${color} f-w-500`}>
            <i className={`icon-arrow-${gros < 0 ? 'down' : 'up'} icon-rotate me-1`} />
            <span>{`${gros < 0 ? '-' : '+'}${gros}%`}</span>
          </div>
        </CardBody>
      </Card>
  );
};

export default InfoCard;
