"use server"

import { createClient } from "@/lib/supabase/server"
import type { RedeemVoucherResult, ValidateVoucherResult, ApplyVoucherResult } from "@/types/voucher"
import type { PageCount, PaperSize } from "@/types/editor"
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation"

export async function redeemVoucher(
  voucherCode: string,
  projectId: string
): Promise<RedeemVoucherResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Fetch user profile for email confirmation
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, address, postal_code, phone_number")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { success: false, error: "User profile not found" }
  }

  // Verify project ownership and fetch project details including configuration
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, page_count, paper_size, voucher_code")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) {
    return { success: false, error: "Project not found" }
  }

  // Get page count for the project (for email)
  const { count: pageCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)

  // Normalize voucher code (uppercase, trim)
  const normalizedCode = voucherCode.trim().toUpperCase()

  if (!normalizedCode) {
    return { success: false, error: "Please enter a voucher code" }
  }

  // Find voucher
  const { data: voucher, error: voucherError } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", normalizedCode)
    .single()

  if (voucherError || !voucher) {
    return { success: false, error: "Invalid voucher code" }
  }

  // Check if already fully redeemed
  if (voucher.status === 'fully_redeemed') {
    return { success: false, error: "This voucher has already been used" }
  }

  // Validate voucher matches project configuration
  if (voucher.page_count && project.page_count && voucher.page_count !== project.page_count) {
    return {
      success: false,
      error: `This voucher is for ${voucher.page_count} pages, but your project has ${project.page_count} pages`,
    }
  }

  if (voucher.paper_size && project.paper_size && voucher.paper_size !== project.paper_size) {
    return {
      success: false,
      error: `This voucher is for ${voucher.paper_size} size, but your project is ${project.paper_size}`,
    }
  }

  // Redeem the voucher (change status to fully_redeemed)
  const { error: updateError } = await supabase
    .from("vouchers")
    .update({
      status: 'fully_redeemed',
      redeemed_by: user.id,
      redeemed_at: new Date().toISOString(),
      project_id: projectId,
    })
    .eq("code", normalizedCode)

  if (updateError) {
    return { success: false, error: "Failed to redeem voucher" }
  }

  // Update project status to completed
  await supabase
    .from("projects")
    .update({ status: "completed" })
    .eq("id", projectId)

  // Send order confirmation email
  const customerName = `${profile.first_name} ${profile.last_name}`
  const emailResult = await sendOrderConfirmationEmail({
    email: user.email || "",
    customerName,
    projectTitle: project.title,
    pageCount: pageCount || 0,
    voucherCode: normalizedCode,
    address: profile.address || "",
    postalCode: profile.postal_code || "",
    phoneNumber: profile.phone_number || "",
  })

  // Log email sending errors but don't fail the redemption
  if (!emailResult.success) {
    console.error("Failed to send order confirmation email:", emailResult.error)
  }

  return { success: true }
}

/**
 * Validate voucher code and return its configuration
 * Used during project creation to check if voucher is valid and get its page_count/paper_size
 */
export async function validateVoucherCode(
  code: string
): Promise<ValidateVoucherResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Normalize voucher code (uppercase, trim)
  const normalizedCode = code.trim().toUpperCase()

  if (!normalizedCode) {
    return { success: false, error: "Please enter a voucher code" }
  }

  // Find voucher
  const { data: voucher, error: voucherError } = await supabase
    .from("vouchers")
    .select("code, status, page_count, paper_size")
    .eq("code", normalizedCode)
    .single()

  if (voucherError || !voucher) {
    return { success: false, error: "Invalid voucher code" }
  }

  // Check if available
  if (voucher.status !== 'not_redeemed') {
    return { success: false, error: "This voucher has already been used" }
  }

  // Check if voucher has product configuration
  if (!voucher.page_count || !voucher.paper_size) {
    return { success: false, error: "This voucher is not properly configured" }
  }

  return {
    success: true,
    voucher: {
      code: voucher.code,
      page_count: voucher.page_count as PageCount,
      paper_size: voucher.paper_size as PaperSize,
    },
  }
}

/**
 * Apply voucher to project during creation
 * Sets voucher status to 'being_redeemed' and links it to the project
 */
export async function applyVoucherToProject(
  voucherCode: string,
  projectId: string
): Promise<ApplyVoucherResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Normalize voucher code
  const normalizedCode = voucherCode.trim().toUpperCase()

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("id, page_count, paper_size")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!project) {
    return { success: false, error: "Project not found" }
  }

  // Get voucher
  const { data: voucher } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", normalizedCode)
    .single()

  if (!voucher) {
    return { success: false, error: "Invalid voucher code" }
  }

  // Verify voucher is available
  if (voucher.status !== 'not_redeemed') {
    return { success: false, error: "This voucher has already been used" }
  }

  // Verify voucher matches project configuration
  if (voucher.page_count !== project.page_count) {
    return {
      success: false,
      error: `This voucher is for ${voucher.page_count} pages, but your project has ${project.page_count} pages`,
    }
  }

  if (voucher.paper_size !== project.paper_size) {
    return {
      success: false,
      error: `This voucher is for ${voucher.paper_size} size, but your project is ${project.paper_size}`,
    }
  }

  // Update voucher to being_redeemed
  const { error: updateError } = await supabase
    .from("vouchers")
    .update({
      status: 'being_redeemed',
      project_id: projectId,
      redeemed_by: user.id,
    })
    .eq("code", normalizedCode)

  if (updateError) {
    return { success: false, error: "Failed to apply voucher" }
  }

  return { success: true }
}

/**
 * Revert voucher when draft project is deleted
 * Sets voucher status back to 'not_redeemed' and clears project_id
 */
export async function revertVoucher(voucherCode: string): Promise<void> {
  const supabase = await createClient()

  // Normalize voucher code
  const normalizedCode = voucherCode.trim().toUpperCase()

  // Update voucher back to not_redeemed
  await supabase
    .from("vouchers")
    .update({
      status: 'not_redeemed',
      project_id: null,
      redeemed_by: null,
    })
    .eq("code", normalizedCode)
    .eq("status", "being_redeemed") // Only revert if it was being_redeemed
}
