'use client'

import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
} from '@tanstack/react-table'
import type { Devices } from '../../../types'
import capitalize from '@/components/ui/utils/capitalize'
import Tag from '@/components/ui/Tag'

type StoreSectionProps = {
    data?: Devices[]
}

const { Tr, Td, Th, TBody, THead } = Table

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const columnHelper = createColumnHelper<Devices>()

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.name}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('platform', {
        header: 'Platform',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{capitalize(row.platform)}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('os_version', {
        header: 'OS Version',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.os_version}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('is_active', {
        header: 'Status',
        cell: (props) => {
            return <Tag className={statusColor[props.row.original.is_active ? 'active' : 'blocked']}>
                        <span className='capitalize'>{props.row.original.is_active ? 'Active' : 'In Active'}</span>
                    </Tag>  
        },
    })
]

const DevicesSection = ({ data }: StoreSectionProps) => {    
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <h6 className='mb-4'>Store devices details</h6>
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table
                        .getRowModel()
                        .rows.slice(0, 10)
                        .map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        )
                                    })}
                                </Tr>
                            )
                        })   
                    }
                </TBody>
            </Table>
        </>
    )
}

export default DevicesSection

