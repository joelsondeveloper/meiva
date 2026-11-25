/** Wordmark: "MEI" em 700 + "va" em 400, na cor da marca. */
export function Marca({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`text-primaria ${className}`}>
      <span className="font-bold">MEI</span>
      <span className="font-normal">va</span>
    </span>
  );
}
