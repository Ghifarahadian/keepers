"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup`,
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Check if email confirmation is required
  // When email confirmation is enabled in Supabase:
  // - User is created but session is null (user needs to confirm email first)
  // - email_confirmed_at will be null/undefined
  // When confirmation is disabled:
  // - Both user and session are returned immediately
  const needsEmailConfirmation = !!(data.user && !data.session);

  return { data, needsEmailConfirmation };
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { data };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    address: profile?.address || null,
    postalCode: profile?.postal_code || null,
    phoneNumber: profile?.phone_number || null,
  };
}

export async function deleteAccount() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return { error: "Not authenticated" };
  }

  const userId = user.id;

  // 2. Delete all photos from storage (recursively through project folders)
  try {
    // List all project folders in user's folder
    const { data: projectFolders, error: listError } = await supabase.storage
      .from("project-photos")
      .list(`${userId}`);

    if (!listError && projectFolders && projectFolders.length > 0) {
      // For each project folder, list and delete all files inside
      for (const folder of projectFolders) {
        const folderPath = `${userId}/${folder.name}`;
        const { data: files } = await supabase.storage
          .from("project-photos")
          .list(folderPath);

        if (files && files.length > 0) {
          const filePaths = files.map((file) => `${folderPath}/${file.name}`);
          await supabase.storage.from("project-photos").remove(filePaths);
        }
      }
    }
  } catch (storageError) {
    // Log error but continue - storage can be cleaned up later
    console.error("Storage deletion error:", storageError);
  }

  // 3. Delete database records via Postgres function
  // Call database function that uses SECURITY DEFINER to delete from auth.users
  const { error: dbError } = await supabase.rpc("delete_user_account");

  if (dbError) {
    return { error: dbError.message };
  }

  // 4. Sign out and redirect
  await signOut();

  return { success: true };
}

export async function updateProfile(input: {
  firstName: string;
  lastName: string;
  address?: string;
  postalCode?: string;
  phoneNumber?: string;
}) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return { error: "Not authenticated" };
  }

  // 2. Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      address: input.address || null,
      postal_code: input.postalCode || null,
      phone_number: input.phoneNumber || null,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // 3. Revalidate path
  revalidatePath("/profile");

  return { success: true };
}
