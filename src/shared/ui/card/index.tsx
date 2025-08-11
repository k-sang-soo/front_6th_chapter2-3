import { HTMLAttributes, Ref } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

// 카드 컴포넌트
export const Card = ({ ref, className, ...props }: CardProps) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    />
  );
};
Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

export const CardHeader = ({ ref, className, ...props }: CardHeaderProps) => {
  return <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
};
CardHeader.displayName = 'CardHeader';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

export const CardContent = ({ ref, className, ...props }: CardContentProps) => {
  return <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />;
};
CardContent.displayName = 'CardContent';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
  className?: string;
}

export const CardTitle = ({ ref, className, ...props }: CardTitleProps) => {
  return (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
};
CardTitle.displayName = 'CardTitle';