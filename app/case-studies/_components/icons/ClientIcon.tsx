type Props = React.HTMLAttributes<HTMLSpanElement> & {
  className: string;
  title?: string;
};

export default function ClientIcon({ className, title, ...rest }: Props) {
  return (
    <span className={className} title={title} aria-hidden="true" {...rest} />
  );
}
