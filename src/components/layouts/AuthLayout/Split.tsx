'use client'

import { cloneElement, useEffect, useMemo, useState } from 'react'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

interface SplitProps extends CommonProps {
    content?: ReactNode
}

const Split = ({ children, content, ...rest }: SplitProps) => {
    const images = useMemo(
        () => [
            '/img/auth/number1.png',
            '/img/auth/number2.png',
            '/img/auth/number3.png',
            '/img/auth/number4.png',
        ],
        [],
    )

    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length)
        }, 3000) // change image every 3s
        return () => clearInterval(interval)
    }, [images.length])

    return (
        <div className='grid lg:grid-cols-2 h-full p-6 bg-white dark:bg-gray-800'>
            <div className='hidden lg:flex rounded-3xl relative overflow-hidden'>
                {images.map((src, idx) => (
                    <div
                        key={src}
                        className='absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-700'
                        style={{
                            backgroundImage: `url(${src})`,
                            opacity: current === idx ? 1 : 0,
                        }}
                    />
                ))}
                <div className='absolute inset-0 bg-black opacity-50' />
            </div>
            <div className='flex flex-col justify-center items-center '>
                <div className='w-full xl:max-w-[450px] px-8 max-w-[380px]'>
                    <div className='mb-8'>{content}</div>
                    {children
                        ? cloneElement(children as ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Split
