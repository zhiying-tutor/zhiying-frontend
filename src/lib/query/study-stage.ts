"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
  studyStageDetailSchema,
  studyStageListSchema,
  type StudyStageDetail,
  type StudyStageListItem,
} from "@/lib/api/schemas";
import { getJson } from "./utils";

export function subjectStagesQueryKey(subjectId: number) {
  return ["study-subject", subjectId, "stages"] as const;
}

export function studyStageQueryKey(stageId: number) {
  return ["study-stage", stageId] as const;
}

async function fetchSubjectStages(
  subjectId: number,
): Promise<StudyStageListItem[]> {
  return studyStageListSchema.parse(
    await getJson(`/api/study-subjects/${subjectId}/stages`),
  );
}

async function fetchStudyStage(stageId: number): Promise<StudyStageDetail> {
  return studyStageDetailSchema.parse(
    await getJson(`/api/study-stages/${stageId}`),
  );
}

export interface UseSubjectStagesOptions {
  initialData?: StudyStageListItem[];
}

export function useSubjectStages(
  subjectId: number,
  options: UseSubjectStagesOptions = {},
): UseQueryResult<StudyStageListItem[], Error> {
  return useQuery({
    queryKey: subjectStagesQueryKey(subjectId),
    queryFn: () => fetchSubjectStages(subjectId),
    initialData: options.initialData,
  });
}

export function useStudyStage(
  stageId: number,
  options: { enabled: boolean },
): UseQueryResult<StudyStageDetail, Error> {
  return useQuery({
    queryKey: studyStageQueryKey(stageId),
    queryFn: () => fetchStudyStage(stageId),
    enabled: options.enabled,
  });
}
