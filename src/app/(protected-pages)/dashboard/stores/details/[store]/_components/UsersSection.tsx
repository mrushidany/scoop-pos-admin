'use client'

import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
} from '@tanstack/react-table'
import type { Users } from '../../../types'

type UsersSectionProps = {
    data?: Users[]
}

const { Tr, Td, Th, TBody, THead } = Table

const columnHelper = createColumnHelper<Users>()

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
    columnHelper.accessor('email', {
        header: 'Email',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.email}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.phone}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('role', {
        header: 'Role',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.phone}</span>
                </div>
            )
        },
    }),

]

const UsersSection = ({ data }: UsersSectionProps) => {
    console.log('What is the data here : ', data)
    
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <h6 className='mb-4'>Store user details</h6>
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

export default UsersSection

