'use client'

import Card from '@/components/ui/Card'
import type { TelecomOperatorDetails } from '../../../types'
import ProfileSection from './ProfileSection'

type OperatorDetailsProps = {
    data: TelecomOperatorDetails
}

const OperatorDetails = ({ data }: OperatorDetailsProps) => {

    return (
        <div className='flex flex-col xl:flex-row gap-4'>
            <div className='min-w-[330px] 2xl:min-w-[400px]'>
                <ProfileSection data={data} />
            </div>
            <Card className='w-full'>
                
            </Card>
        </div>
    )
}

export default OperatorDetails
 