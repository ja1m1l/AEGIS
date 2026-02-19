'use server'

import { createClient } from '@/utils/supabase/server';
import { RoadmapItem } from '@/data/roadmapData';

export async function getRoadmaps(): Promise<RoadmapItem[]> {
    const supabase = await createClient();

    // Fetch roadmaps along with their steps
    const { data: roadmapsWithSteps, error } = await supabase
        .from('roadmaps')
        .select(`
            *,
            roadmap_steps (
                title,
                step_order
            )
        `)
        .order('field'); // Optional ordering

    if (error) {
        console.error('Error fetching roadmaps with steps:', error);
        return [];
    }

    if (!roadmapsWithSteps) return [];

    // Transform to RoadmapItem format
    return roadmapsWithSteps.map((r: any) => ({
        id: r.id,
        title: r.title,
        field: r.field,
        color: r.color as any, // Cast to specific color type
        steps: r.roadmap_steps
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((s: any) => s.title)
    }));
}

export async function createRoadmap(roadmap: RoadmapItem) {
    const supabase = await createClient();

    const roadmapId = roadmap.id.toString();

    // 1. Insert roadmap
    const { error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
            id: roadmapId,
            title: roadmap.title,
            field: roadmap.field,
            color: roadmap.color
        });

    if (roadmapError) {
        console.error('Error creating roadmap:', roadmapError);
        throw new Error(roadmapError.message);
    }

    // 2. Insert steps
    if (roadmap.steps && roadmap.steps.length > 0) {
        const stepsData = roadmap.steps.map((step, index) => ({
            roadmap_id: roadmapId,
            title: step,
            step_order: index + 1
        }));

        const { error: stepsError } = await supabase
            .from('roadmap_steps')
            .insert(stepsData);

        if (stepsError) {
            console.error('Error creating roadmap steps:', stepsError);
            throw new Error(stepsError.message);
        }
    }

    return { success: true };
}
