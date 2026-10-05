import "react";

type MathProps = import("react").DetailedHTMLProps<
  import("react").HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  display?: "block" | "inline";
  columnalign?: string;
  stretchy?: "true" | "false";
  width?: string;
  lspace?: string;
  rspace?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      math: MathProps;
      mrow: MathProps;
      mi: MathProps;
      mn: MathProps;
      mo: MathProps;
      mtext: MathProps;
      msub: MathProps;
      msup: MathProps;
      mfrac: MathProps;
      munder: MathProps;
      mtable: MathProps;
      mtr: MathProps;
      mtd: MathProps;
      mspace: MathProps;
    }
  }
}
