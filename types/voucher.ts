import type { PageCount, PaperSize } from './editor'

export interface Voucher {
  id: string
  code: string
  status: 'not_redeemed' | 'being_redeemed' | 'fully_redeemed'
  page_count: PageCount | null
  paper_size: PaperSize | null
  project_id: string | null
  redeemed_by: string | null
  redeemed_at: string | null
  created_at: string
  // Deprecated - kept for backward compatibility during migration
  is_redeemed?: boolean
}

export interface RedeemVoucherResult {
  success: boolean
  error?: string
}

export interface ValidateVoucherResult {
  success: boolean
  voucher?: {
    code: string
    page_count: PageCount
    paper_size: PaperSize
  }
  error?: string
}

export interface ApplyVoucherResult {
  success: boolean
  error?: string
}
