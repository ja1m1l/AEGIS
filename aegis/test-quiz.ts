import { createClient } from "./src/utils/supabase/server";
async function test() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quizzes")
        .select(`
            *,
            registration_count:quiz_registrations(count)
        `)
        .eq("id", 1)
        .single();
    console.log(data);
    console.log(error);
}
test();
