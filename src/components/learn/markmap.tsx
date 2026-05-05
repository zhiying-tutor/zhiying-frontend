"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

const transformer = new Transformer();

export function MarkmapView({ markdown }: { markdown: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const { root } = transformer.transform(markdown);
    const mm = Markmap.create(svgRef.current, undefined, root);
    return () => {
      mm.destroy();
    };
  }, [markdown]);

  return <svg ref={svgRef} className="h-full w-full" />;
}
