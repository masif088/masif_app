"use client"
import CountdownData from "@/components_source/Others/comingSoon/common/CountdownData"
import Image from "next/image"
import { Container } from "reactstrap"
import { ImgPath, WeAreComingSoon } from "utils/Constant"

const ComingSoon = () => {
  return (
    <div className="page-wrapper compact-wrapper" id="pageWrapper">
      <Container fluid={true} className="p-0">
        <div className="comingsoon">
          <div className="comingsoon-inner text-center">
            <Image width={63} height={65}  src={`${ImgPath}/other-images/logo-login.png`} alt="coming soon" />
            <h5>{WeAreComingSoon}</h5>
            <div className="countdown" id="clockdiv">
              <CountdownData />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ComingSoon