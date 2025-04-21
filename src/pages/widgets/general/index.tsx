import CalenderCard from '@/components_source/widgets/general/CalenderCard';
import CourseBox from '@/components_source/widgets/general/CourseBox';
import TotalUserAndFollower from '@/components_source/widgets/general/TotalUserAndFollower';
import YourBalanceCard from '@/components_source/widgets/general/YourBalanceCard';
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import dynamic from 'next/dynamic';
import { Container, Row } from 'reactstrap'

const General = () => {
   const CurrenciesWidget = dynamic(() => import('@/components_source/widgets/general/CurrenciesWidget'), { ssr: false });
   const RadialProgress = dynamic(() => import('@/components_source/widgets/general/RadialProgress'), { ssr: false });
   const SalesReport = dynamic(() => import('@/components_source/widgets/general/SalesReport'), { ssr: false });
   const SmallWidgets = dynamic(() => import('@/components_source/widgets/general/SmallWidgets'), { ssr: false });
   const SocialWidgets = dynamic(() => import('@/components_source/widgets/general/SocialWidgets'), { ssr: false });
   const VisitorsCard = dynamic(() => import('@/components_source/widgets/VisitorsCard'), { ssr: false });

    return (
        <div className='page-body'>
            <Breadcrumbs title='General' mainTitle='General' parent='Widgets' />
            <Container fluid={true}>
                <Row>
                    <CurrenciesWidget/>
                    <RadialProgress/>
                    <SalesReport/>
                    <CourseBox/>
                    <TotalUserAndFollower/>
                    <VisitorsCard/>
                    <SocialWidgets/>
                    <SmallWidgets/>
                    <YourBalanceCard/>
                    <CalenderCard />    
                </Row>
            </Container>
        </div>
    )
}

export default General