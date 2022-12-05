export interface UserProfile {
  country: string
  display_name: string
  explicit_content: { filter_enabled: boolean, filter_locked: boolean }
  external_urls: { spotify: string }
  followers: { href: string | null, total: number }
  href: string
  id: string
  images: [{
    0: { height: string | null, url: string, width: string | null }
    height: string | null
    url: string
    width: string | null
  }]
  product: string
  type: string
  uri: string
}
