'use client'

import React, { use } from 'react'

export default function Page({ params }: { params: Promise<{user: number}> }) {
    const resolvedParams = use(params)
    const { user }  = resolvedParams

    console.log('Who is this user here : ', user)

    return (
        <div>
            <h1>User Details</h1>
        </div>
    )
}
