import { useState, useCallback, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import Spinner from '@/components/ui/Spinner'
import { CgCodeSlash, CgCode, CgCopy } from 'react-icons/cg'
import { HiCheck } from 'react-icons/hi'
import CodeBox from './CodeBox'
import axios from 'axios'

export interface CardFooterProps {
    mdPath: string
    mdName: string
    mdPrefixPath?: string
}

const CardFooter = (props: CardFooterProps) => {
    const { mdPath, mdName, mdPrefixPath = 'ui-components' } = props

    const [expand, setExpand] = useState(false)
    const [markdown, setMarkdown] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [loadingMd, setLoadingMd] = useState(false)

    const onExpand = useCallback(() => {
        setExpand(!expand)
    }, [expand])

    const fetchMd = async () => {
        setLoadingMd(true)

        try {
            const resp = await axios.get('/api/md', {
                params: {
                    mdPath,
                    mdName,
                    mdPrefixPath,
                },
            })

            setMarkdown(resp.data.content)
            setLoadingMd(false)
        } catch (error) {
            console.log(error)
            setLoadingMd(false)
        }
    }

    useEffect(() => {
        if (expand && !markdown) {
            fetchMd()
        }
        if (copied && markdown) {
            navigator.clipboard.writeText(markdown.replace(/```jsx|```/g, ''))
            if (copied) {
                const copyFeedbackInterval = setTimeout(
                    () => setCopied(false),
                    3000,
                )

                return () => {
                    clearTimeout(copyFeedbackInterval)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mdPath, expand, copied])

    const onCodeCopy = async () => {
        if (!markdown) {
            await fetchMd()
        }
        setCopied(true)
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>{loadingMd && <Spinner />}</div>
                <div>
                    <Tooltip
                        title={copied ? 'Copied' : 'Copy Code'}
                        wrapperClass="mr-1"
                    >
                        <Button
                            variant="plain"
                            shape="circle"
                            size="xs"
                            icon={
                                copied ? (
                                    <HiCheck className="text-emerald-500" />
                                ) : (
                                    <CgCopy />
                                )
                            }
                            onClick={onCodeCopy}
                        />
                    </Tooltip>
                    <Tooltip title={expand ? 'Hide Code' : 'Show Code'}>
                        <Button
                            variant="plain"
                            shape="circle"
                            size="xs"
                            icon={expand ? <CgCode /> : <CgCodeSlash />}
                            onClick={() => onExpand()}
                        />
                    </Tooltip>
                </div>
            </div>
            <div className={expand ? 'block' : 'hidden'}>
                <CodeBox markdown={markdown as string} />
            </div>
        </div>
    )
}

export default CardFooter
