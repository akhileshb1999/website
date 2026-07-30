import ReactMarkdown from "react-markdown";
import { getAboutMarkdown } from "@/lib/content";

export default function AboutPage() {
  const content = getAboutMarkdown();

  return (
    <article>
      <h1 className="font-serif text-3xl">About Me</h1>
      <div className="prose-custom mt-6">
        <ReactMarkdown
          components={{
            h2: (props) => (
              <h2 className="mt-8 font-serif text-xl" {...props} />
            ),
            p: (props) => <p className="mt-4 leading-relaxed" {...props} />,
            ul: (props) => (
              <ul className="mt-3 list-disc space-y-1 pl-5" {...props} />
            ),
            li: (props) => <li className="leading-relaxed" {...props} />,
            strong: (props) => <strong className="text-foreground" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
