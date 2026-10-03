// PLACEHOLDER (SPEC-00). SCR-01 + SCR-02 replace.
import { LinkButton } from "@/components/ui";
import { Logo, Penny } from "@/components/penny";
import { TAGLINE } from "@/lib/brand";

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1120px] flex-col gap-8 px-5 py-8">
      <Logo />
      <div className="flex flex-col items-start gap-6 py-12">
        <Penny mood="wave" size={140} />
        <h1 className="font-display text-display font-bold md:text-[4rem]">{TAGLINE}</h1>
        <LinkButton to="/check">Check a price</LinkButton>
      </div>
    </div>
  );
}
