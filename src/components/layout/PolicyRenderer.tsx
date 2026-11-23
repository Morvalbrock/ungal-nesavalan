import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
  content: string;
}

export function PolicyRenderer({ content }: Props) {
  return (
    <div className="prose-journal text-slate-700 leading-relaxed">
      <MDXRemote source={content} />
    </div>
  );
}
