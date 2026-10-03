import { DataFreshness } from "@/components/domain/DataFreshness";

export function DataNote() {
  return (
    <section className="bg-sunken py-16">
      <div className="mx-auto max-w-[1120px] px-5">
        <h2 className="text-h1 font-semibold">Where the numbers come from</h2>
        <div className="mt-4 flex max-w-[60ch] flex-col gap-4 text-body">
          <p>We track weekly shelf prices for 40 everyday groceries at four BC stores, using public price data from Project Hammer and prices collected from the stores&apos; own websites.</p>
          <p>RealDeal is a prototype. Prices can be out of date, so treat a verdict as a strong hint, not a guarantee.</p>
        </div>
        <div className="mt-4">
          <DataFreshness />
        </div>
      </div>
    </section>
  );
}
