import { z } from "zod";

import { serverFetch } from "@/lib/api/client";
import {
  codeVideoSchema,
  interactiveHtmlSchema,
  knowledgeVideoSchema,
  quizProblemReviewListSchema,
  studySubjectListSchema,
  type CodeVideo,
  type InteractiveHtml,
  type KnowledgeVideo,
  type QuizProblemReview,
  type StudySubject,
} from "@/lib/api/schemas";
import { proxyJson } from "@/lib/server/proxy";

const LIMIT = 5;

const kvListSchema = z.array(knowledgeVideoSchema);
const cvListSchema = z.array(codeVideoSchema);
const ihListSchema = z.array(interactiveHtmlSchema);

type SearchResults = {
  subjects: StudySubject[];
  knowledge_videos: KnowledgeVideo[];
  code_videos: CodeVideo[];
  interactive_htmls: InteractiveHtml[];
  mistakes: QuizProblemReview[];
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  return proxyJson<SearchResults>(async () => {
    if (!q) {
      return {
        subjects: [],
        knowledge_videos: [],
        code_videos: [],
        interactive_htmls: [],
        mistakes: [],
      };
    }

    const [subjects, kv, cv, ih, mistakes] = await Promise.all([
      serverFetch<StudySubject[]>("/study-subjects", {
        query: { q },
        schema: studySubjectListSchema,
      }),
      serverFetch<KnowledgeVideo[]>("/knowledge-videos", {
        query: { q },
        schema: kvListSchema,
      }),
      serverFetch<CodeVideo[]>("/code-videos", {
        query: { q },
        schema: cvListSchema,
      }),
      serverFetch<InteractiveHtml[]>("/interactive-htmls", {
        query: { q },
        schema: ihListSchema,
      }),
      serverFetch<QuizProblemReview[]>("/me/mistakes", {
        query: { q },
        schema: quizProblemReviewListSchema,
      }),
    ]);

    return {
      subjects: subjects.slice(0, LIMIT),
      knowledge_videos: kv.slice(0, LIMIT),
      code_videos: cv.slice(0, LIMIT),
      interactive_htmls: ih.slice(0, LIMIT),
      mistakes: mistakes.slice(0, LIMIT),
    };
  });
}
