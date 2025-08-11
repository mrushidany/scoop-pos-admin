import Overview from './_components/Overview'
import RecentOrder from './_components/RecentOrder'
import getEcommerceDashboard from '@/server/actions/getEcommerceDashboard'

export default async function Page() {
    const data = await getEcommerceDashboard()
    return (
        <div>
            <div className='flex flex-col gap-4 max-w-full overflow-x-hidden'>
                <div className='flex flex-col xl:flex-row gap-4'>
                    <div className='flex flex-col gap-4 flex-1 xl:col-span-3'>
                        <Overview data={data.statisticData} />
                    </div>
                </div>
                <RecentOrder data={data.recentOrders} />
            </div>
        </div>
    )
}
