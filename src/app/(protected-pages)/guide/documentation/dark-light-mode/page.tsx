import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Page = () => {
    return (
        <>
            <p>
                To initialize dark or light mode to the app, simply set{' '}
                <code>mode</code> field as
                <code>&apos;light&apos;</code> or <code>&apos;dark&apos;</code>{' '}
                in <code>src/configs/theme.config.ts</code>. For example:
            </p>
            <SyntaxHighlighter language="ts">{`export const themeConfig = {
    ...
    mode: 'dark'
}`}</SyntaxHighlighter>
            <div className="mt-10" id="hook">
                <h5>Hook</h5>
                <p className="mt-1">
                    You can access or update the mode in a component via our
                    prepared hook.
                </p>
                <SyntaxHighlighter language="tsx">{`'use client'

import useTheme from '@/utils/hooks/useTheme'
import Switcher from '@/components/ui/Switcher'

const ModeSwitcher = () => {

    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    const onSwitchChange = (checked: boolean) => {
        setMode(checked ? 'dark' : 'light')
    }
    
    return (
        <div>
            <Switcher
                defaultChecked={mode === 'dark'}
                onChange={onSwitchChange}
            />
        </div>
    )
}

export default ModeSwitcher
`}</SyntaxHighlighter>
            </div>
        </>
    )
}

export default Page
