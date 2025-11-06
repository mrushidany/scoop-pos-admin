'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignIn from '@/components/auth/SignIn'
import type { OnSignInPayload } from '@/components/auth/SignIn'
import { useAuthStore } from '@/store/auth'
import sleep from '@/utils/sleep'

const SignInClient = () => {
    const router = useRouter()
    const { login, isLoading, error, success, clearMessages } = useAuthStore()
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleSignIn = async ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignInPayload) => {
        setSubmitting(true)
        clearMessages()

        try {
            const result = await login(values.email, values.password)
            if(result.success) {
                setIsRedirecting(true)
                await sleep(1000)
                router.refresh()
            } else {
                setSubmitting(false)
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Failed to sign in')
            setSubmitting(false)   
        }
    }

    return (
        <SignIn 
            onSignIn={handleSignIn} 
            isLoading={isLoading || isRedirecting}
            error={error}
            success={success}
        />
    )
}

export default SignInClient
