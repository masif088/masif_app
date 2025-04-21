import { ImgPath } from "utils/Constant";
import { WeAreComingSoon } from "utils/Constant";
import { Container } from "reactstrap";
import CountdownData from "@/components_source/Others/comingSoon/common/CountdownData";
import Image from "next/image";

const ComingWithBgVideoContainer = () => {
  
  return (
    <Container fluid={true} className="p-0">
      <div className="comingsoon auth-bg-video">
        <video
          className="bgvideo-comingsoon"
          id="bgvid"
          poster={`${ImgPath}/other-images/coming-soon-bg.jpg`}
          playsInline
          autoPlay
          muted
          loop
        >
          <source src={"/assets/video/auth-bg.mp4"} type="video/mp4" />
        </video>
        <div className="comingsoon-inner text-center">
          <Image width={63} height={63}  src={`${ImgPath}/other-images/logo-login.png`} alt="comingSoon" />
          <h5>{WeAreComingSoon}</h5>
          <div className="countdown" id="clockdiv">
            <CountdownData />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ComingWithBgVideoContainer;
