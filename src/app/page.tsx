import { Caixa } from "./caixa";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 bg-zinc-50 px-4 py-6 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">meiva</h1>
        <p className="text-sm text-zinc-500">Conte o que vendeu ou gastou, do seu jeito.</p>
      </header>
      <Caixa />
    </main>
  );
}
