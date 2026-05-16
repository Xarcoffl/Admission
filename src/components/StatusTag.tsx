type StatusTagProps = { status: string };

const styleMap: Record<string, string> = {
  Applied: 'tag applied',
  'Under Review': 'tag review',
  Selected: 'tag selected',
  Rejected: 'tag rejected',
  Waitlisted: 'tag waitlisted'
};

export default function StatusTag({ status }: StatusTagProps) {
  return <span className={styleMap[status] || 'tag applied'}>{status}</span>;
}
