'use client'

import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
} from '@tanstack/react-table'
import type { UserDetails } from '../../../types'

type StoreRow = NonNullable<UserDetails['data']['stores']>[number]

type StoreSectionProps = {
    data?: StoreRow[]
}

const { Tr, Td, Th, TBody, THead } = Table

const columnHelper = createColumnHelper<StoreRow>()

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
    columnHelper.accessor('license_type', {
        header: 'License Type',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.license_type}</span>
                </div>
            )
        },
    })
]

const StoreSection = ({ data }: StoreSectionProps) => {
    console.log('What is the data here : ', data)
    
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <h6 className='mb-4'>Store Details</h6>
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

export default StoreSection

