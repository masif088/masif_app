import CollapesAccordion from '@/components_source/Ui-kits/Accordion/CollapesAccordion'
import FlushAccordion from '@/components_source/Ui-kits/Accordion/FlushAccordion'
import HorizontalAccordion from '@/components_source/Ui-kits/Accordion/HorizontalAccordion'
import IconAccordion from '@/components_source/Ui-kits/Accordion/IconAccordion'
import MultipleCollapes from '@/components_source/Ui-kits/Accordion/MultipleCollaps'
import OutlineAccordion from '@/components_source/Ui-kits/Accordion/OutlineAccordion'
import SimpleAccordion from '@/components_source/Ui-kits/Accordion/SimpleAccordion'
import CryptoAnnotations from '@/components_source/widgets/Chart/CryptoAnnotations'
import CryptocurrencyPrices from '@/components_source/widgets/Chart/CryptocurrencyPrices'
import Finance from '@/components_source/widgets/Chart/Finance'
import LiveProducts from '@/components_source/widgets/Chart/LiveProducts'
import MonthlySales from '@/components_source/widgets/Chart/MonthlySales'
import OrderStatus from '@/components_source/widgets/Chart/OrderStatus'
import OrderStatus2 from '@/components_source/widgets/Chart/OrderStatus2'
import SkillStatus from '@/components_source/widgets/Chart/SkillStatus'
import StockMarket from '@/components_source/widgets/Chart/StockMarket'
import Turnover from '@/components_source/widgets/Chart/Turnover'
// import Uses from '@/components_source/widgets/Chart/Uses'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import dynamic from 'next/dynamic'
import { Container, Row } from 'reactstrap'

const Chart = () => {
const MonthlyHistory = dynamic(() => import('@/components_source/widgets/Chart/MonthlyHistory'), { ssr: false });
const TotalSale = dynamic(() => import('@/components_source/widgets/Chart/TotalSale'), { ssr: false });
const TotalProject = dynamic(() => import('@/components_source/widgets/Chart/TotalProject'), { ssr: false });
const TotalProduct = dynamic(() => import('@/components_source/widgets/Chart/TotalProduct'), { ssr: false });
const LiveProducts = dynamic(() => import('@/components_source/widgets/Chart/LiveProducts'), { ssr: false });
const SkillStatus = dynamic(() => import('@/components_source/widgets/Chart/SkillStatus'), { ssr: false });
const Turnover = dynamic(() => import('@/components_source/widgets/Chart/Turnover'), { ssr: false });
const OrderStatus = dynamic(() => import('@/components_source/widgets/Chart/OrderStatus'), { ssr: false });
const Uses = dynamic(() => import('@/components_source/widgets/Chart/Uses'), { ssr: false });
const CryptoAnnotations = dynamic(() => import('@/components_source/widgets/Chart/CryptoAnnotations'), { ssr: false });
const CryptocurrencyPrices = dynamic(() => import('@/components_source/widgets/Chart/CryptocurrencyPrices'), { ssr: false });
const Finance = dynamic(() => import('@/components_source/widgets/Chart/Finance'), { ssr: false });
const MonthlySales = dynamic(() => import('@/components_source/widgets/Chart/MonthlySales'), { ssr: false });
const OrderStatus2 = dynamic(() => import('@/components_source/widgets/Chart/OrderStatus2'), { ssr: false });
const StockMarket = dynamic(() => import('@/components_source/widgets/Chart/StockMarket'), { ssr: false });
// const StockMarket = dynamic(() => import('@/components_source/widgets/Chart/StockMarket'), { ssr: false });

    return (
        <div className='page-body'>
            <Breadcrumbs title='Chart' mainTitle='Chart' parent='Widgets' />
            <Container fluid={true} className='chart-widget'>
                <Row>
                    <TotalSale/>
                    <TotalProject/>
                    <TotalProduct/>
                </Row>
                <Row>
                    <MonthlyHistory />
                    <SkillStatus />
                    <OrderStatus />
                </Row>
                <Row>
                    <LiveProducts/>
                    <Turnover/>
                    <CryptocurrencyPrices/>
                    <CryptoAnnotations/>
                </Row>
                <Row>
                    <StockMarket/>
                    <Finance/>
                    <OrderStatus2 />
                    <MonthlySales />
                    <Uses />
                </Row>
            </Container>
        </div>
    )
}

export default Chart