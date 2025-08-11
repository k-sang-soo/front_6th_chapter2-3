import { HTMLAttributes, Ref } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  ref?: Ref<HTMLTableElement>;
  className?: string;
}

// 테이블 컴포넌트
export const Table = ({ ref, className, ...props }: TableProps) => {
  return (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`table-fixed w-full caption-bottom text-sm ${className}`}
        {...props}
      />
    </div>
  );
};
Table.displayName = 'Table';

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
  className?: string;
}

export const TableHeader = ({ ref, className, ...props }: TableHeaderProps) => {
  return <thead ref={ref} className={`[&_tr]:border-b ${className}`} {...props} />;
};
TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
  className?: string;
}

export const TableBody = ({ ref, className, ...props }: TableBodyProps) => {
  return <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
};
TableBody.displayName = 'TableBody';

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
  className?: string;
}

export const TableRow = ({ ref, className, ...props }: TableRowProps) => {
  return (
    <tr
      ref={ref}
      className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted h-14 ${className}`}
      {...props}
    />
  );
};
TableRow.displayName = 'TableRow';

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
  className?: string;
}

export const TableHead = ({ ref, className, ...props }: TableHeadProps) => {
  return (
    <th
      ref={ref}
      className={`h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
};
TableHead.displayName = 'TableHead';

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
  className?: string;
}

export const TableCell = ({ ref, className, ...props }: TableCellProps) => {
  return (
    <td
      ref={ref}
      className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
};
TableCell.displayName = 'TableCell';
