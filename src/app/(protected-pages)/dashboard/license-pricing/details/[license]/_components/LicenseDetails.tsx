'use client'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import type { LicensePricingDetail } from '../../../types'
import ProfileSection from './ProfileSection'
import Tag from '@/components/ui/Tag'
import formatLabel from '@/utils/formatLabel'

type LicenseDetailsProps = {
    data: LicensePricingDetail
}

const { TabNav, TabList, TabContent } = Tabs

const LicenseDetails = ({ data }: LicenseDetailsProps) => {
    return (
        <div className='flex flex-col xl:flex-row gap-4'>
            <div className='min-w-[330px] 2xl:min-w-[400px]'>
                <ProfileSection data={data} />
            </div>
            <Card className='w-full'>
                <Tabs defaultValue='included'>
                    <TabList>
                        <TabNav value='included'>Included Features</TabNav>
                        <TabNav value='excluded'>Excluded Features</TabNav>
                    </TabList>
                    <div className='p-4'>
                        <TabContent value='included'>
                            <div className='flex flex-wrap gap-2 mt-4'>
                                {data.data?.included_features.map((feature, index) => (
                                    <Tag className='text-white bg-[#4F39F6] border-0' key={index}>{formatLabel(feature)}</Tag>
                                ))}
                            </div>
                        </TabContent>
                        <TabContent value='excluded'>
                            <div className='flex flex-wrap gap-2 mt-4'>
                                {data.data?.excluded_features.map((feature, index) => (
                                    <Tag className='text-white bg-[#4F39F6] border-0' key={index}>{formatLabel(feature)}</Tag>
                                ))}
                            </div>
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default LicenseDetails
 