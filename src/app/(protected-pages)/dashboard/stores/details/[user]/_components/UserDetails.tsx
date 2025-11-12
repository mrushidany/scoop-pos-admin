'use client'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import type { UserDetails } from '../../../types'
import ProfileSection from './ProfileSection'
import StoreSection from './StoreSection'

type UserDetailsProps = {
    data: UserDetails
}

const { TabNav, TabList, TabContent } = Tabs

const UserDetails = ({ data }: UserDetailsProps) => {
    return (
        <div className='flex flex-col xl:flex-row gap-4'>
            <div className='min-w-[330px] 2xl:min-w-[400px]'>
                <ProfileSection data={data} />
            </div>
            <Card className='w-full'>
                <Tabs defaultValue='stores'>
                    <TabList>
                        <TabNav value='stores'>Stores</TabNav>
                    </TabList>
                    <div className='p-4'>
                        <TabContent value='stores'>
                            <StoreSection data={data.data?.stores} />
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default UserDetails
 