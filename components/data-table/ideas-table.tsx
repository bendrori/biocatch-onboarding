"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ScoreBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SignalIdea } from "@/lib/types";
import { Check, Code, FileText, FlaskConical, X } from "lucide-react";

interface IdeasTableProps {
  ideas: SignalIdea[];
  actionLoading: string | null;
  onSelect: (idea: SignalIdea) => void;
  onApprove: (idea: SignalIdea) => void;
  onReject: (idea: SignalIdea) => void;
  onGeneratePoc: (idea: SignalIdea) => void;
  onRunValidation: (idea: SignalIdea) => void;
  onGenerateRfc: (idea: SignalIdea) => void;
}

export function IdeasTable({
  ideas,
  actionLoading,
  onSelect,
  onApprove,
  onReject,
  onGeneratePoc,
  onRunValidation,
  onGenerateRfc,
}: IdeasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<SignalIdea>[]>(
    () => [
      {
        accessorKey: "score",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Score
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3.5 w-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            )}
          </Button>
        ),
        cell: ({ row }) => <ScoreBadge score={row.original.score} />,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div>
            <p className="font-medium leading-snug">{row.original.title}</p>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              {row.original.signalType} · {row.original.expectedValue}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "platforms",
        header: "Platform",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.platforms.map((p) => (
              <Badge key={p} variant="secondary" className="text-[10px] font-normal">
                {p}
              </Badge>
            ))}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "collectionLayer",
        header: "Layer",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.collectionLayer}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const idea = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={actionLoading === idea.id}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Row actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {idea.status === "pending_review" && (
                  <>
                    <DropdownMenuItem onClick={() => onApprove(idea)}>
                      <Check className="mr-2 h-4 w-4" /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReject(idea)}>
                      <X className="mr-2 h-4 w-4" /> Reject
                    </DropdownMenuItem>
                  </>
                )}
                {idea.status === "approved" && (
                  <DropdownMenuItem onClick={() => onGeneratePoc(idea)}>
                    <Code className="mr-2 h-4 w-4" /> Generate PoC
                  </DropdownMenuItem>
                )}
                {(idea.status === "poc_in_progress" || idea.status === "approved") && (
                  <DropdownMenuItem onClick={() => onRunValidation(idea)}>
                    <FlaskConical className="mr-2 h-4 w-4" /> Run Validation
                  </DropdownMenuItem>
                )}
                {(idea.status === "validated" || idea.status === "validating") && (
                  <DropdownMenuItem onClick={() => onGenerateRfc(idea)}>
                    <FileText className="mr-2 h-4 w-4" /> Generate RFC
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
      },
    ],
    [actionLoading, onApprove, onReject, onGeneratePoc, onRunValidation, onGenerateRfc]
  );

  const table = useReactTable({
    data: ideas,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter signals..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm h-9"
        aria-label="Filter signal ideas"
      />
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader className="sticky top-0 z-[1] bg-card">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No matching signals.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
