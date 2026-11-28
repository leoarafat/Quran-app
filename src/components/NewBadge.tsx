export const NewBadge = ({ label = "নতুন" }: { label?: string }) => (
  <span className="ml-1.5 inline-block whitespace-nowrap rounded-full bg-ac px-1.5 align-middle font-sans text-[0.6875rem] font-semibold leading-5 text-on-ac">{label}</span>
);
