export interface Track {
  album: { id: string, images: [{ url: string }], name: string }
  artists: [{ id: string, name: string }]
  disc_number: number
  duration_ms: number
  external_urls: { spotify: string }
  href: string
  id: string
  is_local: false
  name: string
  popularity: number
  preview_url: string
  track: true
  type: string
}
