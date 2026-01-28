'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ChevronDownIcon,
  Loader2Icon,
  CheckIcon,
  XIcon,
  ClockIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import type { ToolUIPart } from 'ai';

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn('not-prose mb-4', className)}
    {...props}
  />
);

export type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied';

const getStateConfig = (state: ToolState) => {
  switch (state) {
    case 'input-streaming':
      return { label: 'Pending', icon: ClockIcon, variant: 'secondary' as const };
    case 'input-available':
      return { label: 'Running', icon: Loader2Icon, variant: 'default' as const };
    case 'approval-requested':
      return { label: 'Awaiting Approval', icon: ClockIcon, variant: 'outline' as const };
    case 'approval-responded':
      return { label: 'Responded', icon: CheckIcon, variant: 'secondary' as const };
    case 'output-available':
      return { label: 'Completed', icon: CheckIcon, variant: 'default' as const };
    case 'output-error':
      return { label: 'Error', icon: XIcon, variant: 'destructive' as const };
    case 'output-denied':
      return { label: 'Denied', icon: XIcon, variant: 'outline' as const };
    default:
      return { label: 'Unknown', icon: ClockIcon, variant: 'secondary' as const };
  }
};

export type ToolHeaderProps = Omit<ComponentProps<typeof CollapsibleTrigger>, 'type'> & {
  type: ToolUIPart['type'] | string;
  state: ToolUIPart['state'] | ToolState;
  title?: string;
  toolName?: string;
};

export const ToolHeader = ({
  className,
  type,
  state,
  title,
  toolName,
  children,
  ...props
}: ToolHeaderProps) => {
  const config = getStateConfig(state as ToolState);
  const Icon = config.icon;
  const displayName = title || toolName || type.replace('tool-', '');

  return (
    <CollapsibleTrigger
      className={cn(
        'flex w-full items-center justify-between gap-2 text-left text-sm',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} className="gap-1">
              {state === 'input-available' && (
                <Icon className="size-3 animate-spin" />
              )}
              {state !== 'input-available' && <Icon className="size-3" />}
              {config.label}
            </Badge>
            <span className="text-muted-foreground font-medium">
              {displayName}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              'group-data-[state=open]:rotate-180'
            )}
          />
        </>
      )}
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({
  className,
  ...props
}: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      'mt-2',
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<'div'> & {
  input?: ToolUIPart['input'];
};

export const ToolInput = ({
  className,
  input,
  children,
  ...props
}: ToolInputProps) => {
  if (!input && !children) return null;

  return (
    <div
      className={cn(
        'rounded-md border bg-muted/50 p-3 text-xs',
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="space-y-1">
          <div className="text-muted-foreground font-medium">Parameters</div>
          <pre className="overflow-x-auto text-xs">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export type ToolOutputProps = ComponentProps<'div'> & {
  output?: React.ReactNode;
  errorText?: ToolUIPart['errorText'];
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  children,
  ...props
}: ToolOutputProps) => {
  if (!output && !errorText && !children) return null;

  return (
    <div
      className={cn(
        'mt-2 rounded-md border p-3 text-xs',
        errorText
          ? 'border-destructive bg-destructive/10'
          : 'bg-muted/50',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {errorText && (
            <div className="space-y-1">
              <div className="text-destructive font-medium">Error</div>
              <div className="text-destructive">{errorText}</div>
            </div>
          )}
          {output && (
            <div className="space-y-1">
              <div className="text-muted-foreground font-medium">Result</div>
              <div>{output}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export type ToolPart = ToolUIPart;

export const getStatusBadge = (state: ToolState) => {
  const config = getStateConfig(state);
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="gap-1">
      {state === 'input-available' && (
        <Icon className="size-3 animate-spin" />
      )}
      {state !== 'input-available' && <Icon className="size-3" />}
      {config.label}
    </Badge>
  );
};
