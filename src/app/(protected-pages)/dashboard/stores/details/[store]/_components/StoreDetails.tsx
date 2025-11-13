'use client'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import type { StoreDetails } from '../../../types'
import ProfileSection from './ProfileSection'
import DevicesSection from './DevicesSection'
import UsersSection from './UsersSection'

type StoreDetailsProps = {
    data: StoreDetails
}

const { TabNav, TabList, TabContent } = Tabs

const StoreDetails = ({ data }: StoreDetailsProps) => {
    console.log('What is the data here : ', data)
    return (
        <div className='flex flex-col xl:flex-row gap-4'>
            <div className='min-w-[330px] 2xl:min-w-[400px]'>
                <ProfileSection data={data} />
            </div>
            <Card className='w-full'>
                <Tabs defaultValue='users'>
                    <TabList>
                        <TabNav value='users'>Users</TabNav>
                        <TabNav value='devices'>Devices</TabNav>
                    </TabList>
                    <div className='p-4'>
                        <TabContent value='users'>
                            <UsersSection data={data.data?.users} />
                        </TabContent>
                        <TabContent value='devices'>
                            <DevicesSection data={data.data?.devices} />
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default StoreDetails
 